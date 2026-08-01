"""
exceptions.py — Custom Exception Hierarchy
===========================================
WHY THIS FILE EXISTS:
    Using Python's generic Exception class everywhere makes error handling messy.
    Custom exceptions let you:
    - Catch specific error types at the API layer and return the right HTTP status.
    - Log meaningful messages without parsing generic error strings.
    - Make the codebase self-documenting ("oh, a GeminiAPIError means the key is bad").

HOW IT INTERACTS:
    - GeminiService raises these exceptions when things go wrong.
    - The FastAPI exception handlers in main.py catch them and convert
      them into proper HTTP responses (400, 500, 503, 504, etc.).

FASTAPI CONCEPT — Exception Handlers:
    FastAPI lets you register a function to handle a specific exception type:
        @app.exception_handler(GeminiAPIError)
        async def handle_gemini_error(request, exc):
            return JSONResponse(status_code=503, content={"detail": str(exc)})
    This is cleaner than try/except blocks in every endpoint.
"""

from fastapi import HTTPException


class CodeReviewerBaseError(Exception):
    """Base class for all custom errors in this application."""
    pass


class EmptyCodeError(CodeReviewerBaseError):
    """Raised when the submitted code is empty or too short to review."""
    pass


class UnsupportedLanguageError(CodeReviewerBaseError):
    """Raised when the requested programming language is not supported."""
    def __init__(self, language: str):
        super().__init__(f"Unsupported language: '{language}'")
        self.language = language


class GeminiAPIError(CodeReviewerBaseError):
    """
    Raised when the Gemini API call fails.
    Could be: invalid API key, quota exceeded, network error, etc.
    """
    def __init__(self, message: str, original_error: Exception | None = None):
        super().__init__(message)
        self.original_error = original_error


class GeminiRateLimitError(CodeReviewerBaseError):
    """Raised when Google Gemini API rate limits or quota (HTTP 429 / ResourceExhausted) are reached."""
    def __init__(self, message: str = "Gemini API rate limit exceeded. Please wait a moment before trying again.", retry_after: int = 10):
        super().__init__(message)
        self.retry_after = retry_after


class GeminiTimeoutError(CodeReviewerBaseError):
    """Raised when the Gemini API does not respond within REQUEST_TIMEOUT_SECONDS."""
    pass


class InvalidAIResponseError(CodeReviewerBaseError):
    """
    Raised when the AI returns a response that cannot be parsed as valid JSON
    or doesn't match the CodeReviewResponse schema.
    This shouldn't happen with JSON mode enabled, but it's a safety net.
    """
    def __init__(self, raw_response: str):
        super().__init__("AI returned an invalid or unparseable response.")
        self.raw_response = raw_response


# ─── HTTP exception factories ─────────────────────────────────────────────────
# These convert our custom errors into FastAPI HTTPExceptions with proper
# status codes and user-friendly messages.

def to_http_exception(error: CodeReviewerBaseError) -> HTTPException:
    """Maps a custom domain error to the appropriate HTTP status code."""

    if isinstance(error, EmptyCodeError):
        return HTTPException(status_code=400, detail="Code cannot be empty.")

    if isinstance(error, UnsupportedLanguageError):
        return HTTPException(
            status_code=400,
            detail=f"Unsupported language: '{error.language}'. "
                   "Use: python, javascript, typescript, java, cpp, csharp.",
        )

    if isinstance(error, GeminiRateLimitError):
        return HTTPException(
            status_code=429,
            detail=str(error),
            headers={"Retry-After": str(error.retry_after)},
        )

    if isinstance(error, GeminiTimeoutError):
        return HTTPException(
            status_code=504,
            detail="The AI service timed out. Please try again with a shorter code snippet.",
        )

    if isinstance(error, GeminiAPIError):
        return HTTPException(
            status_code=503,
            detail="The AI service is temporarily unavailable. Please check your API key or try again later.",
        )

    if isinstance(error, InvalidAIResponseError):
        return HTTPException(
            status_code=502,
            detail="The AI returned an unexpected response format. Please try again.",
        )

    # Fallback for any unhandled custom error.
    return HTTPException(status_code=500, detail="An internal error occurred.")
