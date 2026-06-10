import { useState, useEffect } from 'react'
import { getCached, setCache } from '../../../shared/utils'

export const useNarrators = () => {
  const [narrators, setNarrators] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const CACHE_KEY = 'hadits-narrators'

  useEffect(() => {
    let cancelled = false

    const cached = getCached(CACHE_KEY)
    if (cached) {
      setNarrators(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    fetch('https://api.myquran.com/v2/hadis/perawi')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          const list = data.data || data
          setCache(CACHE_KEY, list)
          setNarrators(list)
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
  }, [])

  return { narrators, loading, error }
}
