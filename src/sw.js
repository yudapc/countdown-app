import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

self.addEventListener('message', (event) => {
  if (event.data?.type === 'PRAYER_TIMES') {
    const { times } = event.data
    times.forEach(({ name, timestamp }) => {
      const delay = timestamp - Date.now()
      if (delay > 0 && delay < 86400000) {
        setTimeout(() => {
          self.registration.showNotification('Waktu Sholat', {
            body: `Waktu ${name} telah tiba`,
            icon: '/pwa-icon.svg',
            tag: `prayer-${name}-${Math.floor(timestamp / 86400000)}`,
            requireInteraction: true,
          })
        }, delay)
      }
    })
  }
})
