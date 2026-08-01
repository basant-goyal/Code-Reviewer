/*
 * ScoreCard.jsx — Overall Score Display
 * =======================================
 * Shows the numeric score (1-10) as a large ring gauge,
 * the summary text, and the time/space complexity chips.
 */

function ScoreRing({ score }) {
  // SVG circle trick: dashoffset controls how much of the stroke is visible.
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const filled = (score / 10) * circumference
  const offset = circumference - filled

  // Colour ramp: red → yellow → green
  const color =
    score >= 8 ? '#22c55e'  // green
    : score >= 5 ? '#f59e0b'  // amber
    : '#ef4444'               // red

  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="drop-shadow-sm">
      {/* Background track */}
      <circle
        cx="50" cy="50" r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        className="text-slate-200 dark:text-slate-700"
      />
      {/* Score arc */}
      <circle
        cx="50" cy="50" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
      />
      {/* Score number */}
      <text
        x="50" y="50"
        dominantBaseline="middle"
        textAnchor="middle"
        fill={color}
        fontSize="22"
        fontWeight="700"
        fontFamily="Inter, sans-serif"
      >
        {score}
      </text>
      <text
        x="50" y="65"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="#94a3b8"
        fontSize="9"
        fontFamily="Inter, sans-serif"
      >
        /10
      </text>
    </svg>
  )
}

export default function ScoreCard({ summary, overall_score, time_complexity, space_complexity }) {
  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

        {/* Score ring */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <ScoreRing score={overall_score} />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Overall Score
          </span>
        </div>

        {/* Summary */}
        <div className="flex-1">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2 leading-snug">
            Review Summary
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {summary}
          </p>
        </div>
      </div>

      {/* Complexity chips */}
      <div className="mt-5 flex flex-wrap gap-3 pt-5 border-t border-slate-200/60 dark:border-slate-700/60">
        <ComplexityChip label="Time Complexity" value={time_complexity} color="violet" />
        <ComplexityChip label="Space Complexity" value={space_complexity} color="sky" />
      </div>
    </div>
  )
}

function ComplexityChip({ label, value, color }) {
  const colors = {
    violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    sky:    'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  }

  return (
    <div className={`flex flex-col px-4 py-2.5 rounded-xl border font-mono text-sm ${colors[color]}`}>
      <span className="text-[10px] font-sans font-semibold uppercase tracking-wider opacity-70 mb-0.5">
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
