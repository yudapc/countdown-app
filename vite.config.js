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
        name: 'Muslim - Tasbih, Quran, Hadits & Countdown',
        short_name: 'Muslim',
        description:
          'Aplikasi Muslim: Tasbih digital, Al-Quran, Hadits, dan Countdown.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#1a3a2a',
        theme_color: '#1a3a2a',
        lang: 'id-ID',
        categories: ['lifestyle', 'utilities'],
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
            name: 'Tasbih',
            short_name: 'Tasbih',
            url: '/tasbih',
            description: 'Tasbih digital',
            icons: [{ src: 'pwa-icon.svg', sizes: 'any', type: 'image/svg+xml' }],
          },
          {
            name: 'Al-Quran',
            short_name: 'Quran',
            url: '/quran',
            description: 'Baca Al-Quran',
            icons: [{ src: 'pwa-icon.svg', sizes: 'any', type: 'image/svg+xml' }],
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
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
