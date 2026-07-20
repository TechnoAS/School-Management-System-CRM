import { defineConfig } from 'vite'
import path from 'path'
import { createRequire } from 'module'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const require = createRequire(import.meta.url)
const repoRoot = path.resolve(__dirname, '..')

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // npm workspaces hoist deps to repo root — pin resolution for Vite pre-bundle
      react: path.dirname(require.resolve('react/package.json')),
      'react-dom': path.dirname(require.resolve('react-dom/package.json')),
    },
    dedupe: ['react', 'react-dom'],
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-easy-crop'],
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    chunkSizeWarningLimit: 800,
  },

  server: {
    port: 3000,
    fs: {
      allow: [repoRoot],
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
})
