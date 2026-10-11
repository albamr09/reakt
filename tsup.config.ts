/// <reference types="node" />
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  clean: true,
  format: ["cjs", "esm", "iife"],
  globalName: "Reakt",
  minify: true,
  dts: true,
});
