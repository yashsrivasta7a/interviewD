import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'  // Changed from react-swc to react

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ensure proper build settings for Vercel
    sourcemap: true,
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
        }
      }
    }
  },
  optimizeDeps: {
    // Skip problematic dependencies in dev
    exclude: ['@swc/core']
  },
  server: {
    // Add proper host settings
    host: true,
    strictPort: true,
  }
})
