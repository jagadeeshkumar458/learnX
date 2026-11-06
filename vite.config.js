import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative asset paths so the build works under any GitHub Pages path
// (e.g. https://jagadeeshkumar458.github.io/learnX/).
export default defineConfig({
  base: "./",
  plugins: [react()],
});
