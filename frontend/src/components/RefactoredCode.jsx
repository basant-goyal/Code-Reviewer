import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, Code2 } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

/*
 * RefactoredCode.jsx — AI-Generated Code Block
 * ==============================================
 * Shows the refactored code with syntax highlighting and a copy button.
 * The copy button uses the Clipboard API and shows a ✓ check for 2 seconds.
 */

const PRISM_LANG_MAP = {
  python: 'python', javascript: 'javascript', typescript: 'typescript',
  java: 'java', cpp: 'cpp', csharp: 'csharp',
}

export default function RefactoredCode({ code, language }) {
  const { isDark } = useTheme()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API can fail if the page isn't focused — fail silently.
    }
  }

  const prismLang = PRISM_LANG_MAP[language] || 'text'

  return (
    <div className="glass-card overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-brand-500" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Refactored Code
          </h3>
          <span className="text-xs text-slate-400 font-mono">{language}</span>
        </div>
        <button
          id="copy-refactored-btn"
          onClick={handleCopy}
          aria-label="Copy refactored code"
          className={`
            flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
            transition-all duration-200
            ${copied
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400'
            }
          `}
        >
          {copied ? (
            <><Check size={13} /> Copied!</>
          ) : (
            <><Copy size={13} /> Copy</>
          )}
        </button>
      </div>

      {/* Code block */}
      <div className="overflow-auto custom-scrollbar max-h-[500px]">
        <SyntaxHighlighter
          language={prismLang}
          style={isDark ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: '13px',
            lineHeight: '1.6',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            background: isDark ? '#1a1f2e' : '#f8fafc',
          }}
          showLineNumbers
          lineNumberStyle={{
            color: isDark ? '#475569' : '#94a3b8',
            fontSize: '11px',
            paddingRight: '16px',
            minWidth: '2.5em',
          }}
          wrapLongLines={false}
        >
          {code || '// No refactored code generated.'}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
