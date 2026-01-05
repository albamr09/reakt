import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Get the example name from environment variable
const exampleName = process.env.EXAMPLE;

if (!exampleName) {
	throw new Error(
		"Please specify an example using EXAMPLE environment variable. Example: EXAMPLE=00_hello_js pnpm dev",
	);
}

const examplePath = resolve(__dirname, "src", exampleName);
const htmlFile = resolve(examplePath, "index.html");
const librarySourcePath = resolve(__dirname, "../src");

export default defineConfig({
	root: examplePath,
	build: {
		outDir: resolve(__dirname, "build", exampleName),
		emptyOutDir: true,
		rollupOptions: {
			input: htmlFile,
		},
	},
	esbuild: {
		jsxFactory: "Reakt.createElement",
		jsxFragment: "Reakt.Fragment",
		include: /\.tsx?$/,
	},
	resolve: {
		alias: [
			// Alias "reakt" to source directory for hot reload
			{
				find: /^@reakt\/(.+)$/,
				replacement: resolve(librarySourcePath, "$1"),
			},
			{
				find: /^@reakt$/,
				replacement: librarySourcePath,
			},
			{
				find: /^reakt$/,
				replacement: resolve(librarySourcePath, "index.ts"),
			},
		],
	},
});
