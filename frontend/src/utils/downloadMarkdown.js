/*
 * downloadMarkdown.js — Export Review as Markdown
 * ==================================================
 * WHY THIS FILE EXISTS:
 *   Users may want to save a review, share it, or include it in a PR comment.
 *   This utility serialises the CodeReviewResponse into a Markdown document
 *   and triggers a browser file download — no server needed.
 *
 * HOW IT WORKS:
 *   1. Build a Markdown string from the review data.
 *   2. Create a Blob (in-memory file) with text/markdown MIME type.
 *   3. Create a temporary <a> tag pointing at the blob URL.
 *   4. Programmatically click it to trigger the download.
 *   5. Clean up the URL to free memory.
 */

export function downloadReviewMarkdown(review, language) {
  const {
    summary, overall_score, time_complexity, space_complexity,
    bugs, security, suggestions, refactored_code, interview_questions,
  } = review

  const lines = []
  const ts = new Date().toLocaleString()

  lines.push(`# AI Code Review Report`)
  lines.push(`\n> Generated on ${ts} | Language: ${language} | Score: ${overall_score}/10\n`)

  lines.push(`## 📋 Summary\n`)
  lines.push(`${summary}\n`)

  lines.push(`## ⏱ Complexity\n`)
  lines.push(`| Dimension | Notation |`)
  lines.push(`|-----------|---------|`)
  lines.push(`| Time  | \`${time_complexity}\` |`)
  lines.push(`| Space | \`${space_complexity}\` |\n`)

  if (bugs?.length) {
    lines.push(`## 🐛 Bugs (${bugs.length})\n`)
    bugs.forEach((b, i) => {
      lines.push(`### ${i + 1}. ${b.title} — \`${b.severity}\``)
      if (b.line_hint) lines.push(`**Location:** ${b.line_hint}`)
      lines.push(`\n${b.description}\n`)
    })
  }

  if (security?.length) {
    lines.push(`## 🔒 Security Issues (${security.length})\n`)
    security.forEach((s, i) => {
      lines.push(`### ${i + 1}. ${s.title} — \`${s.severity}\``)
      lines.push(`\n${s.description}`)
      lines.push(`\n**Recommendation:** ${s.recommendation}\n`)
    })
  }

  if (suggestions?.length) {
    lines.push(`## 💡 Suggestions (${suggestions.length})\n`)
    suggestions.forEach((s, i) => {
      lines.push(`### ${i + 1}. ${s.title} [\`${s.category}\`]`)
      lines.push(`\n${s.description}\n`)
    })
  }

  if (refactored_code) {
    lines.push(`## ✨ Refactored Code\n`)
    lines.push(`\`\`\`${language}`)
    lines.push(refactored_code)
    lines.push(`\`\`\`\n`)
  }

  if (interview_questions?.length) {
    lines.push(`## 🎤 Interview Questions\n`)
    interview_questions.forEach((q, i) => {
      lines.push(`### ${i + 1}. ${q.question}`)
      if (q.hint) lines.push(`\n> **Hint:** ${q.hint}`)
      lines.push('')
    })
  }

  const markdown = lines.join('\n')
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url  = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `code-review-${language}-${Date.now()}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
