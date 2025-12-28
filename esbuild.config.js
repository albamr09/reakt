const esbuild = require("esbuild");

esbuild
	.build({
		entryPoints: ["src/index.ts"], // your main entry point
		bundle: true, // bundle all dependencies
		outfile: "build/reakt.js", // single output file
		minify: true, // minify the code
		sourcemap: false,
		format: "iife", // immediately-invoked function expression (browser ready)
		target: ["es6"], // transpile down to ES5
		globalName: "Reakt", // expose as window.Reakt
	})
	.catch(() => process.exit(1));
