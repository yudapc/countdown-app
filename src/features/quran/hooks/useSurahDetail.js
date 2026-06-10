import { useState, useEffect } from 'react'
import { getSurah } from '../quranData'

export const useSurahDetail = (number) => {
  const [surah, setSurah] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!number) return
    let cancelled = false
    setLoading(true)
    setError(null)

    getSurah(number)
      .then((result) => {
        if (!cancelled) {
          if (!result) {
            setError('Surah tidak ditemukan')
          } else {
            setSurah(result)
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

    return () => {
      cancelled = true
    }
  }, [number])

  return { surah, loading, error }
}
