import { useState, useRef, useCallback } from 'react'
import Navbar from '../components/Navbar'
import ReviewForm from '../components/ReviewForm'
import ResultPanel from '../components/ResultPanel'
import HistoryPanel from '../components/HistoryPanel'
import { useCodeReview } from '../hooks/useCodeReview'
import { useHistory } from '../hooks/useHistory'

/*
 * HomePage.jsx — Main Page Layout
 * =================================
 * WHY THIS FILE EXISTS:
 *   The top-level page component. It owns:
 *   - The history panel open/close state.
 *   - The last-submitted payload (to enable retry).
 *   - The two-column grid layout.
 *
 * LAYOUT:
 *   On desktop: two-column grid (form left, results right).
 *   On mobile:  single column, stacked.
 *
 * REACT CONCEPT — useRef for retry:
 *   We store the last submitted payload in a ref (not state) because
 *   we don't want storing it to trigger a re-render.
 *   It's only used by the retry button.
 */

export default function HomePage() {
  const [historyOpen, setHistoryOpen] = useState(false)
  const [lastLanguage, setLastLanguage] = useState('python')
  const lastPayloadRef = useRef(null)

  const { loading, error, result, submitReview, clearResult } = useCodeReview()
  const { history } = useHistory()

  const handleSubmit = useCallback((payload) => {
    lastPayloadRef.current = payload
    setLastLanguage(payload.language)
    submitReview(payload)
  }, [submitReview])

  const handleRetry = useCallback(() => {
    if (lastPayloadRef.current) {
      submitReview(lastPayloadRef.current)
    }
  }, [submitReview])

  // When user clicks a history item, restore its result into the panel.
  const handleHistorySelect = useCallback((item) => {
    setLastLanguage(item.language)
    // Directly set result by re-running the submit with cached result.
    // We use a shortcut: inject the stored result directly via the hook.
    // Since submitReview will overwrite, we expose a clearResult + trick
    // approach: just call submitReview — the history item's result is stored
    // in history and we load it directly.
    // Simpler: we expose a setResult path via the hook.
    // For now, submit fresh — users can also just use the history item's code.
    clearResult()
    // Show the result directly without re-calling the API.
    // We do this by dispatching a synthetic "already-computed" result.
    // We achieve this cleanly by lifting the result state here.
    setDirectResult({ result: item.result, language: item.language })
  }, [clearResult])

  // Lifted state for history-selected results (bypasses the API call).
  const [directResult, setDirectResult] = useState(null)

  const displayResult = directResult?.result ?? result
  const displayLanguage = directResult?.language ?? lastLanguage

  // Clear direct result when a new submission starts.
  const handleFormSubmit = useCallback((payload) => {
    setDirectResult(null)
    handleSubmit(payload)
  }, [handleSubmit])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar
        onHistoryClick={() => setHistoryOpen(true)}
        historyCount={history.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero tagline */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            AI-Powered{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-violet-500">
              Code Review
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl mx-auto">
            Paste your code. Get instant expert feedback on bugs, security, performance, and complexity.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Left: Input form */}
          <div className="glass-card p-6">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-5">
              Submit Code
            </h2>
            <ReviewForm onSubmit={handleFormSubmit} loading={loading} />
          </div>

          {/* Right: Results */}
          <div className="overflow-y-auto">
            <ResultPanel
              loading={loading}
              error={error}
              result={displayResult}
              onRetry={handleRetry}
              language={displayLanguage}
            />
          </div>

        </div>
      </main>

      {/* History sidebar */}
      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleHistorySelect}
      />
    </div>
  )
}
