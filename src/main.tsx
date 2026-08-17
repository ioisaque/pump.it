import React from "react";
import ReactDOM from "react-dom/client";
import { initIdeyouMasks } from "./utils/ideyou-masks";
import { bootPwaManifest } from "./utils/pwa-manifest";

try {
  initIdeyouMasks();
} catch (error) {
  console.error("[initIdeyouMasks]", error);
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  window.__pwaDeferredInstall = event as NonNullable<Window["__pwaDeferredInstall"]>;
  window.dispatchEvent(new Event("pwa:deferred-install"));
});

void bootPwaManifest();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    if (import.meta.env.DEV && !window.isSecureContext) {
      const stale = await navigator.serviceWorker.getRegistrations();
      await Promise.all(stale.map((registration) => registration.unregister()));
      return;
    }

    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch((error) => {
        console.debug("[pwa] service worker registration failed:", error);
      });
  });
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

import("./App").then(({ default: App }) => {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
