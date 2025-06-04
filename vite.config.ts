import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    // Make Buffer available globally for production builds
    'global.Buffer': 'Buffer',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process',
      util: 'util',
    },
  },
  optimizeDeps: {
    include: [
      'buffer', 
      'process',
      'util',
    ],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})
