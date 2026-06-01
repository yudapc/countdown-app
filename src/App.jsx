import './App.css'
import React, { useEffect, useRef, useState } from 'react'
import { CountdownFeature, CounterCountFeature } from './features'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useCountdown, useLocalStorageState } from './shared'

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
  const themeMenuRef = useRef(null)
  const location = useLocation()
  const { isActive, formattedTime } = useCountdown()
  const [themeMode, setThemeMode] = useLocalStorageState('theme-mode', 'system')
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const [deviceTheme, setDeviceTheme] = useState(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    return 'light'
  })

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleThemeChange = (event) => {
      setDeviceTheme(event.matches ? 'dark' : 'light')
    }

    media.addEventListener('change', handleThemeChange)
    return () => {
      media.removeEventListener('change', handleThemeChange)
    }
  }, [])

  const activeTheme = themeMode === 'system' ? deviceTheme : themeMode

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme)
  }, [activeTheme])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!themeMenuRef.current) {
        return
      }

      if (!themeMenuRef.current.contains(event.target)) {
        setIsThemeMenuOpen(false)
      }
    }

    if (isThemeMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isThemeMenuOpen])

  const menuLinkClassName = ({ isActive }) =>
    `menu-link ${isActive ? 'menu-link-active' : ''}`

  const themeOptionClassName = (mode) =>
    `theme-menu-item ${themeMode === mode ? 'theme-menu-item-active' : ''}`

  useEffect(() => {
    const defaultKeywords =
      'timer online, countdown online, tasbih online, counter online, stopwatch online, hitung mundur online'

    const seoByPath = {
      '/counter': {
        title: 'Counter Online dan Tasbih Online | Timer Online',
        description:
          'Counter online dan tasbih online yang ringan untuk menghitung aktivitas harian dengan cepat.',
      },
      '/waktu': {
        title: 'Countdown Online dan Timer Online | Timer Online',
        description:
          'Countdown online dan timer online untuk bantu fokus kerja, belajar, olahraga, dan rutinitas harian.',
      },
      default: {
        title: 'Timer Online, Countdown Online, Tasbih Online',
        description:
          'Aplikasi timer online serbaguna berisi countdown online, counter, dan tasbih online dalam satu tempat.',
      },
    }

    const currentSeo = seoByPath[location.pathname] || seoByPath.default

    const setMetaByName = (name, content) => {
      let tag = document.head.querySelector(`meta[name="${name}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', name)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    const setMetaByProperty = (property, content) => {
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
    setMetaByName('description', currentSeo.description)
    setMetaByName('keywords', defaultKeywords)
    setMetaByName('twitter:title', currentSeo.title)
    setMetaByName('twitter:description', currentSeo.description)
    setMetaByProperty('og:title', currentSeo.title)
    setMetaByProperty('og:description', currentSeo.description)
    setMetaByProperty('og:url', canonicalHref)
  }, [location.pathname])

  const isWaktuPage = location.pathname === '/waktu' || location.pathname === '/countdown'

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <h1 className="app-title">Tools</h1>
          <div className="theme-switcher" ref={themeMenuRef}>
            <span className="theme-label" />
            <div className="theme-menu-wrap">
              <button
                type="button"
                className="theme-gear-btn"
                onClick={() => setIsThemeMenuOpen((prev) => !prev)}
                aria-label="Buka pengaturan theme"
                aria-expanded={isThemeMenuOpen}
              >
                ⚙
              </button>

              {isThemeMenuOpen && (
                <div className="theme-popup-menu" role="menu" aria-label="Theme menu">
                  <button
                    type="button"
                    className={themeOptionClassName('system')}
                    onClick={() => {
                      setThemeMode('system')
                      setIsThemeMenuOpen(false)
                    }}
                  >
                    Device
                  </button>

                  <button
                    type="button"
                    className={themeOptionClassName('light')}
                    onClick={() => {
                      setThemeMode('light')
                      setIsThemeMenuOpen(false)
                    }}
                  >
                    Light
                  </button>

                  <button
                    type="button"
                    className={themeOptionClassName('dark')}
                    onClick={() => {
                      setThemeMode('dark')
                      setIsThemeMenuOpen(false)
                    }}
                  >
                    Dark
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="menu-dock">
        <nav className="top-menu" aria-label="Main navigation">
          <NavLink to="/counter" className={menuLinkClassName}>
            <CounterIcon />
            <span className="menu-link-label">Counter</span>
          </NavLink>
          <NavLink to="/waktu" className={menuLinkClassName}>
            <CountdownIcon />
            <span className="menu-link-label">Waktu</span>
          </NavLink>
        </nav>
      </div>

      {isActive && !isWaktuPage && (
        <NavLink to="/waktu" className="floating-countdown-chip">
          <span className="floating-countdown-label">Hitung Mundur</span>
          <strong>{formattedTime}</strong>
        </NavLink>
      )}

      <main className="app-main">
        <div className="card app-card">
          <div className="feature-panel">
            <Routes>
            <Route path="/" element={<Navigate to="/counter" replace />} />
            <Route path="/counter" element={<CounterCountFeature />} />
            <Route path="/waktu" element={<CountdownFeature />} />
            <Route path="/countdown" element={<Navigate to="/waktu" replace />} />
            <Route path="*" element={<Navigate to="/counter" replace />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
