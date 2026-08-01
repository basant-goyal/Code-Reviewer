"""
request.py — Inbound Request Schema
=====================================
WHY THIS FILE EXISTS:
    Defines exactly what the frontend must send to the API.
    Pydantic validates the incoming JSON automatically — if the client
    sends a missing or wrong-typed field, FastAPI returns a 422 error
    before the request ever reaches our code.

HOW IT INTERACTS:
    - Used as the body type in the POST /api/v1/review endpoint.
    - Passed directly into GeminiService.review_code().
    - The `language` field is validated against a fixed set of supported values.

KEY CONCEPTS:
    - Pydantic v2 `model_validator`: runs extra validation after field-level checks.
    - `Field(...)`: the `...` means the field is REQUIRED (no default).
    - `Field(min_length=10)`: rejects requests with trivially short code snippets.
"""

from pydantic import BaseModel, Field, model_validator
from typing import Annotated


# Supported languages — defined once so we can use it in validation AND
# in the prompt template without repeating ourselves.
SUPPORTED_LANGUAGES = {
    "python",
    "javascript",
    "typescript",
    "java",
    "cpp",
    "csharp",
}

# All review categories the model knows how to assess.
ALL_REVIEW_CATEGORIES = [
    "code_quality",
    "bugs",
    "security",
    "performance",
    "readability",
    "best_practices",
    "time_complexity",
    "space_complexity",
    "edge_cases",
    "suggested_improvements",
]


class CodeReviewRequest(BaseModel):
    """
    The JSON body the frontend POSTs to /api/v1/review.

    Example payload:
        {
            "code": "def add(a, b): return a + b",
            "language": "python",
            "review_categories": ["bugs", "performance"]
        }
    """

    code: Annotated[str, Field(min_length=10, max_length=20_000)]
    # min_length=10: prevents accidental empty or trivial submissions.
    # max_length=20_000: prevents abuse / oversized prompts hitting the API.

    language: str = Field(
        ...,
        description=f"One of: {', '.join(sorted(SUPPORTED_LANGUAGES))}",
    )

    review_categories: list[str] = Field(
        default=ALL_REVIEW_CATEGORIES,
        description="Subset of review categories to include in the analysis.",
    )

    @model_validator(mode="after")
    def validate_language_and_categories(self) -> "CodeReviewRequest":
        """
        Runs AFTER individual fields are validated.
        Checks that language is supported and all category names are valid.
        """
        if self.language.lower() not in SUPPORTED_LANGUAGES:
            raise ValueError(
                f"Unsupported language '{self.language}'. "
                f"Supported: {', '.join(sorted(SUPPORTED_LANGUAGES))}"
            )
        self.language = self.language.lower()

        invalid = set(self.review_categories) - set(ALL_REVIEW_CATEGORIES)
        if invalid:
            raise ValueError(
                f"Unknown review categories: {invalid}. "
                f"Valid: {ALL_REVIEW_CATEGORIES}"
            )

        return self
