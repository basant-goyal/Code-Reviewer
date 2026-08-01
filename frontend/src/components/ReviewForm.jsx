import { useState } from 'react'
import toast from 'react-hot-toast'
import { Zap, RotateCcw, ChevronDown } from 'lucide-react'
import CodeEditor from './CodeEditor'

/*
 * ReviewForm.jsx — Main Input Form
 * ==================================
 * WHY THIS FILE EXISTS:
 *   Manages form state (code, language, selected categories) locally.
 *   Calls the onSubmit callback (from useCodeReview) when the user clicks Review.
 *   Delegates rendering to CodeEditor.
 *
 * REACT CONCEPT — Lifting state up:
 *   The form owns its input state (code, language, categories).
 *   The result state lives in the parent (HomePage via useCodeReview).
 *   This is the correct React pattern: form = controlled inputs,
 *   parent = truth about what was submitted.
 */

const LANGUAGES = [
  { value: 'python',     label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java',       label: 'Java' },
  { value: 'cpp',        label: 'C++' },
  { value: 'csharp',     label: 'C#' },
]

const CATEGORIES = [
  { value: 'bugs',                label: '🐛 Bugs' },
  { value: 'security',            label: '🔒 Security' },
  { value: 'performance',         label: '⚡ Performance' },
  { value: 'code_quality',        label: '✨ Code Quality' },
  { value: 'readability',         label: '📖 Readability' },
  { value: 'best_practices',      label: '📐 Best Practices' },
  { value: 'time_complexity',     label: '⏱ Time Complexity' },
  { value: 'space_complexity',    label: '💾 Space Complexity' },
  { value: 'edge_cases',          label: '🔍 Edge Cases' },
  { value: 'suggested_improvements', label: '💡 Improvements' },
]

const ALL_CATEGORY_VALUES = CATEGORIES.map((c) => c.value)

export default function ReviewForm({ onSubmit, loading }) {
  const [code, setCode]           = useState('')
  const [language, setLanguage]   = useState('python')
  const [categories, setCategories] = useState(ALL_CATEGORY_VALUES)
  const [cooldown, setCooldown]     = useState(false)

  const toggleCategory = (value) => {
    setCategories((prev) =>
      prev.includes(value)
        ? prev.filter((c) => c !== value)
        : [...prev, value]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (cooldown || loading) return

    if (!code.trim()) {
      toast.error('Please paste some code first.')
      return
    }

    if (code.trim().length < 10) {
      toast.error('Code is too short to review.')
      return
    }

    if (categories.length === 0) {
      toast.error('Please select at least one review category.')
      return
    }

    setCooldown(true)
    setTimeout(() => setCooldown(false), 3000)

    onSubmit({ code: code.trim(), language, review_categories: categories })
  }

  const handleClear = () => {
    setCode('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Language selector */}
      <div>
        <label
          htmlFor="language-select"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        >
          Programming Language
        </label>
        <div className="relative">
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="
              w-full appearance-none px-4 py-2.5 pr-10
              bg-white dark:bg-slate-800
              border border-slate-200 dark:border-slate-700
              text-slate-900 dark:text-slate-100
              rounded-xl text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-brand-500
              cursor-pointer
            "
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Code editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Source Code
          </label>
          {code && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
              aria-label="Clear code input"
            >
              <RotateCcw size={12} />
              Clear
            </button>
          )}
        </div>
        <CodeEditor
          code={code}
          language={language}
          onChange={setCode}
        />
      </div>

      {/* Review categories */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Review Categories
          </label>
          <button
            type="button"
            onClick={() =>
              setCategories(
                categories.length === ALL_CATEGORY_VALUES.length
                  ? []
                  : ALL_CATEGORY_VALUES
              )
            }
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
          >
            {categories.length === ALL_CATEGORY_VALUES.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = categories.includes(cat.value)
            return (
              <button
                key={cat.value}
                type="button"
                id={`category-${cat.value}`}
                onClick={() => toggleCategory(cat.value)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200
                  ${isSelected
                    ? 'bg-brand-600 border-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400 dark:hover:border-brand-600'}
                `}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Submit button */}
      <button
        id="review-submit-btn"
        type="submit"
        disabled={loading || cooldown || !code.trim()}
        className="btn-primary flex items-center justify-center gap-2 w-full mt-1"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analysing...
          </>
        ) : (
          <>
            <Zap size={18} />
            Review Code
          </>
        )}
      </button>

    </form>
  )
}
