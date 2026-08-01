import { useState } from 'react'
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'

/*
 * InterviewQuestions.jsx — Expandable Question Cards
 * =====================================================
 * Renders the 3 AI-generated interview questions.
 * Each question is a toggle card that reveals the hint on click.
 */

export default function InterviewQuestions({ questions = [] }) {
  const [openIndex, setOpenIndex] = useState(null)

  if (!questions.length) return null

  return (
    <div className="glass-card p-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={18} className="text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
          Interview Questions
        </h3>
        <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
          {questions.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {questions.map((q, i) => {
          const isOpen = openIndex === i
          return (
            <div
              key={i}
              className="border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden"
            >
              <button
                id={`interview-question-${i + 1}`}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full text-left flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-200 flex-1 leading-relaxed">
                  {q.question}
                </span>
                <span className="text-slate-400 shrink-0">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              {isOpen && q.hint && (
                <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700/40">
                  <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                      💡 Hint
                    </p>
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      {q.hint}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
