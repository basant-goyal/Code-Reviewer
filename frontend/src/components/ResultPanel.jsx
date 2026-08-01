import { Download } from 'lucide-react'
import ScoreCard from './ScoreCard'
import IssueList from './IssueList'
import RefactoredCode from './RefactoredCode'
import InterviewQuestions from './InterviewQuestions'
import LoadingSkeleton from './LoadingSkeleton'
import ErrorCard from './ErrorCard'
import { downloadReviewMarkdown } from '../utils/downloadMarkdown'

/*
 * ResultPanel.jsx — Review Output Container
 * ===========================================
 * WHY THIS FILE EXISTS:
 *   Orchestrates all the result sub-components in one scrollable panel.
 *   Handles three states: loading (skeleton), error (ErrorCard), result (cards).
 *   This is the "container" pattern — it decides what to render,
 *   but delegates the actual rendering to specialised child components.
 *
 * REACT CONCEPT — Conditional rendering with &&:
 *   `{loading && <LoadingSkeleton />}` renders the skeleton only when loading=true.
 *   This is idiomatic React — cleaner than ternary chains for multiple branches.
 */

export default function ResultPanel({ loading, error, result, onRetry, language }) {

  // Show placeholder when nothing has been submitted yet.
  if (!loading && !error && !result) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-8">
        <div className="w-20 h-20 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mb-5 shadow-inner">
          <span className="text-4xl">🔍</span>
        </div>
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">
          Ready to Review
        </h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed max-w-xs">
          Paste your code on the left, select a language, choose your review categories, and click{' '}
          <span className="text-brand-500 font-semibold">Review Code</span>.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Download button — shown only when there's a result */}
      {result && (
        <div className="flex justify-end">
          <button
            id="download-review-btn"
            onClick={() => downloadReviewMarkdown(result, language)}
            className="btn-ghost flex items-center gap-2 text-sm font-medium"
            aria-label="Download review as Markdown"
          >
            <Download size={16} />
            Download as Markdown
          </button>
        </div>
      )}

      {loading && <LoadingSkeleton />}
      {error   && <ErrorCard message={error} onRetry={onRetry} />}

      {result && (
        <>
          <ScoreCard
            summary={result.summary}
            overall_score={result.overall_score}
            time_complexity={result.time_complexity}
            space_complexity={result.space_complexity}
          />
          <IssueList items={result.bugs}       type="bugs" />
          <IssueList items={result.security}   type="security" />
          <IssueList items={result.suggestions} type="suggestions" />
          <RefactoredCode code={result.refactored_code} language={language} />
          <InterviewQuestions questions={result.interview_questions} />
        </>
      )}

    </div>
  )
}
