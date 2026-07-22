import { useState, useEffect, useCallback, useRef } from 'react'

export function useDeviceOrientation() {
  const [heading, setHeading] = useState(null)
  const [error, setError] = useState(null)
  const [available, setAvailable] = useState(null)
  const listenerRef = useRef(null)
  const sensorRef = useRef(null)

  useEffect(() => {
    const hasDeviceOrientation = 'DeviceOrientationEvent' in window
    const hasSensor = 'AbsoluteOrientationSensor' in window
    setAvailable(hasDeviceOrientation || hasSensor)
  }, [])

  const requestPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      try {
        const result = await DeviceOrientationEvent.requestPermission()
        if (result !== 'granted') {
          setError('Izin kompas ditolak')
          return false
        }
      } catch {
        setError('Izin kompas ditolak')
        return false
      }
    }

    if ('AbsoluteOrientationSensor' in window && navigator.permissions?.query) {
      try {
        const accel = await navigator.permissions.query({ name: 'accelerometer' })
        const magnet = await navigator.permissions.query({ name: 'magnetometer' })
        if (accel.state === 'denied' || magnet.state === 'denied') {
          setError('Sensor kompas tidak diizinkan')
          return false
        }
      } catch {
        // permissions query not supported, try sensor anyway
      }
    }

    return true
  }, [])

  const startDeviceOrientation = useCallback(() => {
    if (listenerRef.current) return
    const handler = (e) => {
      if (e.alpha === null && e.webkitCompassHeading === undefined) return
      const h = e.webkitCompassHeading !== undefined ? e.webkitCompassHeading : e.alpha
      setHeading(h)
    }
    window.addEventListener('deviceorientation', handler, true)
    listenerRef.current = handler
  }, [])

  const startListening = useCallback(() => {
    if (listenerRef.current || sensorRef.current) return

    // Priority 1: AbsoluteOrientationSensor (Android Chrome, akurat)
    if ('AbsoluteOrientationSensor' in window) {
      try {
        const sensor = new AbsoluteOrientationSensor({ referenceFrame: 'device' })
        sensor.addEventListener('reading', () => {
          const q = sensor.quaternion
          const headingRad = Math.atan2(
            2 * (q[3] * q[2] + q[0] * q[1]),
            1 - 2 * (q[1] * q[1] + q[2] * q[2])
          )
          const deg = ((headingRad * 180) / Math.PI + 360) % 360
          setHeading(deg)
        })
        sensor.addEventListener('error', () => {
          startDeviceOrientation()
        })
        sensor.start()
        sensorRef.current = sensor
        return
      } catch {
        // sensor gagal, fallback ke deviceorientation
      }
    }

    // Priority 2 & 3: DeviceOrientationEvent (iOS via webkitCompassHeading, fallback e.alpha)
    startDeviceOrientation()
  }, [startDeviceOrientation])

  const stopListening = useCallback(() => {
    if (sensorRef.current) {
      sensorRef.current.stop()
      sensorRef.current = null
    }
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
