import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuranList, useSurahDetail, useJuzDetail } from './hooks'
import { useHeader, useAudio } from '../../shared'

const Juz_LIST = Array.from({ length: 30 }, (_, i) => i + 1)

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

const AyahCard = ({ ayah }) => {
  return (
    <div className="ayah-card">
      <div className="ayah-num">{ayah.ayah_number}</div>
      <div className="ayah-arab">{ayah.arab}</div>
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

  useEffect(() => {
    const name = surah?.name_latin || surah?.name || 'Surah'
    setHeader(name, onBack)
    return () => clearHeader()
  }, [surah, onBack, setHeader, clearHeader])

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
      </div>
      <div className="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
      <div className="ayah-list">
        {Array.isArray(verses) && verses.map((ayah, idx) => (
          <AyahCard key={ayah.id || ayah.ayah_number || idx} ayah={ayah} />
        ))}
      </div>
    </div>
  )
}

const JuzView = ({ number, onBack }) => {
  const { verses, loading, error } = useJuzDetail(number)

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
          <AyahCard key={ayah.id || ayah.ayah_number || idx} ayah={ayah} />
        ))}
      </div>
    </div>
  )
}

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
    </div>
  )
}

export default QuranFeature
