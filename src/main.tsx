import React from "react";
import ReactDOM from "react-dom/client";
import { initIdeyouMasks } from "./utils/ideyou-masks";

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

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

import("./App").then(({ default: App }) => {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
