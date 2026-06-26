import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        timeout: 600000,          // 10 min — large image encode/decode
        proxyTimeout: 600000,     // 10 min — server-side processing timeout
        configure: (proxy) => {
          proxy.on('error', (err) => console.error('[proxy error]', err.message));
        },
      },
    },
  },
})

