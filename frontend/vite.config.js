import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE_PATH || '/'

  return {
    base,
    plugins: [
      react(),
    ],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_DEV_API_PROXY || 'http://localhost:5000',
          changeOrigin: true,
          timeout: 600000,
          proxyTimeout: 600000,
          configure: (proxy) => {
            proxy.on('error', (err) => console.error('[proxy error]', err.message));
          },
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'vendor';
              }
              if (id.includes('axios')) {
                return 'axios';
              }
              return 'modules';
            }
          }
        },
      },
    },
  }
})
