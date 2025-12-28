import esbuild from "esbuild";

esbuild
	.build({
		entryPoints: ["index.ts"],
		bundle: true,
		outfile: "build/index.js",
		minify: true,
		sourcemap: false,
		format: "iife",
		target: ["es6"]
	})
	.catch(() => process.exit(1));
