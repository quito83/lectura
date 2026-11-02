import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Con VITE_ADSENSE_CLIENT (ca-pub-…) configurado, añade el script de AdSense
 * al <head> (Google lo busca ahí para verificar el sitio) y genera /ads.txt.
 */
function adsense(client: string | undefined): Plugin {
  return {
    name: 'adsense',
    transformIndexHtml() {
      if (!client) return [];
      return [
        {
          tag: 'script',
          injectTo: 'head',
          attrs: {
            async: true,
            src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`,
            crossorigin: 'anonymous',
          },
        },
      ];
    },
    generateBundle() {
      if (!client) return;
      this.emitFile({
        type: 'asset',
        fileName: 'ads.txt',
        source: `google.com, ${client.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`,
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    adsense(loadEnv(mode, '.').VITE_ADSENSE_CLIENT),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Lectura – Aprende a leer mejor',
        short_name: 'Lectura',
        description: 'Practica la lectura en voz alta y la comprensión con cuentos cortos.',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fff8ec',
        theme_color: '#3b5bdb',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
}));
