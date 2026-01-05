import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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
			{
				find: /^@reakt\/(.+)$/,
				replacement: resolve(__dirname, "../src/$1"),
			},
			{
				find: /^@reakt$/,
				replacement: resolve(__dirname, "../src"),
			},
		],
	},
});
