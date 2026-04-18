import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages 项目站：在 CI 中设置 VITE_BASE=/<仓库名>/
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  plugins: [react()],
  base,
});
