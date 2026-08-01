import { useState, useEffect } from 'react'

/*
 * useTheme.js — Dark / Light Mode Hook
 * ======================================
 * WHY THIS FILE EXISTS:
 *   Separates theme management from components.
 *   Any component can call useTheme() to read or toggle the theme
 *   without knowing HOW themes are stored.
 *
 * HOW IT WORKS:
 *   Tailwind's `darkMode: 'class'` strategy means:
 *   - Dark mode  = <html class="dark">
 *   - Light mode = <html> (no dark class)
 *   We persist the preference in localStorage so it survives page refresh.
 *
 * REACT CONCEPT — useEffect:
 *   Runs AFTER the render to apply side-effects (DOM mutations, localStorage).
 *   The [] dependency array means "run once on mount" for the initialisation.
 *   The [isDark] dependency means "run whenever isDark changes" for applying
 *   the class and saving to localStorage.
 */

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    // Initialiser function: runs once to compute the initial state value.
    // Checks localStorage first, then falls back to the OS preference.
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    // Apply or remove the 'dark' class on <html> whenever isDark changes.
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark((prev) => !prev)

  return { isDark, toggleTheme }
}
