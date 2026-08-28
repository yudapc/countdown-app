import '../App.css'
import { useEffect, useState } from 'react'
import { TasbihFeature, QuranFeature, HaditsFeature, WaktuSholatFeature } from '../features'
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useCountdown, useLocalStorageState, useHeader, useAudio } from '../shared'
import { PullToRefresh } from '../shared/components'

const TAB_NAMES = {
  '/sholat': 'Waktu Sholat',
  '/quran': 'Al-Quran',
  '/hadits': 'Hadits',
  '/tasbih': 'Tasbih',
}

function SholatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
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

const QuranListPage = () => <QuranFeature />
const QuranSurahPage = () => <QuranFeature />
const QuranJuzPage = () => <QuranFeature />
const HaditsListPage = () => <HaditsFeature />
const HaditsDetailPage = () => <HaditsFeature />
const SholatPage = () => <WaktuSholatFeature />

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isActive, formattedTime } = useCountdown()
  const { title: headerTitle, onBack: headerOnBack } = useHeader()
  const { currentSurah, playing: audioPlaying } = useAudio()
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
      '/sholat': {
        title: 'Waktu Sholat | Muslim',
        description: 'Jadwal waktu sholat, arah kiblat, dan azan berdasarkan lokasi Anda.',
      },
      '/quran': {
        title: 'Al-Quran | Muslim',
        description: 'Baca Al-Quran dengan terjemahan dan tafsir.',
      },
      '/hadits': {
        title: 'Hadits | Muslim',
        description: 'Kumpulan hadits dari berbagai perawi.',
      },
      '/tasbih': {
        title: 'Tasbih | Muslim',
        description: 'Tasbih digital dan countdown timer.',
      },
      default: {
        title: 'Muslim - Waktu Sholat, Quran, Hadits & Tasbih',
        description: 'Aplikasi Muslim: Waktu Sholat, Arah Kiblat, Al-Quran, Hadits, Tasbih, dan Countdown.',
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

  const isTasbihPage = location.pathname === '/tasbih'
  const showDetailBack = headerTitle && headerOnBack
  const defaultTitle = TAB_NAMES[location.pathname] || 'Muslim'

  const isSameSurahAudio = currentSurah && location.pathname === `/quran/${currentSurah.number}`

  const handleAudioChipClick = () => {
    if (currentSurah) {
      navigate(`/quran/${currentSurah.number}`)
    }
  }

  const handleScrollToTop = () => {
    const main = document.querySelector('.app-main')
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' })
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
            <span className="header-back-title" onClick={handleScrollToTop}>{headerTitle}</span>
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
              <Route path="/" element={<Navigate to="/sholat" replace />} />
              <Route path="/sholat" element={<SholatPage />} />
              <Route path="/quran" element={<QuranListPage />} />
              <Route path="/quran/juz/:juzNumber" element={<QuranJuzPage />} />
              <Route path="/quran/:surahNumber" element={<QuranSurahPage />} />
              <Route path="/hadits" element={<HaditsListPage />} />
              <Route path="/hadits/:slug" element={<HaditsDetailPage />} />
              <Route path="/tasbih" element={<TasbihFeature />} />
              <Route path="/waktu" element={<Navigate to="/sholat" replace />} />
              <Route path="/countdown" element={<Navigate to="/tasbih" replace />} />
              <Route path="/counter" element={<Navigate to="/tasbih" replace />} />
              <Route path="*" element={<Navigate to="/sholat" replace />} />
            </Routes>
          </div>
        </PullToRefresh>
      </main>

      {isActive && !isTasbihPage && (
        <button className="chip chip-countdown" onClick={() => navigate('/tasbih', { state: { subTab: 'timer' } })}>
          <span className="chip-label">Hitung Mundur</span>
          <span className="chip-time">{formattedTime}</span>
        </button>
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
        <NavLink to="/sholat" aria-label="Waktu Sholat" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
          <SholatIcon />
          <span className="tab-label">Sholat</span>
        </NavLink>
        <NavLink to="/quran" aria-label="Al-Quran" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
          <QuranIcon />
          <span className="tab-label">Al-Quran</span>
        </NavLink>
        <NavLink to="/hadits" aria-label="Hadits" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
          <HaditsIcon />
          <span className="tab-label">Hadits</span>
        </NavLink>
        <NavLink to="/tasbih" aria-label="Tasbih" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
          <TasbihIcon />
          <span className="tab-label">Tasbih</span>
        </NavLink>
      </nav>
    </div>
  )
}

export default App
