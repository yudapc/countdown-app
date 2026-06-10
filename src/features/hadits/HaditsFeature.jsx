import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNarrators, useHadithList } from './hooks'
import { useHeader } from '../../shared'

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

const NarratorList = () => {
  const { narrators, loading } = useNarrators()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = Array.isArray(narrators)
    ? narrators.filter((n) => {
        const q = search.toLowerCase()
        const name = (n.nama || n.name || n.slug || '').toLowerCase()
        return name.includes(q)
      })
    : []

  if (loading) {
    return (
      <div className="list-loader">
        <div className="spinner" />
        <span>Memuat data...</span>
      </div>
    )
  }

  return (
    <div className="narrator-list">
      <SearchInput value={search} onChange={setSearch} placeholder="Cari perawi..." />
      {filtered.map((n) => (
        <button
          key={n.slug || n}
          className="narrator-card"
          onClick={() => navigate(`/hadits/${n.slug}`)}
        >
          <div className="narrator-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
            </svg>
          </div>
          <div className="surah-info">
            <span className="narrator-name">{n.nama || n.name || n.slug || n}</span>
          </div>
          {n.total && <span className="narrator-total">{n.total} hadits</span>}
        </button>
      ))}
      {filtered.length === 0 && (
        <div className="empty-state"><p>Perawi tidak ditemukan</p></div>
      )}
    </div>
  )
}

const HadithCard = ({ hadith }) => {
  const arab = hadith?.text?.ar || ''
  const text = hadith?.text?.id || ''
  const num = hadith?.id
  const grade = hadith?.grade || ''
  const source = hadith?.takhrij || ''

  return (
    <div className="hadith-card">
      <div className="hadith-header">
        {num && <span className="hadith-num">Hadits ke-{num}</span>}
        {grade && <span className="hadith-grade">{grade}</span>}
      </div>
      {arab && <p className="hadith-arab">{arab}</p>}
      {text && <p className="hadith-text">{text}</p>}
      {source && <p className="hadith-source">{source}</p>}
    </div>
  )
}

const HaditsView = ({ slug }) => {
  const { hadiths, loading, error, page, totalPages, goToPage } = useHadithList(slug)

  return (
    <div className="hadits-view">
      {loading && (
        <div className="list-loader">
          <div className="spinner" />
          <span>Memuat hadits...</span>
        </div>
      )}

      {error && (
        <div className="list-loader">
          <span className="error-text">{error}</span>
        </div>
      )}

      <div className="hadith-list">
        {Array.isArray(hadiths) && hadiths.map((h, idx) => (
          <HadithCard key={h.id || idx} hadith={h} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pag-btn"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            Sebelumnya
          </button>
          <span className="pag-info">{page} / {totalPages}</span>
          <button
            className="pag-btn"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Selanjutnya
          </button>
        </div>
      )}
    </div>
  )
}

const HaditsFeature = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { setHeader, clearHeader } = useHeader()
  const backToList = useCallback(() => navigate('/hadits'), [navigate])

  useEffect(() => {
    if (slug) {
      setHeader(slug, backToList)
    } else {
      clearHeader()
    }
    return () => clearHeader()
  }, [slug, backToList, setHeader, clearHeader])

  if (slug) {
    return (
      <HaditsView
        slug={slug}
      />
    )
  }

  return (
    <div className="hadits-page">
      <div className="page-header">
        <h2 className="page-title"></h2>
      </div>
      <NarratorList />
    </div>
  )
}

export default HaditsFeature
