import { useState, useEffect } from 'react'
import { getJuz } from '../quranData'

export const useJuzDetail = (number) => {
  const [verses, setVerses] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!number) return
    let cancelled = false
    setLoading(true)
    setError(null)

    getJuz(number)
      .then((result) => {
        if (!cancelled) {
          if (!result || result.length === 0) {
            setError('Juz tidak ditemukan')
          } else {
            setVerses(result)
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

  return { verses, loading, error }
}
