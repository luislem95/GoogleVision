/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',  // Permite acceder desde otros dispositivos
    port: 5173,       // Puedes cambiar el puerto si es necesario
    strictPort: true, // Se asegura de usar ese puerto y no otro
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
