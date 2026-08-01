import { useState, useCallback } from 'react'

/*
 * useHistory.js — localStorage Review History
 * =============================================
 * WHY THIS FILE EXISTS:
 *   Provides a clean interface for reading and writing the review history
 *   stored in the browser's localStorage. Components never touch localStorage
 *   directly — they go through this hook.
 *
 * REACT CONCEPT — useState with initialiser:
 *   `useState(() => ...)` takes a function instead of a value.
 *   The function only runs once on mount (not on every render).
 *   This is important here because JSON.parse is relatively slow — we don't
 *   want to run it on every render.
 */

const STORAGE_KEY = 'ai_code_reviewer_history'
const MAX_HISTORY = 20  // Keep the last 20 reviews to avoid filling up localStorage.

export function useHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const addReview = useCallback((review) => {
    setHistory((prev) => {
      // Add to front, keep MAX_HISTORY items, save to localStorage.
      const updated = [review, ...prev].slice(0, MAX_HISTORY)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // localStorage can throw if storage quota is exceeded — fail silently.
      }
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }, [])

  return { history, addReview, clearHistory }
}
