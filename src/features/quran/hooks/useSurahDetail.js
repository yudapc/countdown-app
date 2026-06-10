import { useState, useEffect } from 'react'
import { getCached, setCache } from '../../../shared/utils'

export const useSurahDetail = (number) => {
  const [surah, setSurah] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!number) return
    let cancelled = false
    const cacheKey = `surah-${number}`

    const cached = getCached(cacheKey)
    if (cached) {
      setSurah(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    fetch(`https://api.myquran.com/v3/quran/${number}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          if (data.status === false) {
            setError(data.message || 'Gagal memuat surah')
          } else {
            setCache(cacheKey, data.data)
            setSurah(data.data)
          }
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [number])

  return { surah, loading, error }
}
