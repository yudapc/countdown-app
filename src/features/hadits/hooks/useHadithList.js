import { useState, useEffect } from 'react'
import { getCached, setCache } from '../../../shared/utils'

export const useHadithList = (slug) => {
  const [hadiths, setHadiths] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    const cacheKey = `hadits-explore-${page}`

    const cached = getCached(cacheKey)
    if (cached) {
      setHadiths(cached.hadiths)
      setTotalPages(cached.totalPages)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    fetch(`https://api.myquran.com/v3/hadis/enc/explore?page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          if (data.status === false) {
            setError(data.message || 'Gagal memuat hadits')
          } else {
            const hadithList = data.data?.hadis || data.data || []
            const pages = data.data?.paging?.total_pages || 1
            setCache(cacheKey, { hadiths: hadithList, totalPages: pages })
            setHadiths(hadithList)
            setTotalPages(pages)
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
  }, [slug, page])

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) {
      setPage(p)
    }
  }

  return { hadiths, loading, error, page, totalPages, goToPage }
}
