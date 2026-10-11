import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    // Sets the function that is called for each JSX element
    // To configure it on a per-file basis, use a // @jsx Reakt comment
    jsxFactory: "Reakt.createElement",
  },
});
