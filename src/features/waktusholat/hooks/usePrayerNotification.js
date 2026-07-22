import { useEffect, useCallback, useRef } from 'react'

export function usePrayerNotification() {
  const permRef = useRef(('Notification' in window) ? Notification.permission : 'denied')

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((p) => { permRef.current = p })
    }
  }, [])

  const notify = useCallback((name) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    new Notification('Waktu Sholat', {
      body: `Waktu ${name} telah tiba`,
      icon: '/pwa-icon.svg',
    })
  }, [])

  const scheduleBackground = useCallback((times) => {
    try {
      navigator.serviceWorker.controller?.postMessage({
        type: 'PRAYER_TIMES',
        times: times.map((t) => ({
          name: t.label,
          timestamp: t.time.getTime(),
        })),
      })
    } catch {
      /* SW unavailable — gracefully ignore */
    }
  }, [])

  return { notify, scheduleBackground }
}
