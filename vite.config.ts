import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

function normalizeBasePath(value: string): string {
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

function normalizePrefix(value: string): string {
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.replace(/\/$/, '');
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const appBasePath = normalizeBasePath(env.VITE_BASE_PATH || '/apps/familyhub/');
  const liveApiOrigin = env.VITE_DEV_API_ORIGIN || 'https://example.org';
  const liveApiPrefix = normalizePrefix(env.VITE_DEV_API_PREFIX || '/apps/familyhub');

  return {
    base: mode === 'production' ? appBasePath : '/',
    server: {
      proxy: {
        '/api/v1': {
          target: liveApiOrigin,
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: '',
          cookiePathRewrite: '/',
          rewrite: path => `${liveApiPrefix}${path}`,
          configure: proxy => {
            proxy.on('proxyRes', proxyResponse => {
              const cookies = proxyResponse.headers['set-cookie'];
              if (cookies) {
                proxyResponse.headers['set-cookie'] = cookies.map((cookie: string) => cookie
                  .replace(/;\s*Secure/gi, '')
                  .replace(/SameSite=None/gi, 'SameSite=Lax'));
              }
            });
          }
        }
      }
    },
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
          scope: appBasePath,
          icons: [
            { src: 'icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
            { src: 'icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
          ]
        },
        workbox: {
          navigateFallback: 'index.html',
          globPatterns: ['**/*.{js,css,html,svg,woff2}']
        }
      })
    ]
  };
});
