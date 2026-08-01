import { Code2, History } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

/*
 * Navbar.jsx — Top Navigation Bar
 * =================================
 * WHY THIS FILE EXISTS:
 *   Keeps the header layout separate from page logic.
 *   Accepts an onHistoryClick prop so it can open the history panel
 *   without knowing what the history panel is.
 *
 * REACT CONCEPT — Props:
 *   Props are how parent components pass data or callbacks to children.
 *   `onHistoryClick` is a function passed from HomePage that opens the
 *   history sidebar. The Navbar doesn't manage sidebar state itself.
 */

export default function Navbar({ onHistoryClick, historyCount }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 shadow-lg shadow-brand-600/30">
              <Code2 size={20} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                AI Code Reviewer
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                Powered by Gemini
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              id="history-panel-btn"
              onClick={onHistoryClick}
              className="btn-ghost flex items-center gap-2 text-sm font-medium"
              aria-label="View review history"
            >
              <History size={18} />
              <span className="hidden sm:inline">History</span>
              {historyCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-brand-600 text-white rounded-full">
                  {historyCount > 9 ? '9+' : historyCount}
                </span>
              )}
            </button>
            <ThemeToggle />
          </div>

        </div>
      </div>
    </header>
  )
}
