// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  build: {
    outDir: 'build',
  },
  server: {
    proxy: {
      // This will proxy any request starting with /api
      // to your backend server on port 5000.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true, // Recommended for virtual-hosted sites
      },
    }
  }
})