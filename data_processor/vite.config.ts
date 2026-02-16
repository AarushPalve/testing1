import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Essential for Electron to find assets on the local file system
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  }
});