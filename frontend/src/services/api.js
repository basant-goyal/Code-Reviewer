import axios from 'axios'

/*
 * api.js — Axios HTTP Client
 * ===========================
 * WHY THIS FILE EXISTS:
 *   All HTTP calls live here. No component should import axios directly.
 *   This gives us one place to:
 *   - Set the base URL.
 *   - Add request/response interceptors (logging, auth headers).
 *   - Handle retry logic uniformly.
 *
 * HOW IT INTERACTS:
 *   - useCodeReview.js imports reviewCode() from here.
 *   - The Vite dev server proxy forwards /api/* to localhost:8000 automatically,
 *     so we don't need to hard-code the backend port in this file.
 *
 * RETRY LOGIC:
 *   We implement manual retry with exponential back-off instead of a library.
 *   This makes the logic visible and teachable.
 */

// Axios instance — all requests inherit these defaults.
const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 65000,   // Slightly longer than the backend's 60s timeout.
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor: normalise error messages from the backend.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message =
      error.response?.data?.detail ||
      error.message ||
      'An unknown error occurred.'

    if (error.response?.status === 429) {
      message = 'Google Gemini rate limit reached (Free tier limit: 15 requests/min). Please wait 10 seconds before trying again.'
    }

    // Attach a clean user-facing message to every error object.
    error.userMessage = message
    return Promise.reject(error)
  },
)


/**
 * Calls the backend code review endpoint.
 * Backend handles Gemini API retries; frontend only retries on raw network failures.
 *
 * @param {Object} payload
 * @param {string} payload.code               - The source code to review.
 * @param {string} payload.language           - Language identifier (e.g. "python").
 * @param {string[]} payload.review_categories - Categories to include.
 * @param {number} [maxRetries=2]             - Max attempts for network errors.
 * @returns {Promise<Object>}                 - The CodeReviewResponse object.
 */
export async function reviewCode(payload, maxRetries = 2) {
  let lastError = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await apiClient.post('/review/', payload)
      return response.data

    } catch (error) {
      lastError = error

      // If the backend responded with any HTTP status (4xx or 5xx), do NOT retry.
      // The backend has already executed retries against Gemini.
      if (error.response) {
        throw error
      }

      // Only retry on network failure (no response received from backend)
      if (attempt < maxRetries) {
        const waitMs = attempt * 1500
        console.warn(`Network error on attempt ${attempt}. Retrying in ${waitMs}ms...`)
        await new Promise((resolve) => setTimeout(resolve, waitMs))
      }
    }
  }

  throw lastError
}

export default apiClient
