import { useState, useEffect, useCallback, useRef } from 'react'

export function useDeviceOrientation() {
  const [heading, setHeading] = useState(null)
  const [error, setError] = useState(null)
  const [available, setAvailable] = useState(null)
  const listenerRef = useRef(null)

  useEffect(() => {
    setAvailable('DeviceOrientationEvent' in window)
  }, [])

  const requestPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      try {
        const result = await DeviceOrientationEvent.requestPermission()
        return result === 'granted'
      } catch {
        setError('Izin kompas ditolak')
        return false
      }
    }
    return true
  }, [])

  const startListening = useCallback(() => {
    if (listenerRef.current) return
    const handler = (e) => {
      if (e.alpha === null && e.webkitCompassHeading === undefined) return
      const h = e.webkitCompassHeading !== undefined ? e.webkitCompassHeading : e.alpha
      setHeading(h)
    }
    window.addEventListener('deviceorientation', handler, true)
    listenerRef.current = handler
  }, [])

  const stopListening = useCallback(() => {
    if (listenerRef.current) {
      window.removeEventListener('deviceorientation', listenerRef.current, true)
      listenerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => stopListening()
  }, [stopListening])

  return {
    heading,
    error,
    available,
    requestPermission,
    startListening,
    stopListening,
  }
}
