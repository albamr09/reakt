/// <reference types="node" />
import { defineConfig } from "tsup";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
	entry: ["src/index.ts"],
	clean: true,
	format: ["cjs", "esm", "iife"],
	globalName: "Reakt",
	outDir: "build",
	minify: isProduction,
	sourcemap: false,
	dts: true,
});
