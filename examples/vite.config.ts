import { defineConfig } from "vite";

export default defineConfig({
	root: "./01/",
	build: {
		outDir: "build",
		emptyOutDir: true,
	},
	esbuild: {
		jsxFactory: "ReaKt.createElement",
		jsxFragment: "ReaKt.Fragment",
		include: /\.tsx?$/,
	},
});
