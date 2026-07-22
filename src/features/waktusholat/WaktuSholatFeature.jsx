import { useEffect, useRef, useState, useCallback } from 'react'
import { usePrayerTimes } from './hooks/usePrayerTimes'
import { usePrayerNotification } from './hooks/usePrayerNotification'
import { useDeviceOrientation } from './hooks/useDeviceOrientation'
import LocationPicker from './components/LocationPicker'

const WaktuSholatFeature = () => {
  const {
    prayerList, next, countdown, loading,
    adhanEnabled, toggleAdhan,
    location, locationMode, setLocationMode,
    audioRef, qiblaDeg, qiblaLabel,
  } = usePrayerTimes()

  const { notify, scheduleBackground } = usePrayerNotification()
  const { heading, requestPermission, startListening, available } = useDeviceOrientation()
  const prevNextKey = useRef(null)
  const [qiblaOpen, setQiblaOpen] = useState(false)
  const [locPickerOpen, setLocPickerOpen] = useState(false)
  const compassStarted = useRef(false)

  const openQibla = useCallback(async () => {
    setQiblaOpen(true)
    if (available && !compassStarted.current) {
      const granted = await requestPermission()
      if (granted) {
        startListening()
        compassStarted.current = true
      }
    }
  }, [available, requestPermission, startListening])

  useEffect(() => {
    if (!next || prevNextKey.current === next.key) return
    const isInitial = prevNextKey.current === null
    prevNextKey.current = next.key
    if (isInitial) {
      scheduleBackground(prayerList)
      return
    }
    const activePrayer = prayerList.find((p) => p.isActive)
    if (!activePrayer || activePrayer.prayer === null) return
    const flag = `adhan-played-${activePrayer.key}-${Math.floor(activePrayer.time.getTime() / 86400000)}`
    if (localStorage.getItem(flag)) return
    notify(activePrayer.label)
    scheduleBackground(prayerList)
  }, [next, prayerList, notify, scheduleBackground])

  const handleLocSave = useCallback((mode, coords, name) => {
    if (mode === 'auto') {
      setLocationMode('auto')
    } else {
      setLocationMode('manual', { lat: coords.lat, lng: coords.lng, name })
    }
  }, [setLocationMode])

  const fmtTime = (d) => {
    if (!d) return '--:--'
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  return (
    <div className="sholat-page">
      <audio ref={audioRef} src="/adhan.mp3" preload="none" />

      <div className="sholat-header">
        <button className="sholat-location-btn" onClick={() => setLocPickerOpen(true)}>
          <svg className="sholat-location-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span className="sholat-location">{location.name}</span>
          <svg className="sholat-location-chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="sholat-toggle-wrap">
          <span className="sholat-toggle-label">Azan</span>
          <button
            className={`sholat-toggle ${adhanEnabled ? 'on' : ''}`}
            onClick={() => toggleAdhan(!adhanEnabled)}
            aria-label="Toggle azan"
          >
            <span className="sholat-toggle-knob" />
          </button>
        </div>
      </div>

      {qiblaDeg !== null && (
        <button className="sholat-qibla" onClick={openQibla}>
          <svg
            className="sholat-qibla-arrow"
            viewBox="0 0 24 24"
            style={{ transform: `rotate(${qiblaDeg}deg)` }}
            aria-hidden="true"
          >
            <path d="M12 2L4 20l8-4 8 4L12 2z" fill="currentColor" />
          </svg>
          <span className="sholat-qibla-text">
            Kiblat: {Math.round(qiblaDeg)}° {qiblaLabel}
          </span>
          <svg className="sholat-qibla-chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {loading && !prayerList.length ? (
        <div className="list-loader">
          <div className="spinner" />
          <span>Memuat jadwal...</span>
        </div>
      ) : (
        <>
          {next && (
            <div className="sholat-next-card">
              <span className="sholat-next-label">Berikutnya</span>
              <span className="sholat-next-name">{next.label}</span>
              <span className="sholat-next-time">{countdown}</span>
            </div>
          )}

          <div className="sholat-list">
            {prayerList.map((p) => (
              <div
                key={p.key}
                className={`sholat-item ${p.isActive ? 'active' : ''} ${p.isNext ? 'next' : ''}`}
              >
                <span className="sholat-item-name">{p.label}</span>
                <span className="sholat-item-time">{fmtTime(p.time)}</span>
                {p.isActive && <span className="sholat-item-badge">Sekarang</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {qiblaOpen && qiblaDeg !== null && (
        <div className="qibla-overlay" onClick={() => setQiblaOpen(false)}>
          <div className="qibla-compass" onClick={(e) => e.stopPropagation()}>
            <button className="qibla-close" onClick={() => setQiblaOpen(false)} aria-label="Tutup">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
            <div className="qibla-compass-inner">
              <div
                className="qibla-compass-ring"
                style={heading !== null ? { transform: `rotate(${-heading}deg)` } : undefined}
              >
                <svg viewBox="0 0 200 200" className="qibla-compass-svg">
                  <circle cx="100" cy="100" r="94" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                    <line
                      key={deg}
                      x1={100 + 88 * Math.sin((deg * Math.PI) / 180)}
                      y1={100 - 88 * Math.cos((deg * Math.PI) / 180)}
                      x2={100 + 78 * Math.sin((deg * Math.PI) / 180)}
                      y2={100 - 78 * Math.cos((deg * Math.PI) / 180)}
                      stroke="currentColor"
                      strokeWidth={deg % 90 === 0 ? 2 : 0.5}
                      opacity={deg % 90 === 0 ? 0.5 : 0.2}
                    />
                  ))}
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
                    const rad = (deg * Math.PI) / 180
                    const r = 64
                    return (
                      <text
                        key={deg}
                        x={100 + r * Math.sin(rad)}
                        y={100 - r * Math.cos(rad) + 3}
                        textAnchor="middle"
                        fontSize="8"
                        fill="currentColor"
                        opacity="0.5"
                      >
                        {deg}°
                      </text>
                    )
                  })}
                  <text x="100" y="14" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--primary)">U</text>
                  <text x="186" y="104" textAnchor="middle" fontSize="10" fontWeight="600" fill="currentColor" opacity="0.4">T</text>
                  <text x="100" y="194" textAnchor="middle" fontSize="10" fontWeight="600" fill="currentColor" opacity="0.4">S</text>
                  <text x="14" y="104" textAnchor="middle" fontSize="10" fontWeight="600" fill="currentColor" opacity="0.4">B</text>
                </svg>
                <div className="qibla-needle" style={{ transform: `rotate(${qiblaDeg}deg)` }}>
                  <div className="qibla-needle-top" />
                  <div className="qibla-needle-circle" />
                  <div className="qibla-needle-bottom" />
                </div>
              </div>
              <div className="qibla-info">
                <span className="qibla-info-deg">{Math.round(qiblaDeg)}° {qiblaLabel}</span>
                <span className="qibla-info-hint">
                  {heading !== null
                    ? `Hadapkan perangkat ke arah ${qiblaLabel} (${Math.round(qiblaDeg)}°)`
                    : `Arahkan ke ${qiblaLabel} (${Math.round(qiblaDeg)}°) untuk menghadap Kiblat`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {locPickerOpen && (
        <LocationPicker
          location={location}
          mode={locationMode}
          onSave={handleLocSave}
          onClose={() => setLocPickerOpen(false)}
        />
      )}
    </div>
  )
}

export default WaktuSholatFeature
