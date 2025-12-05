import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },

  root: path.resolve(__dirname),

  build: {
    outDir: path.resolve(__dirname, "../dist/client"),
    emptyOutDir: true,
  },

  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
