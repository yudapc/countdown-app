import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'ringtone.wav', 'robots.txt', 'sitemap.xml'],
      manifest: {
        id: '/',
        name: 'Timer Online - Countdown, Counter, Tasbih',
        short_name: 'Timer Online',
        description:
          'Timer online, countdown online, counter, dan tasbih online yang ringan, cepat, dan nyaman dipakai.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#eef3f8',
        theme_color: '#eef3f8',
        lang: 'id-ID',
        categories: ['productivity', 'utilities'],
        icons: [
          {
            src: 'pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Counter Online',
            short_name: 'Counter',
            url: '/counter',
            description: 'Hitung cepat dengan counter online',
            icons: [{ src: 'pwa-icon.svg', sizes: 'any', type: 'image/svg+xml' }],
          },
          {
            name: 'Countdown Online',
            short_name: 'Countdown',
            url: '/waktu',
            description: 'Atur hitung mundur online',
            icons: [{ src: 'pwa-icon.svg', sizes: 'any', type: 'image/svg+xml' }],
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,woff2,wav}'],
      },
    }),
  ],
  build: {
    target: 'es2018',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
})
