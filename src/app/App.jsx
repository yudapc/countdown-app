import '../App.css'
import { useEffect, useState } from 'react'
import { CountdownFeature, TasbihFeature, QuranFeature, HaditsFeature } from '../features'
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useCountdown, useLocalStorageState, useHeader, useAudio } from '../shared'
import { PullToRefresh } from '../shared/components'

const TAB_NAMES = {
  '/tasbih': 'Tasbih',
  '/waktu': 'Waktu',
  '/quran': 'Al-Quran',
  '/hadits': 'Hadits',
}

function TasbihIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="16" cy="8" r="1.5" />
      <circle cx="8" cy="16" r="1.5" />
      <circle cx="16" cy="16" r="1.5" />
    </svg>
  )
}

function WaktuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M11 2h2v3h-2V2Zm6.36 3.22 1.42 1.42-2.12 2.12-1.42-1.42 2.12-2.12ZM12 7a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm1 4.5V11h-2v4.25l3.25 1.95 1-1.64-2.25-1.35Z" />
    </svg>
  )
}

function QuranIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M21 4c-1.1 0-2 .9-2 2v14H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h16zm0 2H5v12h14V6z" />
      <path d="M7 8.5h10v1H7z" />
      <path d="M7 11.5h8v1H7z" />
      <path d="M7 14.5h6v1H7z" />
    </svg>
  )
}

function HaditsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h3c.3 0 .5-.1.7-.3L12 17.4l3.3 3.3c.2.2.4.3.7.3h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
      <path d="M7 8.5h7v1H7z" />
      <path d="M7 11.5h7v1H7z" />
      <path d="M7 14.5h5v1H7z" />
    </svg>
  )
}

const QuranListPage = () => <QuranFeature />
const QuranSurahPage = () => <QuranFeature />
const QuranJuzPage = () => <QuranFeature />
const HaditsListPage = () => <HaditsFeature />
const HaditsDetailPage = () => <HaditsFeature />

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isActive, formattedTime } = useCountdown()
  const { title: headerTitle, onBack: headerOnBack } = useHeader()
  const { currentSurah, playing: audioPlaying, toggleSurah } = useAudio()
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
  }, [themeMode, deviceTheme])

  const toggleTheme = () => {
    setThemeMode((prev) => {
      if (prev === 'system') return 'light'
      if (prev === 'light') return 'dark'
      return 'system'
    })
  }

  useEffect(() => {
    const seoByPath = {
      '/tasbih': {
        title: 'Tasbih Digital | Muslim',
        description: 'Tasbih digital untuk dzikir dan hitungan ibadah harian.',
      },
      '/waktu': {
        title: 'Countdown | Muslim',
        description: 'Countdown untuk fokus dan rutinitas harian.',
      },
      '/quran': {
        title: 'Al-Quran | Muslim',
        description: 'Baca Al-Quran dengan terjemahan dan tafsir.',
      },
      '/hadits': {
        title: 'Hadits | Muslim',
        description: 'Kumpulan hadits dari berbagai perawi.',
      },
      default: {
        title: 'Muslim - Tasbih, Quran, Hadits & Countdown',
        description: 'Aplikasi Muslim: Tasbih digital, Al-Quran, Hadits, dan Countdown.',
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
  const showDetailBack = headerTitle && headerOnBack
  const defaultTitle = TAB_NAMES[location.pathname] || 'Muslim'

  const isSameSurahAudio = currentSurah && location.pathname === `/quran/${currentSurah.number}`
  const showAudioChip = audioPlaying && currentSurah && !isSameSurahAudio

  const handleAudioChipClick = () => {
    if (currentSurah) {
      navigate(`/quran/${currentSurah.number}`)
    }
  }

  const handleRefresh = () => {
    if ('caches' in window) {
      caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))))
    }
    window.location.reload()
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        {showDetailBack ? (
          <div className="header-back-row">
            <button className="header-back-btn" onClick={headerOnBack} aria-label="Kembali">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z" />
              </svg>
            </button>
            <span className="header-back-title">{headerTitle}</span>
          </div>
        ) : (
          <h1>{defaultTitle}</h1>
        )}
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
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="tab-content" key={location.pathname}>
            <Routes>
              <Route path="/" element={<Navigate to="/tasbih" replace />} />
              <Route path="/tasbih" element={<TasbihFeature />} />
              <Route path="/waktu" element={<CountdownFeature />} />
              <Route path="/quran" element={<QuranListPage />} />
              <Route path="/quran/juz/:juzNumber" element={<QuranJuzPage />} />
              <Route path="/quran/:surahNumber" element={<QuranSurahPage />} />
              <Route path="/hadits" element={<HaditsListPage />} />
              <Route path="/hadits/:slug" element={<HaditsDetailPage />} />
              <Route path="/countdown" element={<Navigate to="/waktu" replace />} />
              <Route path="/counter" element={<Navigate to="/tasbih" replace />} />
              <Route path="*" element={<Navigate to="/tasbih" replace />} />
            </Routes>
          </div>
        </PullToRefresh>
      </main>

      {isActive && !isCountdownPage && (
        <NavLink to="/waktu" className="chip chip-countdown">
          <span className="chip-label">Hitung Mundur</span>
          <span className="chip-time">{formattedTime}</span>
        </NavLink>
      )}

      {audioPlaying && currentSurah && !isSameSurahAudio && (
        <button className="chip chip-audio" onClick={handleAudioChipClick}>
          <svg viewBox="0 0 24 24" className="chip-audio-icon" aria-hidden="true" focusable="false">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="chip-label">{currentSurah.name}</span>
        </button>
      )}

      <nav className="bottom-tabs">
        <NavLink to="/tasbih" aria-label="Tasbih" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
          <TasbihIcon />
        </NavLink>
        <NavLink to="/waktu" aria-label="Waktu" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
          <WaktuIcon />
        </NavLink>
        <NavLink to="/quran" aria-label="Quran" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
          <QuranIcon />
        </NavLink>
        <NavLink to="/hadits" aria-label="Hadits" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
          <HaditsIcon />
        </NavLink>
      </nav>
    </div>
  )
}

export default App
