const CACHE_PREFIX = 'muslim-cache-'

export const getCached = (key) => {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const { data } = JSON.parse(raw)
    return data
  } catch {
    return null
  }
}

export const setCache = (key, data) => {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data }))
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export const clearAllCache = () => {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX))
  keys.forEach((k) => localStorage.removeItem(k))
}
