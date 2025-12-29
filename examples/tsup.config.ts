import fs from "fs/promises";
import { glob } from "glob";
import path from "path";
import { defineConfig } from "tsup";

const BUILD_DIR = "build"

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
	entry: ["src/**/*.ts"],
	clean: true,
	format: ["cjs"],
  platform: "browser",
  outDir: BUILD_DIR,
  // Bundles local library together with examples
  noExternal: ["reakt"],
  minify: true,
  sourcemap: false,
  treeshake: true,
  splitting: true,
  dts: false,
  tsconfig: "./tsconfig.json",
  // Copy html files
  async onSuccess() {
    console.log("Build succeeded, copying static files...");
    await copyFiles("./src/**/*.html", "./src");
  },
});
