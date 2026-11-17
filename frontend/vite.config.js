import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import { validatePublicEnv } from './build/validatePublicEnv.mjs'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  validatePublicEnv(loadEnv(mode, process.cwd(), 'VITE_'));
  return {
  plugins: [react()],
  preview: { headers: (() => { const headers = Object.fromEntries(JSON.parse(fs.readFileSync(new URL('./vercel.json', import.meta.url))).headers[0].headers.map(({ key, value }) => [key, value])); headers['Content-Security-Policy'] = headers['Content-Security-Policy'].replace("wss://*.supabase.co;", "wss://*.supabase.co http://localhost:5000 http://127.0.0.1:5000;"); return headers; })() },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    target: 'es2015',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy vendor libs into separate chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['react-hot-toast', 'react-icons'],
          'vendor-query': ['@tanstack/react-query', 'axios'],
          'vendor-seo': ['react-helmet-async'],
        },
      },
    },
  },
  };
})
