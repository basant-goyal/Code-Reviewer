import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { reviewCode } from '../services/api'
import { useHistory } from './useHistory'

/*
 * useCodeReview.js — Code Review State Machine
 * =============================================
 * WHY THIS FILE EXISTS:
 *   React components should contain only rendering logic.
 *   All data-fetching state (loading, error, result) belongs in a custom hook.
 *
 * REACT CONCEPTS:
 *
 * 1. Custom Hooks:
 *    A function that starts with "use" and calls other hooks.
 *    Lets you extract stateful logic out of components and reuse it.
 *
 * 2. useCallback:
 *    Memoises the submitReview function so it's not recreated on every render.
 *    This matters when passing it as a prop to child components — prevents
 *    unnecessary re-renders of those children.
 *
 * 3. useState:
 *    Three pieces of state: loading, error, result.
 *    They change together in a logical sequence (loading → result or error).
 */

export function useCodeReview() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [result, setResult]   = useState(null)

  const { addReview } = useHistory()

  const submitReview = useCallback(async (payload) => {
    // Reset state before a new request.
    setLoading(true)
    setError(null)
    setResult(null)

    const toastId = toast.loading('Analysing your code...')

    try {
      const data = await reviewCode(payload)

      setResult(data)
      addReview({ ...payload, result: data, reviewedAt: new Date().toISOString() })

      toast.success('Review complete!', { id: toastId })
    } catch (err) {
      const message = err.userMessage || 'Failed to get a review. Please try again.'
      setError(message)
      toast.error(message, { id: toastId })
    } finally {
      setLoading(false)
    }
  }, [addReview])

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { loading, error, result, submitReview, clearResult }
}
