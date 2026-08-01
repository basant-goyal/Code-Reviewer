"""
main.py — FastAPI Application Factory
======================================
WHY THIS FILE EXISTS:
    This is the entry point of the entire backend.
    uvicorn starts the server by pointing at `app.main:app`.
    It is intentionally minimal — it wires things together but contains no business logic.

HOW IT INTERACTS:
    - Imports and mounts the review router from api/v1/review.py.
    - Registers CORS middleware using origins from settings.
    - Registers global exception handlers for our custom error types.
    - Pre-initialises the GeminiService on startup via a lifespan event.

FASTAPI CONCEPTS:

1. lifespan context manager:
    Replaces the old @app.on_event("startup") pattern.
    Code before `yield` runs at startup; code after `yield` runs at shutdown.
    We use it to initialise the GeminiService once (not per request).

2. CORSMiddleware:
    Browsers block cross-origin requests by default.
    This middleware adds the Access-Control-Allow-Origin headers so our
    React frontend (running on port 5173) can call the backend (port 8000).

3. exception_handler:
    Global handler that catches a specific exception type anywhere in the app
    and converts it to a JSON response. Cleaner than try/except in every route.

4. app.include_router:
    Mounts the review router with a URL prefix and tags for API docs grouping.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.review import router as review_router
from app.config.settings import settings
from app.services.gemini_service import get_gemini_service
from app.utils.exceptions import CodeReviewerBaseError, to_http_exception
from app.utils.logger import logger


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown logic.
    Runs once when the server starts, not once per request.
    """
    logger.info("Starting AI Code Reviewer backend...")

    # Warm up the Gemini service — this validates the API key exists in config.
    # If GEMINI_API_KEY is missing from .env, settings.py raises here at startup.
    get_gemini_service()

    logger.info(f"CORS allowed origins: {settings.allowed_origins_list}")
    logger.info("Backend ready. Listening for requests.")

    yield  # ← Server runs while we're here.

    logger.info("Shutting down AI Code Reviewer backend.")


# ─── App factory ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="AI Code Reviewer",
    description=(
        "A production-quality AI-powered code review API. "
        "Submit code, get structured feedback on bugs, security, performance, and more."
    ),
    version="1.0.0",
    docs_url="/docs",       # Swagger UI — available at http://localhost:8000/docs
    redoc_url="/redoc",     # ReDoc — available at http://localhost:8000/redoc
    lifespan=lifespan,
)


# ─── Middleware ────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],    # Allow GET, POST, OPTIONS, etc.
    allow_headers=["*"],    # Allow Content-Type, Authorization, etc.
)


# ─── Global exception handlers ────────────────────────────────────────────────

@app.exception_handler(CodeReviewerBaseError)
async def handle_domain_error(request: Request, exc: CodeReviewerBaseError):
    """
    Catches any CodeReviewerBaseError that bubbles up unhandled from any route.
    Converts it to the right HTTP status + JSON body.
    """
    http_exc = to_http_exception(exc)
    logger.warning(f"Domain error: {exc} → HTTP {http_exc.status_code}")
    return JSONResponse(
        status_code=http_exc.status_code,
        content={"detail": http_exc.detail},
    )


@app.exception_handler(Exception)
async def handle_unexpected_error(request: Request, exc: Exception):
    """Catch-all for any truly unexpected error. Logs full traceback."""
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."},
    )


# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(
    review_router,
    prefix="/api/v1/review",
    tags=["Code Review"],
)


# ─── Root ─────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint — useful as a quick sanity check."""
    return {
        "message": "AI Code Reviewer API",
        "version": "1.0.0",
        "docs": "/docs",
    }
