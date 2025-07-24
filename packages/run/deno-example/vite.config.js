import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
// import { InspatialHMR } from '@inspatial/run/hmr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: '.',
  server: {
    port: 6310,
    open: true,
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      '@in/teract/signal-lite': resolve(__dirname, '../../interact/signal-lite/index.ts'),
      '@in/teract': resolve(__dirname, '../../interact/index.ts'),
      '@in/dom': resolve(__dirname, '../../dom/src/index.ts'),
      '@inspatial/run': resolve(__dirname, '../src/index.ts'),
      '@inspatial/run/jsx': resolve(__dirname, '../src/runtime/jsx/jsx-runtime.ts'),
      '@inspatial/run/jsx-dev': resolve(__dirname, '../src/runtime/jsx/jsx-dev-runtime.ts'),
    },
  },
  optimizeDeps: {
    include: [],
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "../src/runtime/jsx",
  },
  // plugins: [
  //   InspatialHMR(),
  // ],
}); 