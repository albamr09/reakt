import { defineConfig } from "vite";

import { resolve } from "node:path";

export default defineConfig({
  server: {
    host: "0.0.0.0",
  },
  // Root of the project is src, all project code is inside it
  root: resolve(__dirname, "src"),
  build: {
    rollupOptions: {
      // We'll create one input per example
      input: {
        "01": resolve(__dirname, "src/01/index.html"),
      },
    },
  },
  esbuild: {
    // Sets the function that is called for each JSX element
    // To configure it on a per-file basis, use a // @jsx Reakt.createElement comment
    jsxFactory: "Reakt.createElement",
  },
});
