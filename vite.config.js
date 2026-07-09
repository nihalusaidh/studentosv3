import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Student OS',
        short_name: 'StudentOS',
        description: 'All-in-one student productivity platform',
        theme_color: '#a855f7',
        background_color: '#0f0f1e',
        display: 'standalone',
        start_url: '/dashboard',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        globIgnores: ['**/node_modules/**/*'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 5
            }
          },
          {
            urlPattern: /^https:\/\/www\.googleapis\.com\/identitytoolkit\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'auth-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ]
})
