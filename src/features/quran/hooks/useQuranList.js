import { useState, useEffect } from 'react'
import { getSurahs } from '../quranData'

export const useQuranList = () => {
  const [surahs, setSurahs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getSurahs()
      .then((list) => {
        if (!cancelled) {
          setSurahs(list)
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
  }, [])

  return { surahs, loading, error }
}
