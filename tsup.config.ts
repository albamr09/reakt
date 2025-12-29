import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	clean: true,
	format: ["cjs", "esm", "iife"],
  globalName: "Reakt",
  outDir: "build",
  minify: true,
  sourcemap: false,
	dts: true,
});
