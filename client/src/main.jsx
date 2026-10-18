import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { wakeServer } from './utils/api'

wakeServer()

// Service worker makes the site installable as a phone app (PWA / Android APK). Production only,
// so it never caches files while developing.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Toaster position='top-center' />
    <App />
  </BrowserRouter>,
)
