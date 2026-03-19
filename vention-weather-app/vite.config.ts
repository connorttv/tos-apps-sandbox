import typescript from '@rollup/plugin-typescript'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: ['index.html', 'workers/weather-sync.ts'],
      output: {
        entryFileNames: (chunk) =>
          chunk.name === 'weather-sync' ? 'workers/weather-sync.js' : 'assets/[name]-[hash].js',
      },
    },
  },
  plugins: [
    typescript(),
    react(),
    {
      name: 'suppress-urls',
      configureServer(server) {
        return () => {
          server.printUrls = () => { }
        }
      },
    },
  ],
})
