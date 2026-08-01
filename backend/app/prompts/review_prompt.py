"""
review_prompt.py — Prompt Engineering
=======================================
WHY THIS FILE EXISTS:
    The quality of an AI response is ENTIRELY determined by the quality of the prompt.
    Keeping the prompt in its own file means:
    - Iterating on prompt wording never touches service or API logic.
    - The prompt can be version-controlled, reviewed, and A/B tested independently.
    - Students can learn prompt engineering patterns here without noise.

HOW IT INTERACTS:
    - GeminiService imports `build_review_prompt()` and calls it before every API call.
    - It reads SUPPORTED_LANGUAGES and ALL_REVIEW_CATEGORIES from the request schema
      to keep the list of valid values in one place (no duplication).

PROMPT ENGINEERING TECHNIQUES USED:
    1. Role assignment       — "You are an expert senior software engineer..."
                               This primes the model to respond at a high technical level.
    2. Task decomposition    — Breaks the review into explicit numbered steps so the model
                               doesn't miss any category.
    3. Hard output contract  — The prompt contains the EXACT JSON schema with field names,
                               types, and example values. Reduces hallucination significantly.
    4. Negative constraints  — "Return ONLY the JSON object. No markdown. No explanation."
                               This prevents the model from wrapping JSON in ```json blocks.
    5. Few-shot hints        — Inline examples for severity values and complexity notation.
    6. Category filtering    — Only the categories the user selected are requested,
                               keeping responses focused and tokens cheap.
"""

from app.schemas.request import SUPPORTED_LANGUAGES


# Human-readable display names for the language identifiers.
LANGUAGE_DISPLAY = {
    "python": "Python",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "java": "Java",
    "cpp": "C++",
    "csharp": "C#",
}


def build_review_prompt(code: str, language: str, review_categories: list[str]) -> str:
    """
    Constructs the full prompt string to send to Gemini.

    Args:
        code:               The raw source code submitted by the user.
        language:           Normalised language identifier (e.g. "python").
        review_categories:  The subset of categories the user wants reviewed.

    Returns:
        A multi-line string prompt that instructs Gemini to return valid JSON.
    """

    lang_display = LANGUAGE_DISPLAY.get(language, language.capitalize())

    # Build a human-readable list of what to focus on.
    category_lines = "\n".join(
        f"  - {cat.replace('_', ' ').title()}" for cat in review_categories
    )

    # ── The prompt ─────────────────────────────────────────────────────────────
    # Note: we use triple-quotes and an f-string.
    # The curly-braces in the JSON schema example must be escaped as {{ }} so
    # Python doesn't treat them as f-string placeholders.
    prompt = f"""You are an expert senior software engineer and code reviewer with 15+ years of experience.
Your task is to thoroughly analyse the {lang_display} code provided below and return a structured code review.

═══════════════════════════════════════
CODE TO REVIEW ({lang_display}):
═══════════════════════════════════════
{code}
═══════════════════════════════════════

REVIEW FOCUS AREAS:
{category_lines}

YOUR TASK:
Perform a deep, professional code review covering all the focus areas above. Specifically:
1. Identify ALL logical errors, off-by-one errors, null/undefined issues, and runtime bugs.
2. Identify security vulnerabilities (SQL injection, XSS, secrets in code, insecure defaults, etc.).
3. Analyse algorithmic time and space complexity using Big-O notation.
4. Suggest concrete optimisations for performance, readability, and maintainability.
5. Rewrite the code in a cleaner, more idiomatic style — DO NOT just add comments.
6. Generate exactly 3 insightful technical interview questions that a senior engineer would ask
   about THIS specific code (not generic questions).

OUTPUT FORMAT — CRITICAL RULES:
- Return ONLY a single valid JSON object. No markdown. No code fences. No explanation text.
- All string values must be properly escaped.
- The JSON must exactly match the schema below. Do not add or remove fields.
- For empty lists, return [] — never null.
- severity must be one of: "low", "medium", "high", "critical"
- overall_score must be an integer between 1 and 10.

JSON SCHEMA (return exactly this structure):
{{
  "summary": "<2-4 sentence executive summary of overall code quality>",
  "overall_score": <integer 1-10, where 1=broken/dangerous, 10=production-ready>,
  "time_complexity": "<Big-O notation with brief explanation, e.g. O(n log n) — sorting dominates>",
  "space_complexity": "<Big-O notation with brief explanation, e.g. O(n) — stores all elements>",
  "bugs": [
    {{
      "title": "<short bug title>",
      "description": "<detailed explanation of the bug and why it is wrong>",
      "line_hint": "<e.g. 'Line 12' or 'function foo()' — omit if unknown>",
      "severity": "<low|medium|high|critical>"
    }}
  ],
  "security": [
    {{
      "title": "<short vulnerability title>",
      "description": "<what the vulnerability is and how it can be exploited>",
      "severity": "<low|medium|high|critical>",
      "recommendation": "<concrete fix recommendation>"
    }}
  ],
  "suggestions": [
    {{
      "title": "<short suggestion title>",
      "description": "<detailed improvement suggestion>",
      "category": "<performance|readability|best_practice|general>"
    }}
  ],
  "refactored_code": "<the complete refactored {lang_display} code as a single escaped string>",
  "interview_questions": [
    {{
      "question": "<a specific, insightful technical question about this code>",
      "hint": "<a brief hint or what a good answer should cover>"
    }}
  ]
}}

Remember: Return ONLY the JSON. No other text before or after it.
"""

    return prompt
