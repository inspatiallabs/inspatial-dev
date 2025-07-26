import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import deno from "@deno/vite-plugin";
import { InSpatial } from "../src/hmr/index.ts";

export default defineConfig({
	server: {
		port: 6310,
	},
	esbuild: {
		jsxFactory: "R.c",
		jsxFragment: "R.f",
	},
	plugins: [
		deno(),
		tailwindcss(),
		InSpatial(),
	],
	build: {
		target: "esnext",
	},
});
