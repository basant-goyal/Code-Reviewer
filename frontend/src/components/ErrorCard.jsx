import { AlertCircle, RefreshCw } from 'lucide-react'

/*
 * ErrorCard.jsx — Error State Display
 * =====================================
 * Shown when the API call fails. Displays the error message and
 * provides a Retry button that calls the same submission again.
 */

export default function ErrorCard({ message, onRetry }) {
  return (
    <div className="glass-card p-6 border-red-200 dark:border-red-800/40 animate-fade-in">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertCircle size={28} className="text-red-500 dark:text-red-400" />
        </div>

        <div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">
            Review Failed
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
            {message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>

        {onRetry && (
          <button
            id="retry-btn"
            onClick={onRetry}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
