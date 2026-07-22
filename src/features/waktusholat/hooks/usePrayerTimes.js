import { useState, useEffect, useRef, useCallback } from 'react'
import { Coordinates, CalculationMethod, PrayerTimes, Prayer, Qibla } from 'adhan'
import { getCached, setCache } from '../../../shared/utils'

const PRAYER_ORDER = [
  { key: 'imsak', label: 'Imsak' },
  { key: 'subuh', label: 'Subuh' },
  { key: 'terbit', label: 'Terbit' },
  { key: 'dhuhur', label: 'Dhuhur' },
  { key: 'asar', label: 'Asar' },
  { key: 'magrib', label: 'Magrib' },
  { key: 'isya', label: 'Isya' },
]

const PRAYER_MAP = {
  subuh: Prayer.Fajr,
  terbit: Prayer.Sunrise,
  dhuhur: Prayer.Dhuhr,
  asar: Prayer.Asr,
  magrib: Prayer.Maghrib,
  isya: Prayer.Isha,
}

const CITY_DEFAULT = { lat: -6.2, lng: 106.8, name: 'Jakarta' }

const COMPASS_DIRS = [
  { min: 348.75, max: 360, label: 'U' }, { min: 0, max: 11.25, label: 'U' },
  { min: 11.25, max: 33.75, label: 'UTL' },
  { min: 33.75, max: 56.25, label: 'TL' },
  { min: 56.25, max: 78.75, label: 'TTL' },
  { min: 78.75, max: 101.25, label: 'T' },
  { min: 101.25, max: 123.75, label: 'TGG' },
  { min: 123.75, max: 146.25, label: 'TG' },
  { min: 146.25, max: 168.75, label: 'BDG' },
  { min: 168.75, max: 191.25, label: 'S' },
  { min: 191.25, max: 213.75, label: 'BDD' },
  { min: 213.75, max: 236.25, label: 'BD' },
  { min: 236.25, max: 258.75, label: 'BBD' },
  { min: 258.75, max: 281.25, label: 'B' },
  { min: 281.25, max: 303.75, label: 'BBL' },
  { min: 303.75, max: 326.25, label: 'BL' },
  { min: 326.25, max: 348.75, label: 'UBL' },
]

function loadManualLocation() {
  try {
    return JSON.parse(localStorage.getItem('manual-location'))
  } catch { return null }
}

export function usePrayerTimes() {
  const [locationMode, setLocationModeState] = useState(() => localStorage.getItem('location-mode') || 'auto')
  const [location, setLocation] = useState(() => {
    if (localStorage.getItem('location-mode') === 'manual') {
      return loadManualLocation() || CITY_DEFAULT
    }
    return getCached('prayer-location') || CITY_DEFAULT
  })
  const [prayerList, setPrayerList] = useState([])
  const [current, setCurrent] = useState(null)
  const [next, setNext] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adhanEnabled, setAdhanEnabled] = useState(() => localStorage.getItem('adhan-enabled') !== 'false')
  const [qiblaDeg, setQiblaDeg] = useState(null)
  const audioRef = useRef(null)
  const alertingRef = useRef(false)

  const qiblaLabel = useCallback((deg) => {
    if (deg === null) return ''
    const entry = COMPASS_DIRS.find((d) => deg >= d.min && deg < d.max)
    return entry ? entry.label : ''
  }, [])

  const calcAll = useCallback((lat, lng) => {
    const coords = new Coordinates(lat, lng)
    const params = CalculationMethod.Singapore()
    const now = new Date()
    const pt = new PrayerTimes(coords, now, params)
    const fajrMs = pt.fajr.getTime()
    const imsak = new Date(fajrMs - 10 * 60 * 1000)
    const raw = [
      { time: imsak, prayer: null, key: 'imsak' },
      { time: pt.fajr, prayer: Prayer.Fajr, key: 'subuh' },
      { time: pt.sunrise, prayer: Prayer.Sunrise, key: 'terbit' },
      { time: pt.dhuhr, prayer: Prayer.Dhuhr, key: 'dhuhur' },
      { time: pt.asr, prayer: Prayer.Asr, key: 'asar' },
      { time: pt.maghrib, prayer: Prayer.Maghrib, key: 'magrib' },
      { time: pt.isha, prayer: Prayer.Isha, key: 'isya' },
    ]
    const list = raw.map((r) => ({
      ...r,
      label: PRAYER_ORDER.find((p) => p.key === r.key).label,
    }))
    const qibla = Qibla(coords)
    return { list, pt, raw, qibla }
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    try {
      const { list, pt, qibla } = calcAll(location.lat, location.lng)
      setQiblaDeg(qibla)
      const nowMs = Date.now()
      let nextIdx = list.findIndex((p) => p.time.getTime() > nowMs)
      if (nextIdx === -1) nextIdx = 0
      const activeIdx = nextIdx > 0 ? nextIdx - 1 : list.length - 1
      setPrayerList(list.map((p, i) => ({
        ...p,
        isActive: i === activeIdx,
        isNext: i === nextIdx,
      })))
      const currentPrayer = pt.currentPrayer()
      const nextPrayer = pt.nextPrayer()
      setCurrent(PRAYER_ORDER.find((p) => PRAYER_MAP[p.key] === currentPrayer) || null)
      setNext(nextPrayer !== Prayer.None
        ? PRAYER_ORDER.find((p) => PRAYER_MAP[p.key] === nextPrayer) || null
        : PRAYER_ORDER[0])
      setLoading(false)
      setCache(`prayer-location`, location)
    } catch {
      setError('Gagal menghitung waktu sholat')
      setLoading(false)
    }
  }, [location, calcAll])

  const reverseGeocode = useCallback(async (lat, lng, cb) => {
    const cacheKey = `geocode-${lat.toFixed(4)}-${lng.toFixed(4)}`
    const cached = getCached(cacheKey)
    if (cached) { cb?.(cached); return cached }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14&accept-language=id`,
        { headers: { 'User-Agent': 'MuslimApp/1.0' } }
      )
      const data = await res.json()
      const addr = data?.address || {}
      const parts = [addr.city_district || addr.suburb || addr.village, addr.city || addr.state]
      const name = parts.filter(Boolean).join(', ') || 'Lokasi Saya'
      setCache(cacheKey, name)
      cb?.(name)
      return name
    } catch {
      return 'Lokasi Saya'
    }
  }, [])

  const updateCountdown = useCallback(() => {
    setPrayerList((prev) => {
      const nowMs = Date.now()
      let nextIdx = prev.findIndex((p) => p.time.getTime() > nowMs)
      if (nextIdx === -1) nextIdx = 0
      const activeIdx = nextIdx > 0 ? nextIdx - 1 : prev.length - 1
      const diff = prev[nextIdx].time.getTime() - nowMs
      setCountdown(diff > 0 ? Math.ceil(diff / 1000) : 0)
      setNext(PRAYER_ORDER[nextIdx])
      setCurrent(PRAYER_ORDER[activeIdx])
      return prev.map((p, i) => ({
        ...p,
        isActive: i === activeIdx,
        isNext: i === nextIdx,
      }))
    })
  }, [])

  useEffect(() => {
    updateCountdown()
    const id = setInterval(updateCountdown, 1000)
    return () => clearInterval(id)
  }, [updateCountdown])

  useEffect(() => {
    if (!adhanEnabled || !prayerList.length) return
    const nowMs = Date.now()
    for (const p of prayerList) {
      const diff = Math.abs(p.time.getTime() - nowMs)
      if (diff < 30000 && p.prayer !== null) {
        const flag = `adhan-played-${p.key}-${Math.floor(p.time.getTime() / 86400000)}`
        if (!localStorage.getItem(flag)) {
          localStorage.setItem(flag, '1')
          alertingRef.current = true
          if (audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play().catch(() => {})
          }
        }
        break
      }
    }
  }, [prayerList, adhanEnabled, countdown])

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolokasi tidak didukung browser')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setLocation({ lat, lng, name: 'Lokasi Saya' })
        reverseGeocode(lat, lng, (name) => setLocation((prev) => ({ ...prev, name })))
      },
      () => setError('Aktifkan lokasi untuk akurasi waktu sholat'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [reverseGeocode])

  useEffect(() => {
    if (locationMode === 'auto') requestLocation()
  }, [locationMode, requestLocation])

  const setLocationMode = useCallback((mode, manualLoc) => {
    setLocationModeState(mode)
    localStorage.setItem('location-mode', mode)
    if (mode === 'manual' && manualLoc) {
      setLocation(manualLoc)
      localStorage.setItem('manual-location', JSON.stringify(manualLoc))
    } else if (mode === 'auto') {
      requestLocation()
    }
  }, [requestLocation])

  const toggleAdhan = useCallback((v) => {
    setAdhanEnabled(v)
    localStorage.setItem('adhan-enabled', String(v))
  }, [])

  const formatCountdown = () => {
    if (countdown === null || countdown <= 0) return ''
    const h = Math.floor(countdown / 3600)
    const m = Math.floor((countdown % 3600) / 60)
    const s = countdown % 60
    if (h > 0) return `${h}j ${m}m ${s}d`
    if (m > 0) return `${m}m ${s}d`
    return `${s}d`
  }

  return {
    prayerList,
    current,
    next,
    countdown: formatCountdown(),
    loading,
    error,
    adhanEnabled,
    toggleAdhan,
    location,
    locationMode,
    setLocationMode,
    requestLocation,
    audioRef,
    alertingRef,
    qiblaDeg,
    qiblaLabel: qiblaLabel(qiblaDeg),
    reverseGeocode,
  }
}
