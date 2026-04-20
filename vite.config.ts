import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://10.210.55.111:2280",
        changeOrigin: true,
      },
      "/agent": {
        target: "http://localhost:8002",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": [
            "lucide-react",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
          ],
          "editor-vendor": ["@monaco-editor/react"],
          "markdown-vendor": [
            "react-markdown",
            "react-syntax-highlighter",
            "remark-gfm",
            "rehype-katex",
          ],
        },
      },
    },
  },
});
