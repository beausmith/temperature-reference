import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      manifest: false,
      devOptions: {
        enabled: false,
      },
    }),
  ],
  define: {
    // Expose npm package version via import.meta.env.VITE_VERSION at build time
    'import.meta.env.VITE_VERSION': JSON.stringify(process.env.npm_package_version || ''),
  },
})
