import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// vite.config.js
// WHY THIS FILE EXISTS:
//   Vite needs to know we're building a React app (so it can handle JSX).
//   The server.proxy block is the key setting:
//   Any frontend request to /api/* is forwarded to the FastAPI backend at
//   localhost:8000. This means the browser never makes a cross-origin request
//   in development — no CORS issues during local development.

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
