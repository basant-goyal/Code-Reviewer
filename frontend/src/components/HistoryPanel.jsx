import { X, Clock, Trash2, Code } from 'lucide-react'
import { useHistory } from '../hooks/useHistory'

/*
 * HistoryPanel.jsx — Sliding Sidebar of Past Reviews
 * =====================================================
 * WHY THIS FILE EXISTS:
 *   Users might want to revisit a previous review without re-submitting code.
 *   This panel reads from the same localStorage history that useHistory manages.
 *   Clicking a history item calls onSelect, which populates the result panel.
 *
 * REACT CONCEPT — Controlled visibility:
 *   `isOpen` is managed by the parent (HomePage). This component doesn't
 *   decide when to show — it just renders based on what the parent passes.
 *   This is the "controlled component" pattern.
 */

const LANGUAGE_LABELS = {
  python: 'Python', javascript: 'JavaScript', typescript: 'TypeScript',
  java: 'Java', cpp: 'C++', csharp: 'C#',
}

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

export default function HistoryPanel({ isOpen, onClose, onSelect }) {
  const { history, clearHistory } = useHistory()

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Review history"
        aria-modal="true"
        className={`
          fixed top-0 right-0 h-full w-full sm:w-96 z-50
          bg-white dark:bg-slate-900
          border-l border-slate-200 dark:border-slate-800
          shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-brand-500" />
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Review History
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300">
              {history.length}
            </span>
          </div>
          <button
            id="history-panel-close-btn"
            onClick={onClose}
            className="btn-ghost p-1.5 rounded-lg"
            aria-label="Close history panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-3 px-3">
          {history.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-slate-600">
              <Clock size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No reviews yet.</p>
              <p className="text-xs mt-1">Your past reviews will appear here.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {history.map((item, index) => (
                <li key={index}>
                  <button
                    id={`history-item-${index}`}
                    onClick={() => { onSelect(item); onClose() }}
                    className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Code size={14} className="text-brand-500 shrink-0" />
                        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                          {LANGUAGE_LABELS[item.language] || item.language}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {item.result?.overall_score ?? '?'}/10
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {timeAgo(item.reviewedAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-mono leading-relaxed">
                      {item.code}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <button
              id="clear-history-btn"
              onClick={clearHistory}
              className="w-full flex items-center justify-center gap-2 text-sm text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
            >
              <Trash2 size={15} />
              Clear all history
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
