"""
response.py — Outbound Response Schema
========================================
WHY THIS FILE EXISTS:
    Defines the exact shape of the JSON we send back to the frontend.
    This acts as a contract: the AI must return data that fits this shape,
    and FastAPI will serialise our Python object into this JSON automatically.

HOW IT INTERACTS:
    - GeminiService parses the raw AI text into this model.
    - The API router declares this as its `response_model`, so FastAPI
      filters the output — only fields defined here are ever sent to clients.
    - The frontend TypeScript types mirror these field names exactly.

KEY CONCEPT — Nested models:
    We use small sub-models (Bug, SecurityIssue, Suggestion, InterviewQuestion)
    instead of plain dicts so that Pydantic can validate each nested object
    and IDEs can provide autocompletion.
"""

from pydantic import BaseModel, Field


# ─── Sub-models ───────────────────────────────────────────────────────────────

class Bug(BaseModel):
    """A single logical or runtime bug found in the code."""
    title: str
    description: str
    line_hint: str | None = None   # e.g. "Line 12" — optional because AI may not always know.
    severity: str = "medium"       # low | medium | high


class SecurityIssue(BaseModel):
    """A security vulnerability or bad practice."""
    title: str
    description: str
    severity: str = "medium"       # low | medium | high | critical
    recommendation: str


class Suggestion(BaseModel):
    """An improvement suggestion that isn't strictly a bug."""
    title: str
    description: str
    category: str = "general"      # performance | readability | best_practice | general


class InterviewQuestion(BaseModel):
    """A technical interview question generated from the submitted code."""
    question: str
    hint: str | None = None


# ─── Top-level response ───────────────────────────────────────────────────────

class CodeReviewResponse(BaseModel):
    """
    The full review returned to the frontend.

    Every field has a sensible default so that partial AI responses
    don't cause a 500 — we degrade gracefully.
    """

    summary: str = Field(
        ...,
        description="A 2–4 sentence executive summary of the code quality.",
    )

    overall_score: int = Field(
        ...,
        ge=1,
        le=10,
        description="Score from 1 (terrible) to 10 (production-ready).",
    )

    time_complexity: str = Field(
        ...,
        description="Big-O time complexity, e.g. O(n log n).",
    )

    space_complexity: str = Field(
        ...,
        description="Big-O space complexity, e.g. O(n).",
    )

    bugs: list[Bug] = Field(
        default_factory=list,
        description="List of detected bugs or logical errors.",
    )

    security: list[SecurityIssue] = Field(
        default_factory=list,
        description="List of security vulnerabilities or bad practices.",
    )

    suggestions: list[Suggestion] = Field(
        default_factory=list,
        description="General improvement suggestions.",
    )

    refactored_code: str = Field(
        ...,
        description="A cleaner, improved version of the submitted code.",
    )

    interview_questions: list[InterviewQuestion] = Field(
        default_factory=list,
        max_length=3,
        description="Up to 3 interview questions based on this code.",
    )
