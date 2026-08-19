import { useEffect, useState } from "react";

export const DISMISS_KEY = "pwa:install-dismissed";

export function isPwaStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}

/** iPhone / iPad / iPod (inclui iPadOS que se reporta como Mac). */
export function isIosDevice(): boolean {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

export function isIosSafari(): boolean {
  if (!isIosDevice()) return false;
  const ua = navigator.userAgent;
  if (/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)) return false;
  return /Safari/.test(ua) || !/Chrome|Android/.test(ua);
}

/**
 * Browser (não PWA) e ainda não ignorou.
 * No Android/Chrome só mostra se o site for instalável (`beforeinstallprompt`).
 * App já instalado → o Chrome não dispara o evento → não pede de novo.
 */
export function shouldShowInstallGate(): boolean {
  if (isPwaStandalone()) return false;
  if (sessionStorage.getItem(DISMISS_KEY) === "1") return false;
  if (isIosDevice()) return true;
  return Boolean(window.__pwaDeferredInstall);
}

/** Reavalia quando o Chrome volta a oferecer instalação (ex.: app desinstalado). */
export function useShouldShowInstallGate() {
  const [show, setShow] = useState(shouldShowInstallGate);
  useEffect(() => {
    const sync = () => setShow(shouldShowInstallGate());
    window.addEventListener("pwa:deferred-install", sync);
    return () => window.removeEventListener("pwa:deferred-install", sync);
  }, []);
  return show;
}
