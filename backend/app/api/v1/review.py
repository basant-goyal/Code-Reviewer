"""
review.py — Code Review API Router
=====================================
WHY THIS FILE EXISTS:
    FastAPI encourages splitting endpoints into routers by domain.
    This router owns everything under /api/v1/review.
    main.py simply mounts it — keeping main.py clean and minimal.

HOW IT INTERACTS:
    - Receives validated CodeReviewRequest from FastAPI automatically.
    - Gets a GeminiService via Depends(get_gemini_service) — dependency injection.
    - Returns a CodeReviewResponse which FastAPI auto-serialises to JSON.

FASTAPI CONCEPTS:

1. APIRouter:
    A mini-app that groups related endpoints. Mounted onto the main app with
    a prefix so all routes here start with /api/v1/review.

2. Depends():
    FastAPI's dependency injection system. When a request arrives, FastAPI calls
    `get_gemini_service()` and passes the result as `service`.
    This means: endpoints don't create their own service instances.

3. response_model:
    Tells FastAPI what the response shape looks like. FastAPI uses this to:
    - Serialize the return value to JSON automatically.
    - Filter out any extra fields not in the model (security best practice).
    - Generate accurate OpenAPI documentation.

4. status_code=200:
    Explicit HTTP status code for success. POST could return 201, but
    since we're not creating a persistent resource, 200 is correct.
"""

from fastapi import APIRouter, Depends, HTTPException

from app.schemas.request import CodeReviewRequest
from app.schemas.response import CodeReviewResponse
from app.services.gemini_service import GeminiService, get_gemini_service
from app.utils.exceptions import CodeReviewerBaseError, to_http_exception
from app.utils.logger import logger


router = APIRouter()


@router.post(
    "/",
    response_model=CodeReviewResponse,
    status_code=200,
    summary="Review Code with AI",
    description=(
        "Submit source code and receive a structured AI-powered code review "
        "including bugs, security issues, complexity analysis, and suggestions."
    ),
)
async def review_code(
    request: CodeReviewRequest,
    service: GeminiService = Depends(get_gemini_service),
) -> CodeReviewResponse:
    """
    POST /api/v1/review

    Body: CodeReviewRequest (JSON)
    Returns: CodeReviewResponse (JSON)

    FastAPI automatically:
    - Parses and validates the request body against CodeReviewRequest.
    - Returns a 422 if any field is invalid (before this function runs).
    - Serialises the returned CodeReviewResponse to JSON.
    """

    logger.info(f"Review request received | language={request.language}")

    try:
        result = await service.review_code(request)
        return result

    except CodeReviewerBaseError as exc:
        # Convert our domain exceptions to proper HTTP errors.
        raise to_http_exception(exc)

    except Exception as exc:
        # Catch-all for unexpected errors — log them but don't leak details.
        logger.error(f"Unexpected error during code review: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")


@router.get(
    "/health",
    summary="Health Check",
    description="Returns OK if the review service is running.",
)
async def health_check() -> dict:
    """GET /api/v1/review/health — simple liveness probe."""
    return {"status": "ok", "service": "AI Code Reviewer"}
