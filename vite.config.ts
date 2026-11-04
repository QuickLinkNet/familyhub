import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const appBasePath = '/apps/familyhub/';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? appBasePath : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.svg', 'icon-512.svg'],
      manifest: {
        name: 'Familienkompass',
        short_name: 'Familienkompass',
        description: 'Der gemeinsame Familienalltag auf einen Blick.',
        theme_color: '#345b48',
        background_color: '#f7f4ee',
        display: 'standalone',
        start_url: appBasePath,
        icons: [
          { src: 'icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: 'icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: { navigateFallback: 'index.html', globPatterns: ['**/*.{js,css,html,svg,woff2}'] }
    })
  ]
}));