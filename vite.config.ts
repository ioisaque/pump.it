import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHARED_CERT_DIR = path.resolve(__dirname, "../../../_certs/isaque.local");

const ISAQUE_LOCAL_HOSTS = ["localhost", "isaque.local"] as const;

function isIsaqueLocalHost(hostname: string): boolean {
  return hostname === "isaque.local";
}

function loadSharedHttps() {
  const cert = path.join(SHARED_CERT_DIR, "cert.pem");
  const key = path.join(SHARED_CERT_DIR, "key.pem");
  if (!fs.existsSync(cert) || !fs.existsSync(key)) return undefined;
  return { cert: fs.readFileSync(cert), key: fs.readFileSync(key) };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const disableHmr = env.VITE_DISABLE_HMR === "true";
  const https = env.VITE_HTTPS === "false" ? undefined : loadSharedHttps();
  const devOrigin = env.VITE_DEV_ORIGIN;
  const devHostname = devOrigin ? new URL(devOrigin).hostname : "";
  const viaIsaqueLocal = Boolean(devHostname) && isIsaqueLocalHost(devHostname);

  return {
    base: "/",
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 3008,
      strictPort: true,
      cors: true,
      https,
      allowedHosts: [...ISAQUE_LOCAL_HOSTS],
      origin: viaIsaqueLocal ? devOrigin : undefined,
      hmr: disableHmr
        ? false
        : viaIsaqueLocal
          ? {
              host: env.VITE_HMR_HOST ?? "isaque.local",
              protocol: (env.VITE_HMR_PROTOCOL ?? (https ? "wss" : "ws")) as "ws" | "wss",
              clientPort: Number(env.VITE_HMR_CLIENT_PORT ?? 3008),
            }
          : https
            ? {
                host: env.VITE_HMR_HOST ?? "isaque.local",
                protocol: "wss",
                clientPort: Number(env.VITE_HMR_CLIENT_PORT ?? 3008),
              }
            : true,
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
      watch: {
        usePolling: env.VITE_USE_POLLING === "true",
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
  };
});
