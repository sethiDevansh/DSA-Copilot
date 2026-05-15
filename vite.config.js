import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import { fileURLToPath, URL } from 'node:url';
import manifest from './manifest.json' assert { type: 'json' };

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@':           fileURLToPath(new URL('./src',            import.meta.url)),
      '@shared':     fileURLToPath(new URL('./src/shared',     import.meta.url)),
      '@background': fileURLToPath(new URL('./src/background', import.meta.url)),
      '@content':    fileURLToPath(new URL('./src/content',    import.meta.url)),
      '@popup':      fileURLToPath(new URL('./src/popup',      import.meta.url)),
      '@dashboard':  fileURLToPath(new URL('./src/dashboard',  import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup:     'src/popup/index.html',
        dashboard: 'src/dashboard/index.html',
      },
    },
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
});
