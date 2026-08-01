import { useState, useRef, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '../hooks/useTheme'

/*
 * CodeEditor.jsx — Syntax-Highlighted Code Input
 * =================================================
 * WHY THIS FILE EXISTS:
 *   We need a textarea where users paste code, with syntax highlighting.
 *   We achieve this by layering two elements:
 *   - A transparent <textarea> on top (for user input).
 *   - A <SyntaxHighlighter> block underneath (for visual highlighting).
 *   The textarea captures keystrokes; the highlighter renders the colours.
 *
 * REACT CONCEPTS:
 *   - useRef: gets a direct reference to the DOM textarea element so we can
 *     read its scroll position and sync it to the highlighter beneath it.
 *   - Controlled input: `value={code}` and `onChange={onChange}` make React
 *     the single source of truth for the input's content.
 *
 * WHY NOT Monaco Editor?
 *   Monaco is 2MB+ of JavaScript. Prism.js is ~30KB.
 *   For a learning project that still needs to look great, Prism wins on
 *   build size and zero configuration.
 */

// Maps our language keys to Prism.js language names.
const PRISM_LANG_MAP = {
  python:     'python',
  javascript: 'javascript',
  typescript: 'typescript',
  java:       'java',
  cpp:        'cpp',
  csharp:     'csharp',
}

export default function CodeEditor({ code, language, onChange }) {
  const { isDark } = useTheme()
  const textareaRef = useRef(null)
  const highlighterRef = useRef(null)
  const [lineCount, setLineCount] = useState(1)

  // Count lines to display line numbers in the gutter.
  useEffect(() => {
    setLineCount((code || '').split('\n').length)
  }, [code])

  // Sync textarea scroll to the syntax highlighter so they stay aligned.
  const handleScroll = () => {
    if (textareaRef.current && highlighterRef.current) {
      highlighterRef.current.scrollTop = textareaRef.current.scrollTop
      highlighterRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  // Handle Tab key — inserts 2 spaces instead of moving focus.
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.target.selectionStart
      const end   = e.target.selectionEnd
      const newCode = code.substring(0, start) + '  ' + code.substring(end)
      onChange(newCode)
      // Restore cursor position after the inserted spaces.
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2
          textareaRef.current.selectionEnd   = start + 2
        }
      })
    }
  }

  const prismLang = PRISM_LANG_MAP[language] || 'text'
  const highlighterStyle = isDark ? oneDark : oneLight

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 dark:bg-[#282c34]">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-900 border-b border-slate-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="ml-2 text-xs text-slate-400 font-mono">{language || 'plaintext'}</span>
        <span className="ml-auto text-xs text-slate-500">{lineCount} line{lineCount !== 1 ? 's' : ''}</span>
      </div>

      {/* Editor area: layered textarea + highlighter */}
      <div className="relative" style={{ minHeight: '300px', maxHeight: '500px' }}>
        {/* Syntax highlighter (visual layer, behind textarea) */}
        <div
          ref={highlighterRef}
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ padding: '16px 16px 16px 16px' }}
        >
          <SyntaxHighlighter
            language={prismLang}
            style={highlighterStyle}
            customStyle={{
              margin: 0,
              padding: 0,
              background: 'transparent',
              fontSize: '13px',
              lineHeight: '1.6',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              whiteSpace: 'pre',
              overflowX: 'visible',
            }}
            wrapLongLines={false}
          >
            {code || ' '}
          </SyntaxHighlighter>
        </div>

        {/* Transparent textarea (interactive layer, on top) */}
        <textarea
          id="code-input-textarea"
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          placeholder="Paste your code here..."
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="
            absolute inset-0 w-full h-full resize-none
            bg-transparent text-transparent caret-white
            p-4 font-mono text-[13px] leading-[1.6]
            outline-none border-none custom-scrollbar
            selection:bg-brand-500/40
          "
          style={{
            caretColor: isDark ? '#e2e8f0' : '#1e293b',
            whiteSpace: 'pre',
            overflowX: 'auto',
          }}
        />

        {/* Placeholder shown only when empty */}
        {!code && (
          <div
            aria-hidden="true"
            className="absolute top-4 left-4 text-slate-500 dark:text-slate-600 font-mono text-[13px] pointer-events-none"
          >
            Paste your code here...
          </div>
        )}
      </div>
    </div>
  )
}
