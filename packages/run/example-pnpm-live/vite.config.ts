import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsxFactory: 'R.c',
    jsxFragment: 'R.f',
  },
});
