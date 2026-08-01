import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

/*
 * ThemeToggle.jsx — Dark/Light Mode Button
 * ==========================================
 * A small icon button that delegates all state to useTheme().
 * It renders a Sun icon in dark mode and a Moon icon in light mode.
 */

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="btn-ghost p-2 rounded-xl"
    >
      {isDark ? (
        <Sun size={20} className="text-amber-400" />
      ) : (
        <Moon size={20} className="text-slate-600" />
      )}
    </button>
  )
}
