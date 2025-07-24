import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "jsr:@inspatial/run/jsx",
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  optimizeDeps: {
    include: ['@inspatial/run', '@in/teract'],
  },
});
