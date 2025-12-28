import esbuild from "esbuild";

esbuild
	.build({
		entryPoints: ["src/index.ts"],
		bundle: true,
		outfile: "build/reakt.js",
		minify: true,
		sourcemap: false,
		format: "iife",
		target: ["es6"],
		globalName: "Reakt",
	})
	.catch(() => process.exit(1));
