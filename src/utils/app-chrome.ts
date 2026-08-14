import { cubeCornerPalette } from "components/layout/CubeBackground";

/** Fundo padrão das páginas (não confundir com a cor da status bar). */
export const PAGE_BACKGROUND = "#f4f1e6";
export const BLOCKED_BACKGROUND = "#b94a45";

/** Status bar (Android `theme-color` / tint) — guest = FakeStatusBar sólida. */
export const STATUS_BAR_GUEST = "#FFFFFF";
/** Status bar logado — vermelho do topo do cubo (Android não pinta gradiente). */
export const STATUS_BAR_AUTH = cubeCornerPalette.red;

/** Ícones do sistema na status bar: `light` = brancos; `dark` = pretos. */
export type StatusBarIcons = "light" | "dark";

const CHROME_VAR = "--app-chrome-color";

function setMeta(name: string, content: string, media?: string) {
  const selector = media
    ? `meta[name='${name}'][media='${media}']`
    : `meta[name='${name}']:not([media])`;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    if (media) el.setAttribute("media", media);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function parseHex(color: string): [number, number, number] | null {
  const hex = color.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

/** Luminância relativa sRGB (0–1). */
export function relativeLuminance(color: string): number {
  const rgb = parseHex(color);
  if (!rgb) return 1;
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Ícones claros sobre tint escuro; escuros sobre tint claro. */
export function statusBarIconsForColor(color: string): StatusBarIcons {
  return relativeLuminance(color) < 0.45 ? "light" : "dark";
}

/**
 * Cor dos ícones (relógio, bateria) — iOS PWA.
 * `black-translucent` → brancos; `default` → pretos.
 */
export function setStatusBarIcons(icons: StatusBarIcons) {
  setMeta(
    "apple-mobile-web-app-status-bar-style",
    icons === "light" ? "black-translucent" : "default",
  );
}

/** `color-scheme` do documento (login/install seguem o tema do device). */
export function setColorScheme(scheme: "light" | "dark") {
  setMeta("color-scheme", scheme);
  document.documentElement.style.colorScheme = scheme;
}

/**
 * Cor da status bar / toolbar (Android + Safari ≤18) + ícones iOS.
 *
 * `icons`: force; default = luminância de `color`.
 * No vermelho da marca use `"light"` — `#FF5356` fica no limiar e o iOS
 * frequentemente escolhe ícones pretos sozinho.
 */
export function setThemeColor(color: string, icons: StatusBarIcons = statusBarIconsForColor(color)) {
  setMeta("theme-color", color);
  setMeta("theme-color", color, "(prefers-color-scheme: light)");
  setMeta("theme-color", color, "(prefers-color-scheme: dark)");
  setStatusBarIcons(icons);
}

/**
 * Pinta html/body e avisa o FakeStatusBar.
 * `color-scheme` segue a luminância do **fundo da página** (login/install auto).
 */
export function applyAppChrome(
  color: string,
  mode: "page" | "blocked" = "page",
  statusBar?: string,
  icons?: StatusBarIcons,
) {
  document.documentElement.style.setProperty(CHROME_VAR, color);
  document.documentElement.style.backgroundColor = color;
  document.body.style.backgroundColor = color;
  const root = document.getElementById("root");
  if (root) root.style.backgroundColor = color;
  const bar = statusBar ?? color;
  setThemeColor(bar, icons ?? statusBarIconsForColor(bar));
  setColorScheme(relativeLuminance(color) < 0.45 ? "dark" : "light");
  window.dispatchEvent(new CustomEvent("app:chrome-color", { detail: { color, mode } }));
}

/** Página autenticável: fundo creme; guest bar branca com ícones pretos. */
export function applyPageChrome() {
  applyAppChrome(PAGE_BACKGROUND, "page", STATUS_BAR_GUEST, "dark");
}

export function applyBlockedChrome() {
  applyAppChrome(BLOCKED_BACKGROUND, "blocked", BLOCKED_BACKGROUND, "light");
}

export function readAppChromeColor(): string {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(CHROME_VAR).trim() || PAGE_BACKGROUND
  );
}
