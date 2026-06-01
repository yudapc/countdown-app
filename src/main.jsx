import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import { CountdownProvider } from './shared'

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Auto-apply new build when an update is available.
    updateSW(true)
  },
  onRegisteredSW(_swUrl, registration) {
    if (!registration) {
      return
    }

    const checkForUpdates = () => {
      registration.update()
    }

    // Periodic checks help installed apps pick up fresh UI without manual hard refresh.
    setInterval(checkForUpdates, 60 * 60 * 1000)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates()
      }
    })
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CountdownProvider>
        <App />
      </CountdownProvider>
    </BrowserRouter>
  </StrictMode>,
)
