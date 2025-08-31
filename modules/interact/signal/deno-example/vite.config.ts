import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 6312, 
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