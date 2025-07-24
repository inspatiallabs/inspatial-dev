import { defineConfig } from "vite";
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  server: {
    port: 5173,
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "../src/runtime/jsx",
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
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
    exclude: ['@inspatial/run', '@in/teract'],
  },
});
