import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@inspatial/kit": path.resolve(__dirname, "../../packages/core/kit"),
      "@inspatial/kit-button": path.resolve(
        __dirname,
        "../../packages/core/kit/button"
      ),
    },
  },
});
