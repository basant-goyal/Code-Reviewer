import { useState } from 'react'
import { AlertTriangle, Shield, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'

/*
 * IssueList.jsx — Reusable Card List for Bugs / Security / Suggestions
 * ======================================================================
 * WHY THIS FILE EXISTS:
 *   Bugs, security issues, and suggestions all share the same
 *   "card with title, description, badge" pattern.
 *   One reusable component handles all three — the `type` prop
 *   controls the icon and colour scheme.
 *
 * REACT CONCEPT — Conditional rendering:
 *   If the list is empty, we render a "no issues found" green badge.
 *   We don't render the whole section unless there's something to show.
 */

const TYPE_CONFIG = {
  bugs: {
    icon:  AlertTriangle,
    title: 'Bugs & Logical Errors',
    empty: 'No bugs detected',
    colors: {
      critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50',
      high:     'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/50',
      medium:   'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
      low:      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
    },
    headerColor: 'text-red-600 dark:text-red-400',
    countColor:  'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  },
  security: {
    icon:  Shield,
    title: 'Security Issues',
    empty: 'No security vulnerabilities found',
    colors: {
      critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50',
      high:     'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/50',
      medium:   'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
      low:      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
    },
    headerColor: 'text-amber-600 dark:text-amber-400',
    countColor:  'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  },
  suggestions: {
    icon:  Lightbulb,
    title: 'Suggestions',
    empty: 'No additional suggestions',
    colors: {
      performance:  'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/50',
      readability:  'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/50',
      best_practice:'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/50',
      general:      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    },
    headerColor: 'text-brand-600 dark:text-brand-400',
    countColor:  'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300',
  },
}

function IssueCard({ item, type }) {
  const [expanded, setExpanded] = useState(false)
  const config = TYPE_CONFIG[type]

  const badgeValue = type === 'suggestions' ? item.category : item.severity
  const badgeClass = (config.colors[badgeValue] || config.colors['general'] || config.colors['low'])

  return (
    <div className="border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full text-left flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {item.title}
            </span>
            {item.line_hint && (
              <span className="text-xs text-slate-400 font-mono">{item.line_hint}</span>
            )}
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${badgeClass}`}>
              {badgeValue}
            </span>
          </div>
          {!expanded && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {item.description}
            </p>
          )}
        </div>
        <span className="shrink-0 text-slate-400">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700/40">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
            {item.description}
          </p>
          {item.recommendation && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/40">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                Recommendation
              </p>
              <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">
                {item.recommendation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function IssueList({ items = [], type }) {
  const config = TYPE_CONFIG[type]
  const Icon = config.icon

  return (
    <div className="glass-card p-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className={config.headerColor} />
        <h3 className={`text-sm font-bold ${config.headerColor}`}>
          {config.title}
        </h3>
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${config.countColor}`}>
          {items.length}
        </span>
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          {config.empty}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <IssueCard key={index} item={item} type={type} />
          ))}
        </div>
      )}
    </div>
  )
}
