import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// Define the paths to your certs
const certPath = "C:/certs/skin.bosstudio.org-crt.pem";
const keyPath = "C:/certs/skin.bosstudio.org-key.pem";

// Check if certs exist (they won't on your local PC, but will on the server)
const hasCerts = fs.existsSync(certPath) && fs.existsSync(keyPath);
const exposeDevServer = process.env.SKINTELLIGENT_DEV_SERVER_PUBLIC === "true";

export default defineConfig({
  plugins: [react()],
  server: {
    host: exposeDevServer ? "0.0.0.0" : "127.0.0.1",
    port: hasCerts ? 443 : 5173, // Use 443 if certs exist, otherwise dev port
    https: hasCerts
      ? {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        }
      : false, // Disable HTTPS if certs are missing
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    globals: true,
  },
});
