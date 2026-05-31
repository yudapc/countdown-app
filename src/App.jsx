import './App.css'
import React, { useEffect, useRef, useState } from 'react'
import { CountdownFeature, CounterCountFeature } from './features'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { ActionRow, useCountdown, useLocalStorageState } from './shared'

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

  const isCountdownPage = location.pathname === '/countdown'

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <h1 className="app-title">Tools</h1>
          <div className="theme-switcher" ref={themeMenuRef}>
            <span className="theme-label">Theme</span>
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

      {isActive && !isCountdownPage && (
        <NavLink to="/countdown" className="floating-countdown-chip">
          <span className="floating-countdown-label">Countdown Berjalan</span>
          <strong>{formattedTime}</strong>
        </NavLink>
      )}

      <main className="app-main">
        <div className="card app-card">
          <p className="product-subtitle" />

          <ActionRow style={{ marginBottom: '20px', flexWrap: 'wrap' }}>
            <NavLink to="/counter" className={menuLinkClassName}>
              1. Counter Count
            </NavLink>
            <NavLink to="/countdown" className={menuLinkClassName}>
              2. Count Down
            </NavLink>
          </ActionRow>

          <div className="feature-panel">
            <Routes>
            <Route path="/" element={<Navigate to="/counter" replace />} />
            <Route path="/counter" element={<CounterCountFeature />} />
            <Route path="/countdown" element={<CountdownFeature />} />
            <Route path="*" element={<Navigate to="/counter" replace />} />
            </Routes>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p className="copyright-text">
          Copyright 2026. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default App
