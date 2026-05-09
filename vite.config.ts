/// <reference types="vitest" />
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  server: {
    proxy: {
      '/reddit-api': {
        target: 'https://www.reddit.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/reddit-api/, '')
      },
      '/reddit-image': {
        target: 'https://i.redd.it',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/reddit-image/, '')
      }
    }
  }
})
