import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // 'Cross-Origin-Embedder-Policy': 'require-corp',
      // 'Cross-Origin-Opener-Policy': 'same-origin',
      
      // 'Cross-Origin-Embedder-Policy': 'credentialless', // or 'unsafe-none'
      // 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
       'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Resource-Policy': 'cross-origin',

    },
  },
  assetsInclude: ['**/*.psd'], // Ensure PSD files are treated as assets
  optimizeDeps: {
    exclude: ['@cesdk/cesdk-js', '@imgly/psd-importer']
  }
})
