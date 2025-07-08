import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      '/neighborhoodApi': {
        target: 'https://neighborhood.hackclub.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/neighborhoodApi/, '/api')
      }
    }
  }
});
