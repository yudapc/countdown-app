import '../App.css'
import { useEffect, useState } from 'react'
import { CountdownFeature, CounterCountFeature } from '../features'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useCountdown, useLocalStorageState } from '../shared'

function CounterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 5h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Zm0 2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H8Zm1 2h6v2H9V9Zm0 4h6v2H9v-2Z" />
    </svg>
  )
}

function CountdownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M11 2h2v3h-2V2Zm6.36 3.22 1.42 1.42-2.12 2.12-1.42-1.42 2.12-2.12ZM12 7a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm1 4.5V11h-2v4.25l3.25 1.95 1-1.64-2.25-1.35Z" />
    </svg>
  )
}

function App() {
  const location = useLocation()
  const { isActive, formattedTime } = useCountdown()
  const [themeMode, setThemeMode] = useLocalStorageState('theme-mode', 'system')
  const [deviceTheme, setDeviceTheme] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setDeviceTheme(e.matches ? 'dark' : 'light')
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  const activeTheme = themeMode === 'system' ? deviceTheme : themeMode

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme)
  }, [activeTheme])

  const toggleTheme = () => {
    setThemeMode((prev) => {
      if (prev === 'system') return 'light'
      if (prev === 'light') return 'dark'
      return 'system'
    })
  }

  useEffect(() => {
    const seoByPath = {
      '/counter': {
        title: 'Counter Online | Timer Tools',
        description: 'Counter online untuk menghitung aktivitas harian dengan cepat.',
      },
      '/waktu': {
        title: 'Countdown Online | Timer Tools',
        description: 'Countdown online untuk fokus kerja, belajar, dan rutinitas harian.',
      },
      default: {
        title: 'Timer Tools - Counter & Countdown Online',
        description: 'Aplikasi timer online untuk countdown dan counter.',
      },
    }

    const currentSeo = seoByPath[location.pathname] || seoByPath.default

    const setMeta = (name, content) => {
      let tag = document.head.querySelector(`meta[name="${name}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', name)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    const setOG = (property, content) => {
      let tag = document.head.querySelector(`meta[property="${property}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', property)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    const canonicalHref = `${window.location.origin}${location.pathname}`
    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalHref)

    document.title = currentSeo.title
    setMeta('description', currentSeo.description)
    setOG('title', currentSeo.title)
    setOG('description', currentSeo.description)
    setOG('url', canonicalHref)
  }, [location.pathname])

  const isCountdownPage = location.pathname === '/waktu'

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Timer Tools</h1>
        <div className="header-actions">
          <button
            className="theme-btn"
            onClick={toggleTheme}
            aria-label={`Tema: ${themeMode}`}
          >
            {activeTheme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="tab-content" key={location.pathname}>
          <Routes>
            <Route path="/" element={<Navigate to="/counter" replace />} />
            <Route path="/counter" element={<CounterCountFeature />} />
            <Route path="/waktu" element={<CountdownFeature />} />
            <Route path="/countdown" element={<Navigate to="/waktu" replace />} />
            <Route path="*" element={<Navigate to="/counter" replace />} />
          </Routes>
        </div>
      </main>

      {isActive && !isCountdownPage && (
        <NavLink to="/waktu" className="countdown-chip">
          <span className="countdown-chip-label">Hitung Mundur</span>
          <span className="countdown-chip-time">{formattedTime}</span>
        </NavLink>
      )}

      <nav className="bottom-tabs">
        <NavLink to="/counter" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
          <CounterIcon />
          <span>Counter</span>
        </NavLink>
        <NavLink to="/waktu" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
          <CountdownIcon />
          <span>Waktu</span>
        </NavLink>
      </nav>
    </div>
  )
}

export default App
