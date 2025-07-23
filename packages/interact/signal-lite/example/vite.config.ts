import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  optimizeDeps: {
    include: [],
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
  },
}); 