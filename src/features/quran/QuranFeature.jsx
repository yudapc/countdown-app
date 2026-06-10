import { createPortal } from 'react-dom'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuranList, useSurahDetail, useJuzDetail } from './hooks'
import { useHeader, useAudio } from '../../shared'
import { saveLastRead, getLastRead, findJuzForAyah } from './lastRead'

const Juz_LIST = Array.from({ length: 30 }, (_, i) => i + 1)

const BISMILLAH = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ'
const stripTashkeel = (s) => s.replace(/[ً-ٰٟ]/g, '')

const SearchInput = ({ value, onChange, placeholder }) => (
  <div className="search-wrap">
    <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
    <input
      type="search"
      className="search-input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
)

const SurahList = () => {
  const { surahs, loading } = useQuranList()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = Array.isArray(surahs)
    ? surahs.filter((s) => {
        const q = search.toLowerCase()
        const name = (s.name_latin || s.name || '').toLowerCase()
        return name.includes(q)
      })
    : []

  if (loading) {
    return (
      <div className="list-loader">
        <div className="spinner" />
        <span>Memuat daftar surah...</span>
      </div>
    )
  }

  return (
    <div className="surah-list">
      <SearchInput value={search} onChange={setSearch} placeholder="Cari surah..." />
      {filtered.map((s) => (
        <button
          key={s.number}
          className="surah-card"
          onClick={() => navigate(`/quran/${s.number}`)}
        >
          <div className="surah-num">{s.number}</div>
          <div className="surah-info">
            <span className="surah-name">{s.name_latin || s.name}</span>
            <span className="surah-meta">
              {s.revelation || ''} · {s.number_of_ayahs || ''} Ayat
            </span>
          </div>
        </button>
      ))}
      {filtered.length === 0 && (
        <div className="empty-state"><p>Surah tidak ditemukan</p></div>
      )}
    </div>
  )
}

const JuzList = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = Juz_LIST.filter((j) =>
    String(j).includes(search) || `juz ${j}`.includes(search.toLowerCase())
  )

  return (
    <div className="juz-list">
      <SearchInput value={search} onChange={setSearch} placeholder="Cari juz..." />
      <div className="juz-grid">
        {filtered.map((j) => (
          <button key={j} className="juz-card" onClick={() => navigate(`/quran/juz/${j}`)}>
            <span className="juz-num">{j}</span>
            <span className="juz-label">Juz {j}</span>
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="empty-state"><p>Juz tidak ditemukan</p></div>
      )}
    </div>
  )
}

const AyahCard = ({ ayah, id, onLongPress, ...rest }) => {
  const handleContextMenu = (e) => {
    e.preventDefault()
    onLongPress?.(ayah)
  }

  return (
    <div
      className={`ayah-card ${ayah.ayah_number}`}
      id={id}
      onContextMenu={handleContextMenu}
      {...rest}
    >
      <div className="ayah-num">{ayah.ayah_number}</div>
      <div className="ayah-arab">{ayah.arab}</div>
      <div className="ayah-latin">{ayah.transliteration}</div>
      <div className="ayah-trans">{ayah.translation}</div>
    </div>
  )
}

const AudioPlayer = ({ surahNumber, audioUrl, surahName }) => {
  const { currentSurah, playing, toggleSurah } = useAudio()
  const isThisPlaying = currentSurah?.number === surahNumber && playing

  return (
    <button className={`audio-btn ${isThisPlaying ? 'is-playing' : ''}`} onClick={() => toggleSurah(surahNumber, surahName, audioUrl)} aria-label={isThisPlaying ? 'Jeda' : 'Putar'} title={isThisPlaying ? 'Jeda' : `Putar ${surahName}`}>
      {isThisPlaying ? (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  )
}

const SurahView = ({ number, onBack }) => {
  const { surah, loading, error } = useSurahDetail(number)
  const { setHeader, clearHeader } = useHeader()
  const navigate = useNavigate()
  const location = useLocation()
  const [gotoOpen, setGotoOpen] = useState(false)
  const [gotoValue, setGotoValue] = useState('')
  const [scrollToAyah, setScrollToAyah] = useState(null)
  const gotoInputRef = useRef(null)
  const externalScrollDoneRef = useRef(false)
  const [contextMenuAyah, setContextMenuAyah] = useState(null)
  const [showConfirmOverwrite, setShowConfirmOverwrite] = useState(false)
  const lastRead = getLastRead()

  // ── Scroll to ayah (internal goto) ────────────────────────────
  useEffect(() => {
    if (scrollToAyah !== null) {
      const el = document.getElementById(`surah-ayah-${scrollToAyah}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('ayah-highlight')
        setTimeout(() => el.classList.remove('ayah-highlight'), 2000)
      }
      setScrollToAyah(null)
    }
  }, [scrollToAyah])

  // ── Scroll to ayah from external navigation (e.g. last read) ──
  useEffect(() => {
    if (!surah || externalScrollDoneRef.current) return
    const target = location.state?.scrollToAyah
    if (!target) return

    const el = document.getElementById(`surah-ayah-${target}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ayah-highlight')
      setTimeout(() => el.classList.remove('ayah-highlight'), 2000)
    }
    externalScrollDoneRef.current = true
    navigate(location.pathname, { replace: true, state: {} })
  }, [surah, location.state?.scrollToAyah, location.pathname, navigate])

  // ── Long press → show context menu ────────────────────────────
  const handleLongPress = useCallback(
    (ayahData) => {
      setShowConfirmOverwrite(false)
      setContextMenuAyah({
        ayahNumber: ayahData.ayah_number,
        surahNumber: surah.number,
        surahName: surah.name_latin || surah.name || '',
      })
    },
    [surah]
  )

  // ── Context menu: "Tandai terakhir dibaca" ────────────────────
  const handleMarkLastRead = () => {
    if (lastRead) {
      setShowConfirmOverwrite(true)
    } else {
      saveLastRead({
        surahNumber: contextMenuAyah.surahNumber,
        ayahNumber: contextMenuAyah.ayahNumber,
        surahName: contextMenuAyah.surahName,
      })
      setContextMenuAyah(null)
    }
  }

  // ── Confirm overwrite ─────────────────────────────────────────
  const handleConfirmOverwrite = () => {
    saveLastRead({
      surahNumber: contextMenuAyah.surahNumber,
      ayahNumber: contextMenuAyah.ayahNumber,
      surahName: contextMenuAyah.surahName,
    })
    setContextMenuAyah(null)
    setShowConfirmOverwrite(false)
  }

  const handleCancelAll = () => {
    setContextMenuAyah(null)
    setShowConfirmOverwrite(false)
  }

  useEffect(() => {
    if (gotoOpen) {
      setTimeout(() => gotoInputRef.current?.focus(), 100)
    }
  }, [gotoOpen])

  useEffect(() => {
    const name = surah?.name_latin || surah?.name || 'Surah'
    setHeader(name, onBack)
    return () => clearHeader()
  }, [surah, onBack, setHeader, clearHeader])

  const handleGoto = (e) => {
    e.preventDefault()
    const num = parseInt(gotoValue, 10)
    const total = surah?.number_of_ayahs || surah?.ayahs?.length || 0
    if (num >= 1 && num <= total) {
      setScrollToAyah(num)
      setGotoOpen(false)
    }
    setGotoValue('')
  }

  if (loading) {
    return (
      <div className="list-loader">
        <div className="spinner" />
        <span>Memuat surah...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="list-loader">
        <span className="error-text">{error}</span>
        <button className="secondary-btn" onClick={onBack}>Kembali</button>
      </div>
    )
  }

  const verses = surah?.ayahs || []
  const nameLatin = surah?.name_latin || surah?.name || ''
  const arabicName = surah?.name || ''
  const revelation = surah?.revelation || ''
  const totalAyahs = surah?.number_of_ayahs || verses.length
  const audioUrl = surah?.audio_url || ''
  const hideBismillah = verses[0]?.arab && stripTashkeel(verses[0].arab) === stripTashkeel(BISMILLAH)

  return (
    <div className="surah-view">
      <div className="surah-header-card">
        <div className="surah-header-info">
          <h2 className="surah-view-title">{nameLatin}</h2>
          <p className="surah-view-meta">
            {arabicName} · {revelation} · {totalAyahs} Ayat
          </p>
        </div>
        {audioUrl && <AudioPlayer surahNumber={number} audioUrl={audioUrl} surahName={nameLatin} />}
        <button className="goto-icon-btn" onClick={() => setGotoOpen(true)} aria-label="Lompat ke ayat" title="Lompat ke ayat">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="20" height="20">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        </button>
      </div>
      {!hideBismillah && <div className="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>}
      {gotoOpen && (
        <div className="goto-overlay" onClick={() => setGotoOpen(false)}>
          <div className="goto-popup" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleGoto}>
              <label className="goto-label">Lompat ke ayat</label>
              <input
                ref={gotoInputRef}
                className="goto-input"
                type="number"
                min={1}
                max={totalAyahs}
                placeholder={`1 – ${totalAyahs}`}
                value={gotoValue}
                onChange={(e) => setGotoValue(e.target.value)}
              />
              <button className="goto-btn" type="submit">Go</button>
            </form>
          </div>
        </div>
      )}
      <div className="ayah-list">
        {Array.isArray(verses) && verses.map((ayah, idx) => (
          <AyahCard key={ayah.id || ayah.ayah_number || idx} id={`surah-ayah-${ayah.ayah_number}`} ayah={ayah} data-ayah-number={ayah.ayah_number} onLongPress={handleLongPress} />
        ))}
      </div>
      {contextMenuAyah && !showConfirmOverwrite && (
        <BottomDrawer onClose={handleCancelAll}>
          <div className="bottom-drawer-title">Tandai terakhir dibaca</div>
          <div className="bottom-drawer-ayah">{contextMenuAyah.surahName} · Ayat {contextMenuAyah.ayahNumber}</div>
          <div className="bottom-drawer-actions">
            <button className="goto-btn" onClick={handleMarkLastRead}>
              📑 Tandai
            </button>
            <button className="secondary-btn" onClick={handleCancelAll}>
              Batal
            </button>
          </div>
        </BottomDrawer>
      )}
      {showConfirmOverwrite && contextMenuAyah && lastRead && (
        <BottomDrawer onClose={handleCancelAll}>
          <div className="bottom-drawer-title">Konfirmasi</div>
          <p className="bottom-drawer-info">
            Apakah anda yakin untuk merubah{' '}
            <strong>{lastRead.surahName || `Surah ${lastRead.surahNumber}`} · Ayat {lastRead.ayahNumber}</strong>
            {' '}menjadi{' '}
            <strong>{contextMenuAyah.surahName} · Ayat {contextMenuAyah.ayahNumber}</strong>
            ?
          </p>
          <div className="bottom-drawer-actions">
            <button className="goto-btn" onClick={handleConfirmOverwrite}>
              Ya, Simpan
            </button>
            <button className="secondary-btn" onClick={handleCancelAll}>
              Batal
            </button>
          </div>
        </BottomDrawer>
      )}
    </div>
  )
}

const JuzView = ({ number, onBack }) => {
  const { verses, loading, error } = useJuzDetail(number)
  const navigate = useNavigate()
  const location = useLocation()
  const externalScrollDoneRef = useRef(null)
  const [contextMenuAyah, setContextMenuAyah] = useState(null)
  const [showConfirmOverwrite, setShowConfirmOverwrite] = useState(false)
  const lastRead = getLastRead()

  // ── Scroll to ayah from external navigation (e.g. last read) ──
  useEffect(() => {
    if (!verses?.length || externalScrollDoneRef.current) return
    const targetAyah = location.state?.scrollToAyah
    const targetSurah = location.state?.scrollToSurah
    if (!targetAyah || !targetSurah) return

    const el = document.getElementById(`juz-ayah-${targetSurah}-${targetAyah}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ayah-highlight')
      setTimeout(() => el.classList.remove('ayah-highlight'), 2000)
    }
    externalScrollDoneRef.current = true
    navigate(location.pathname, { replace: true, state: {} })
  }, [verses, location.state?.scrollToAyah, location.state?.scrollToSurah, location.pathname, navigate])

  // ── Long press → show context menu ────────────────────────────
  const handleLongPress = useCallback((ayahData) => {
    setShowConfirmOverwrite(false)
    setContextMenuAyah({
      ayahNumber: ayahData.ayah_number,
      surahNumber: ayahData.surah_number,
      surahName: ayahData.surah_name || '',
    })
  }, [])

  // ── Context menu: "Tandai terakhir dibaca" ────────────────────
  const handleMarkLastRead = () => {
    if (lastRead) {
      setShowConfirmOverwrite(true)
    } else {
      saveLastRead({
        surahNumber: contextMenuAyah.surahNumber,
        ayahNumber: contextMenuAyah.ayahNumber,
        surahName: contextMenuAyah.surahName,
      })
      setContextMenuAyah(null)
    }
  }

  // ── Confirm overwrite ─────────────────────────────────────────
  const handleConfirmOverwrite = () => {
    saveLastRead({
      surahNumber: contextMenuAyah.surahNumber,
      ayahNumber: contextMenuAyah.ayahNumber,
      surahName: contextMenuAyah.surahName,
    })
    setContextMenuAyah(null)
    setShowConfirmOverwrite(false)
  }

  const handleCancelAll = () => {
    setContextMenuAyah(null)
    setShowConfirmOverwrite(false)
  }

  if (loading) {
    return (
      <div className="list-loader">
        <div className="spinner" />
        <span>Memuat juz...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="list-loader">
        <span className="error-text">{error}</span>
        <button className="secondary-btn" onClick={onBack}>Kembali</button>
      </div>
    )
  }

  return (
    <div className="surah-view">
      <div className="surah-header-card">
        <h2 className="surah-view-title">Juz {number}</h2>
        <p className="surah-view-meta">{verses.length} Ayat</p>
      </div>
      <div className="ayah-list">
        {Array.isArray(verses) && verses.map((ayah, idx) => (
          <AyahCard key={ayah.id || ayah.ayah_number || idx} id={`juz-ayah-${ayah.surah_number}-${ayah.ayah_number}`} ayah={ayah} data-ayah-number={ayah.ayah_number} data-surah-number={ayah.surah_number} data-surah-name={ayah.surah_name} onLongPress={handleLongPress} />
        ))}
      </div>
      {contextMenuAyah && !showConfirmOverwrite && (
        <BottomDrawer onClose={handleCancelAll}>
          <div className="bottom-drawer-title">Tandai terakhir dibaca</div>
          <div className="bottom-drawer-ayah">{contextMenuAyah.surahName} · Ayat {contextMenuAyah.ayahNumber}</div>
          <div className="bottom-drawer-actions">
            <button className="goto-btn" onClick={handleMarkLastRead}>
              📑 Tandai
            </button>
            <button className="secondary-btn" onClick={handleCancelAll}>
              Batal
            </button>
          </div>
        </BottomDrawer>
      )}
      {showConfirmOverwrite && contextMenuAyah && lastRead && (
        <BottomDrawer onClose={handleCancelAll}>
          <div className="bottom-drawer-title">Konfirmasi</div>
          <p className="bottom-drawer-info">
            Apakah anda yakin untuk merubah{' '}
            <strong>{lastRead.surahName || `Surah ${lastRead.surahNumber}`} · Ayat {lastRead.ayahNumber}</strong>
            {' '}menjadi{' '}
            <strong>{contextMenuAyah.surahName} · Ayat {contextMenuAyah.ayahNumber}</strong>
            ?
          </p>
          <div className="bottom-drawer-actions">
            <button className="goto-btn" onClick={handleConfirmOverwrite}>
              Ya, Simpan
            </button>
            <button className="secondary-btn" onClick={handleCancelAll}>
              Batal
            </button>
          </div>
        </BottomDrawer>
      )}
    </div>
  )
}

const LastReadCard = ({ lastRead, onContinue }) => {
  if (!lastRead) return null

  return (
    <div className="last-read-card" onClick={onContinue}>
      <div className="last-read-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="20" height="20">
          <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h2v8l2.5-1.5L13 12V4h5v16z" />
        </svg>
      </div>
      <div className="last-read-info">
        <span className="last-read-label">Terakhir dibaca</span>
        <span className="last-read-detail">
          {lastRead.surahName || `Surah ${lastRead.surahNumber}`} · Ayat {lastRead.ayahNumber}
        </span>
      </div>
      <svg className="last-read-chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="20" height="20">
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
      </svg>
    </div>
  )
}

const LastReadOverlay = ({ lastRead, onSurahMode, onJuzMode, onClose }) => {
  return (
    <div className="goto-overlay" onClick={onClose}>
      <div className="goto-popup" onClick={(e) => e.stopPropagation()}>
        <h3 className="last-read-popup-title">Lanjutkan membaca</h3>
        <p className="last-read-popup-info">
          {lastRead.surahName || `Surah ${lastRead.surahNumber}`} · Ayat {lastRead.ayahNumber}
        </p>
        <div className="last-read-popup-actions">
          <button className="goto-btn" onClick={onSurahMode}>
            Buka mode Surah
          </button>
          <button className="goto-btn" onClick={onJuzMode}>
            Buka mode Juz
          </button>
          <button className="secondary-btn" onClick={onClose}>
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}

const BottomDrawer = ({ children, onClose }) =>
  createPortal(
    <div className="bottom-drawer-overlay" onClick={onClose}>
      <div className="bottom-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-drawer-handle" />
        {children}
      </div>
    </div>,
    document.body
  )

const QuranFeature = () => {
  const { surahNumber, juzNumber } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { setHeader, clearHeader } = useHeader()
  const backToSurahList = useCallback(() => navigate('/quran', { state: { mode: 'surah' } }), [navigate])
  const backToJuzList = useCallback(() => navigate('/quran', { state: { mode: 'juz' } }), [navigate])

  useEffect(() => {
    if (juzNumber) {
      setHeader(`Juz ${juzNumber}`, backToJuzList)
    } else if (!surahNumber) {
      clearHeader()
    }
    return () => {
      if (juzNumber) clearHeader()
    }
  }, [surahNumber, juzNumber, backToJuzList, setHeader, clearHeader])

  const [mode, setMode] = useState(() => location.state?.mode || 'surah')
  const [showLastReadDialog, setShowLastReadDialog] = useState(false)
  const lastRead = getLastRead()

  const handleLastReadSurah = () => {
    setShowLastReadDialog(false)
    navigate(`/quran/${lastRead.surahNumber}`, {
      state: { scrollToAyah: lastRead.ayahNumber },
    })
  }

  const handleLastReadJuz = () => {
    setShowLastReadDialog(false)
    const juz = findJuzForAyah(lastRead.surahNumber, lastRead.ayahNumber)
    if (!juz) return
    navigate(`/quran/juz/${juz}`, {
      state: { scrollToAyah: lastRead.ayahNumber, scrollToSurah: lastRead.surahNumber },
    })
  }

  if (surahNumber) {
    return (
      <SurahView
        number={Number(surahNumber)}
        onBack={backToSurahList}
      />
    )
  }

  if (juzNumber) {
    return (
      <JuzView
        number={Number(juzNumber)}
        onBack={backToJuzList}
      />
    )
  }

  return (
    <div className="quran-page">
      <div className="page-header">
        <h2 className="page-title"></h2>
      </div>
      {lastRead && (
        <LastReadCard lastRead={lastRead} onContinue={() => setShowLastReadDialog(true)} />
      )}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === 'surah' ? 'active' : ''}`}
          onClick={() => setMode('surah')}
        >
          Surah
        </button>
        <button
          className={`mode-btn ${mode === 'juz' ? 'active' : ''}`}
          onClick={() => setMode('juz')}
        >
          Per Juz
        </button>
      </div>
      {mode === 'surah' ? <SurahList /> : <JuzList />}
      {showLastReadDialog && lastRead && (
        <LastReadOverlay
          lastRead={lastRead}
          onSurahMode={handleLastReadSurah}
          onJuzMode={handleLastReadJuz}
          onClose={() => setShowLastReadDialog(false)}
        />
      )}
    </div>
  )
}

export default QuranFeature
