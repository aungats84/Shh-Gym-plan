import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // On GitHub Pages the site lives at /<repo-name>/, not at the domain root.
  // VITE_BASE_PATH must match the repository name exactly.
  const repo = env.VITE_BASE_PATH?.trim();
  const base = repo ? `/${repo.replace(/^\/|\/$/g, '')}/` : '/';

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'San Training',
          short_name: 'San Training',
          description:
          'Personal training, nutrition, recovery and progress tracking. Stored on your device.',
          theme_color: '#b04459',
          background_color: '#fdecf1',
          display: 'standalone',
          orientation: 'any',
          start_url: base,
          scope: base,
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'icons/icon-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          navigateFallback: `${base}index.html`,
          cleanupOutdatedCaches: true,
        },
      }),
    ],
    build: {
      // The charting library is deliberately a separate, lazily loaded
      // chunk, so it is expected to be over the default 500 kB warning.
      chunkSizeWarningLimit: 600,
    },
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: false,
    },
  };
});
