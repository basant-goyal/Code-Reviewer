"""
gemini_service.py — Core AI Service Layer
==========================================
WHY THIS FILE EXISTS:
    All Gemini API logic lives here and ONLY here.
    The API router doesn't know what model we use or how retries work.
    If Google releases a new SDK tomorrow, we only change this file.

HOW IT INTERACTS:
    - Called by the API router (review.py) via FastAPI's dependency injection.
    - Imports the prompt builder from prompts/review_prompt.py.
    - Raises typed exceptions from utils/exceptions.py.
    - Parses the AI's JSON into a CodeReviewResponse Pydantic model.

KEY CONCEPTS:

1. ASYNC:
    The Gemini SDK supports `generate_content_async()` — a proper coroutine.
    We use `await` so the FastAPI event loop isn't blocked while waiting for
    the AI response. This lets the server handle other requests concurrently.

2. JSON MODE:
    Setting `response_mime_type="application/json"` in GenerationConfig tells
    Gemini to produce a raw JSON string — no markdown fences, no preamble.
    This eliminates the need to strip ```json ... ``` wrappers manually.

3. RETRY LOGIC:
    We implement simple exponential back-off: wait 2s, then 4s, then give up.
    This handles transient network blips without hammering the API.

4. DEPENDENCY INJECTION:
    The service is instantiated once at startup via a FastAPI `Depends()` call.
    This means one shared Gemini client object rather than one per request.
"""

import asyncio
import json
import random
import re
import time

import google.generativeai as genai
from pydantic import ValidationError

from app.config.settings import settings
from app.prompts.review_prompt import build_review_prompt
from app.schemas.request import CodeReviewRequest
from app.schemas.response import CodeReviewResponse
from app.utils.exceptions import (
    GeminiAPIError,
    GeminiRateLimitError,
    GeminiTimeoutError,
    InvalidAIResponseError,
)
from app.utils.logger import logger


class GeminiService:
    """
    Handles all communication with the Google Gemini API.

    Instantiated once at app startup and shared across requests
    through FastAPI's dependency injection system.
    """

    def __init__(self) -> None:
        # Configure the SDK with our API key.
        genai.configure(api_key=settings.GEMINI_API_KEY)

        # Create the model with JSON output mode enabled.
        # response_mime_type="application/json" is the key to reliable JSON output.
        self._model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.3,      # Lower = more deterministic/consistent output.
                max_output_tokens=8192,
            ),
        )

        # In-memory sliding window rate limiter state
        self._request_timestamps: list[float] = []
        self._rate_limit_lock = asyncio.Lock()
        # Max requests allowed in a 60-second window (Gemini free tier limit is 15 RPM)
        self._max_rpm = 12

        logger.info(f"GeminiService initialised with model: {settings.GEMINI_MODEL}")

    async def _throttle_request(self) -> None:
        """
        Enforces local sliding-window rate limiting to prevent bursting
        over Google Gemini's Free Tier quota (15 RPM).
        """
        async with self._rate_limit_lock:
            now = time.time()
            # Retain only timestamps from the last 60 seconds
            self._request_timestamps = [
                ts for ts in self._request_timestamps if now - ts < 60
            ]

            if len(self._request_timestamps) >= self._max_rpm:
                oldest_ts = self._request_timestamps[0]
                wait_time = 60.0 - (now - oldest_ts) + 0.5
                if wait_time > 0:
                    if wait_time > 15.0:
                        logger.warning(f"Local rate limiter threshold met ({len(self._request_timestamps)} reqs in 60s). Rejecting.")
                        raise GeminiRateLimitError(
                            "High volume of requests detected. Please wait a few seconds before trying again.",
                            retry_after=int(wait_time),
                        )
                    logger.info(f"Local rate limiter: pausing {wait_time:.2f}s to respect Gemini API 15 RPM limit...")
                    await asyncio.sleep(wait_time)
                    # Refresh timestamp after sleeping
                    now = time.time()

            self._request_timestamps.append(now)

    async def review_code(self, request: CodeReviewRequest) -> CodeReviewResponse:
        """
        Main entry point. Builds the prompt, calls Gemini, and returns
        a validated CodeReviewResponse.

        Args:
            request: The validated inbound request from the API layer.

        Returns:
            A fully validated CodeReviewResponse Pydantic model.

        Raises:
            GeminiTimeoutError: If the API doesn't respond in time.
            GeminiRateLimitError: If API rate limits (429) are reached.
            GeminiAPIError:     If the API call fails for any reason.
            InvalidAIResponseError: If the response can't be parsed.
        """

        prompt = build_review_prompt(
            code=request.code,
            language=request.language,
            review_categories=request.review_categories,
        )

        logger.info(
            f"Sending review request | language={request.language} "
            f"| code_length={len(request.code)} chars"
        )

        raw_text = await self._call_with_retry(prompt)
        return self._parse_response(raw_text)

    async def _call_with_retry(self, prompt: str, max_retries: int = 3) -> str:
        """
        Calls the Gemini API with exponential back-off and jitter retry.

        Retry schedule for rate limits / transient errors:
        - attempt 1: wait 3s + jitter
        - attempt 2: wait 6s + jitter
        - attempt 3: raise GeminiRateLimitError / GeminiAPIError
        """

        last_error: Exception | None = None

        for attempt in range(1, max_retries + 1):
            try:
                # Apply local rate limiting before executing request
                await self._throttle_request()

                logger.debug(f"Gemini API attempt {attempt}/{max_retries}")

                # asyncio.wait_for enforces a hard timeout on the coroutine.
                response = await asyncio.wait_for(
                    self._model.generate_content_async(prompt),
                    timeout=settings.REQUEST_TIMEOUT_SECONDS,
                )

                text = response.text
                logger.debug(f"Raw Gemini response length: {len(text)} chars")
                return text

            except asyncio.TimeoutError:
                logger.warning(f"Gemini API timed out on attempt {attempt}")
                last_error = GeminiTimeoutError(
                    f"Gemini API timed out after {settings.REQUEST_TIMEOUT_SECONDS}s"
                )
                # Don't retry timeouts — if it timed out once it will again.
                raise last_error

            except GeminiRateLimitError:
                # Don't wrap our local rate limit error
                raise

            except Exception as exc:
                error_str = str(exc).lower()

                # Check for rate limit / quota / 429 errors from Google Gemini API
                is_rate_limit = (
                    "429" in error_str
                     or "resource_exhausted" in error_str
                     or "toomanyrequests" in error_str
                     or "quota" in error_str
                     or "rate limit" in error_str
                )

                if is_rate_limit:
                    logger.warning(f"Gemini API 429 Rate Limit on attempt {attempt}/{max_retries}: {exc}")
                    last_error = GeminiRateLimitError(
                        "Gemini API rate limit reached (Free tier). Please wait a few seconds and try again.",
                        retry_after=10,
                    )
                    if attempt < max_retries:
                        # Exponential backoff with jitter: 3s, 6s + random float
                        wait_seconds = (3 * attempt) + random.uniform(0.5, 1.5)
                        logger.info(f"Backing off rate limit for {wait_seconds:.2f}s before retry...")
                        await asyncio.sleep(wait_seconds)
                        continue
                    else:
                        raise last_error

                # Auth errors are not retryable — fail fast.
                if "api_key" in error_str or "permission" in error_str or "403" in error_str:
                    logger.error(f"Gemini auth error: {exc}")
                    raise GeminiAPIError(
                        "Invalid or missing API key. Check your GEMINI_API_KEY.", exc
                    )

                logger.warning(f"Gemini API error on attempt {attempt}: {exc}")
                last_error = GeminiAPIError(str(exc), exc)

                if attempt < max_retries:
                    wait_seconds = (2 ** (attempt - 1)) + random.uniform(0.1, 0.5)
                    logger.info(f"Retrying in {wait_seconds:.2f}s...")
                    await asyncio.sleep(wait_seconds)

        raise last_error  # All retries exhausted.

    def _parse_response(self, raw_text: str) -> CodeReviewResponse:
        """
        Parses the Gemini JSON string into a validated CodeReviewResponse.

        Even with JSON mode enabled, we defensively strip markdown fences
        in case an older model version wraps the output.
        """

        # Defensive strip of markdown code fences (shouldn't happen in JSON mode).
        cleaned = raw_text.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*\n?", "", cleaned)
            cleaned = re.sub(r"\n?```\s*$", "", cleaned)
            cleaned = cleaned.strip()

        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            logger.error(f"JSON parse failed. Raw response:\n{raw_text[:500]}")
            raise InvalidAIResponseError(raw_text) from exc

        try:
            result = CodeReviewResponse.model_validate(data)
            logger.info(
                f"Review complete | score={result.overall_score} "
                f"| bugs={len(result.bugs)} | security={len(result.security)}"
            )
            return result

        except ValidationError as exc:
            logger.error(f"Response schema mismatch: {exc}")
            raise InvalidAIResponseError(raw_text) from exc


# ─── Dependency factory ───────────────────────────────────────────────────────

# FastAPI's Depends() system will call this function to provide a GeminiService
# to any endpoint that declares it in its function signature.
# Using a single shared instance avoids re-configuring the SDK on every request.

_gemini_service_instance: GeminiService | None = None


def get_gemini_service() -> GeminiService:
    """
    Dependency provider for GeminiService.

    FastAPI calls this once per application lifecycle (effectively a singleton
    because Python module-level state persists across requests).
    """
    global _gemini_service_instance
    if _gemini_service_instance is None:
        _gemini_service_instance = GeminiService()
    return _gemini_service_instance
