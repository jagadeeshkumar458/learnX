import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from https://jagadeeshkumar458.github.io/learnx/
export default defineConfig({
  base: "/learnx/",
  plugins: [react()],
});
