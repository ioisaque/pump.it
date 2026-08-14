import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3008,
    strictPort: true,
    cors: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3007",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/?/, "/"),
      },
      "/uploads": {
        target: "http://127.0.0.1:3007",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      api: "/src/api/",
      assets: "/src/assets/",
      components: "/src/components/",
      constants: "/src/constants/",
      contexts: "/src/contexts/",
      domain: "/src/domain/",
      hooks: "/src/hooks/",
      lang: "/src/lang/",
      routes: "/src/routes/",
      services: "/src/services/",
      types: "/src/types/",
      theme: "/src/theme/",
      utils: "/src/utils/",
      views: "/src/views/",
    },
  },
});
