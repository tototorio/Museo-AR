import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Any tag starting with 'a-' is an A-Frame element, not a Vue component
          isCustomElement: (tag) => tag.startsWith('a-')
        }
      }
    })
  ],
  build: {
    outDir: '../backend/dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads' : 'http://localhost:3000',
    }
  }
})
