import { useState, useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CITIES } from '../data/cities'

delete (L.Icon.Default.prototype)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const REVERSE_CACHE = {}

const reverseGeocode = async (lat, lng) => {
  const key = `${lat.toFixed(4)}-${lng.toFixed(4)}`
  if (REVERSE_CACHE[key]) return REVERSE_CACHE[key]
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14&accept-language=id`,
      { headers: { 'User-Agent': 'MuslimApp/1.0' } }
    )
    const data = await res.json()
    const addr = data?.address || {}
    const parts = [addr.city_district || addr.suburb || addr.village, addr.city || addr.state]
    const name = parts.filter(Boolean).join(', ') || `Lokasi (${lat.toFixed(4)}, ${lng.toFixed(4)})`
    REVERSE_CACHE[key] = name
    return name
  } catch {
    return `Lokasi (${lat.toFixed(4)}, ${lng.toFixed(4)})`
  }
}

const LocationPicker = ({ location, mode, onSave, onClose }) => {
  const [locMode, setLocMode] = useState(mode || 'auto')
  const [search, setSearch] = useState('')
  const [coords, setCoords] = useState({ lat: location.lat, lng: location.lng })
  const [locName, setLocName] = useState(location.name)
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markerInstance = useRef(null)

  const filtered = search
    ? CITIES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : []

  useEffect(() => {
    if (locMode !== 'manual' || mapInstance.current) return
    const map = L.map(mapRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 12,
      zoomControl: false,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)
    const marker = L.marker([coords.lat, coords.lng], { draggable: true }).addTo(map)
    marker.on('dragend', async () => {
      const pos = marker.getLatLng()
      const lat = pos.lat
      const lng = pos.lng
      setCoords({ lat, lng })
      const name = await reverseGeocode(lat, lng)
      setLocName(name)
      map.flyTo([lat, lng], map.getZoom())
    })
    mapInstance.current = map
    markerInstance.current = marker
    return () => {
      map.remove()
      mapInstance.current = null
      markerInstance.current = null
    }
  }, [locMode, coords.lat, coords.lng])

  useEffect(() => {
    if (!markerInstance.current) return
    markerInstance.current.setLatLng([coords.lat, coords.lng])
    if (mapInstance.current) {
      mapInstance.current.setView([coords.lat, coords.lng])
    }
  }, [coords])

  const handleSelectCity = useCallback((city) => {
    setSearch('')
    setCoords({ lat: city.lat, lng: city.lng })
    reverseGeocode(city.lat, city.lng).then(setLocName)
  }, [])

  const handleSave = () => {
    onSave(locMode, coords, locName)
    onClose()
  }

  return (
    <div className="locpicker-overlay" onClick={onClose}>
      <div className="locpicker" onClick={(e) => e.stopPropagation()}>
        <button className="locpicker-close" onClick={onClose} aria-label="Tutup">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        <h2 className="locpicker-title">Pengaturan Lokasi</h2>

        <div className="locpicker-modes">
          <label className={`locpicker-mode ${locMode === 'auto' ? 'active' : ''}`}>
            <input
              type="radio"
              name="locMode"
              value="auto"
              checked={locMode === 'auto'}
              onChange={() => setLocMode('auto')}
            />
            <span className="locpicker-mode-dot" />
            <span>Otomatis (GPS)</span>
          </label>
          <label className={`locpicker-mode ${locMode === 'manual' ? 'active' : ''}`}>
            <input
              type="radio"
              name="locMode"
              value="manual"
              checked={locMode === 'manual'}
              onChange={() => setLocMode('manual')}
            />
            <span className="locpicker-mode-dot" />
            <span>Manual</span>
          </label>
        </div>

        {locMode === 'manual' && (
          <>
            <div className="locpicker-search-wrap">
              <svg className="locpicker-search-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input
                className="locpicker-search"
                type="text"
                placeholder="Cari kota..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="locpicker-search-clear" onClick={() => setSearch('')}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              )}
            </div>

            {search && filtered.length > 0 && (
              <div className="locpicker-city-list">
                {filtered.map((city) => (
                  <button
                    key={city.name}
                    className="locpicker-city-item"
                    onClick={() => handleSelectCity(city)}
                  >
                    <svg className="locpicker-city-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>{city.name}</span>
                  </button>
                ))}
              </div>
            )}

            {search && filtered.length === 0 && (
              <div className="locpicker-empty">Kota tidak ditemukan</div>
            )}

            <div className="locpicker-map-wrap">
              <div ref={mapRef} className="locpicker-map" />
            </div>

            <div className="locpicker-current">
              <span className="locpicker-current-label">Lokasi saat ini:</span>
              <span className="locpicker-current-name">{locName}</span>
            </div>
          </>
        )}

        {locMode === 'auto' && (
          <div className="locpicker-auto-msg">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span>Menggunakan lokasi dari perangkat. Nyalakan GPS untuk akurasi terbaik.</span>
          </div>
        )}

        <button className="locpicker-save" onClick={handleSave}>Simpan</button>
      </div>
    </div>
  )
}

export default LocationPicker
