import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entryPoints: [
    "src/index.ts",
    "button/src/index.tsx",
    // Add other components as needed
  ],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  external: ["react"],
  treeshake: true,
  ...options,
}));
