import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Note: no Cross-Origin-Opener/Embedder-Policy headers. They make the in-browser background removal a little
// faster on CPU-only devices, but they stop the service worker from starting, which the installable app (PWA/APK)
// needs. Background removal uses the GPU (WebGPU) where available, which doesn't need them.

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // Pre-bundle up front so the first "Remove Background" click doesn't trigger a reload
    include: ['@imgly/background-removal'],
  },
  server: {
    // Forward API calls to the Express backend in ../server
    proxy: { '/api': 'http://localhost:3000' },
  },
})
