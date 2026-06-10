import { useState, useEffect } from 'react'
import { getCached, setCache } from '../../../shared/utils'

const CACHE_KEY = 'quran-list'

export const useQuranList = () => {
  const [surahs, setSurahs] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const cached = getCached(CACHE_KEY)
    if (cached) {
      setSurahs(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    fetch('https://api.myquran.com/v3/quran')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          const list = data.data || data
          setCache(CACHE_KEY, list)
          setSurahs(list)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return { surahs, loading }
}
