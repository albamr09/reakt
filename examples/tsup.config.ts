import fs from "fs/promises";
import { glob } from "glob";
import path from "path";
import { defineConfig } from "tsup";

const BUILD_DIR = "build";

async function copyFiles(pattern: string, baseDir = ".") {
	try {
		const files = await glob(pattern);

		for (const file of files) {
			const relativePath = path.relative(baseDir, file);
			const outputPath = path.join(BUILD_DIR, relativePath);
			const outputDir = path.dirname(outputPath);

			await fs.mkdir(outputDir, { recursive: true });
			await fs.copyFile(file, outputPath);
		}
	} catch (error) {
		console.error(`Error copying files matching "${pattern}":`, error);
	}
}

export default defineConfig({
	entry: ["src/**/*.{ts,tsx}"],
	clean: true,
	format: ["cjs"],
	platform: "browser",
	outDir: BUILD_DIR,
	// Bundles local library together with examples
	noExternal: ["reakt"],
	minify: true,
	sourcemap: false,
	splitting: false,
	dts: false,
	tsconfig: "./tsconfig.json",
	// Specify my custom method for React's createElement
	jsxFactory: "Reakt.createElement",
	// Copy html files
	async onSuccess() {
		console.log("Build succeeded, copying static files...");
		await copyFiles("./src/**/*.html", "./src");
	},
});
