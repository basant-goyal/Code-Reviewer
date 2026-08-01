import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

/*
 * main.jsx — React Entry Point
 * =============================
 * WHY THIS FILE EXISTS:
 *   Vite looks for this file as the JavaScript entry point (referenced in index.html).
 *   It mounts the React app onto the #root div.
 *
 * REACT CONCEPT — StrictMode:
 *   Wrapping in <React.StrictMode> makes React intentionally double-invoke
 *   certain functions in development to help catch side-effects.
 *   It has zero effect on production builds.
 *
 * react-hot-toast <Toaster />:
 *   Rendered once here at the root so any component can trigger toasts via
 *   `import toast from 'react-hot-toast'; toast.success('...')`.
 */

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--toast-bg, #1e293b)',
          color: 'var(--toast-color, #f8fafc)',
          borderRadius: '12px',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '14px',
        },
      }}
    />
  </React.StrictMode>,
)
