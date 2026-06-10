import { useState, useEffect } from 'react'
import { getCached, setCache } from '../../../shared/utils'

export const useJuzDetail = (number) => {
  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!number) return
    let cancelled = false
    const cacheKey = `juz-${number}`

    const cached = getCached(cacheKey)
    if (cached) {
      setVerses(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    fetch(`https://api.myquran.com/v3/quran/juz/${number}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          if (data.status === false) {
            setError(data.message || 'Gagal memuat juz')
          } else {
            const list = data.data || []
            setCache(cacheKey, list)
            setVerses(list)
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

  return { verses, loading, error }
}
