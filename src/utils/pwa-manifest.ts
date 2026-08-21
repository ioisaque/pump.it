import { academiaSlugFromPath } from "utils/link";

type ManifestIcon = {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
};

/** Splash sem logo da academia — igual `PAGE_BACKGROUND`. */
const SPLASH_FALLBACK = "#f4f1e6";

let blobUrl: string | null = null;
let applyGen = 0;
const splashColorByIcon = new Map<string, string>();

function absIcon(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
  return `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`;
}

function publicHref(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return new URL(normalized, `${window.location.origin}${base}`).href;
}

function pumpIcons(): ManifestIcon[] {
  const i192 = publicHref("icons/manifest-icon-192.maskable.png");
  const i512 = publicHref("icons/manifest-icon-512.maskable.png");
  return [
    { src: i192, sizes: "192x192", type: "image/png", purpose: "any" },
    { src: i512, sizes: "512x512", type: "image/png", purpose: "any" },
    { src: i192, sizes: "192x192", type: "image/png", purpose: "maskable" },
    { src: i512, sizes: "512x512", type: "image/png", purpose: "maskable" },
  ];
}

function academiaIcons(iconUrl: string): ManifestIcon[] {
  return [
    { src: iconUrl, sizes: "192x192", type: "image/png", purpose: "any" },
    { src: iconUrl, sizes: "512x512", type: "image/png", purpose: "any" },
    { src: iconUrl, sizes: "512x512", type: "image/png", purpose: "maskable" },
  ];
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

/** Cor das bordas do ícone — Chrome pinta o splash com `background_color` atrás do tile. */
async function splashColorFromIcon(url: string): Promise<string> {
  const cached = splashColorByIcon.get(url);
  if (cached) return cached;
  try {
    const res = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!res.ok) return SPLASH_FALLBACK;
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("icon"));
        el.src = objectUrl;
      });
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return SPLASH_FALLBACK;
      ctx.drawImage(img, 0, 0, size, size);
      const inset = 2;
      const samples: [number, number][] = [
        [inset, inset],
        [size - 1 - inset, inset],
        [inset, size - 1 - inset],
        [size - 1 - inset, size - 1 - inset],
      ];
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (const [x, y] of samples) {
        const p = ctx.getImageData(x, y, 1, 1).data;
        if (p[3] < 16) continue;
        r += p[0];
        g += p[1];
        b += p[2];
        n += 1;
      }
      if (!n) return SPLASH_FALLBACK;
      const hex = toHex(Math.round(r / n), Math.round(g / n), Math.round(b / n));
      splashColorByIcon.set(url, hex);
      return hex;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    return SPLASH_FALLBACK;
  }
}

function setLinkHref(rel: string, href: string, type?: string) {
  let el = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  if (type) el.type = type;
  el.href = href;
}

export type PwaManifestOpts = {
  slug?: string | null;
  name?: string | null;
  iconUrl?: string | null;
};

export async function applyPwaManifest(opts: PwaManifestOpts = {}) {
  const gen = ++applyGen;
  const slug = opts.slug?.trim() || academiaSlugFromPath() || "";
  const start = slug ? `/${slug}/` : "/";
  const name = (opts.name || slug || "pump.it").trim() || "pump.it";
  const iconAbs = absIcon(opts.iconUrl);
  const icons = iconAbs ? academiaIcons(iconAbs) : pumpIcons();
  const favicon = iconAbs || publicHref("app-icon.png");
  const splash = iconAbs ? await splashColorFromIcon(iconAbs) : SPLASH_FALLBACK;
  if (gen !== applyGen) return;

  const manifest = {
    id: start,
    name,
    short_name: name.length > 12 ? name.slice(0, 12) : name,
    description: slug ? `${name} — pump.it` : "pump.it — gestão de academia.",
    lang: "pt-BR",
    dir: "ltr",
    start_url: start,
    scope: start,
    display: "standalone",
    orientation: "any",
    background_color: splash,
    theme_color: splash,
    icons,
  };

  if (blobUrl) URL.revokeObjectURL(blobUrl);
  blobUrl = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" }));
  setLinkHref("manifest", blobUrl);
  setLinkHref("icon", favicon, "image/png");
  setLinkHref("apple-touch-icon", favicon);
  const title = document.querySelector("meta[name='apple-mobile-web-app-title']");
  if (title) title.setAttribute("content", name);
}

export async function bootPwaManifest(): Promise<void> {
  const slug = academiaSlugFromPath();
  if (!slug) {
    await applyPwaManifest({});
    return;
  }
  await applyPwaManifest({ slug, name: slug });
  try {
    const res = await fetch(`/api/auth/academia/${encodeURIComponent(slug)}`);
    if (!res.ok) return;
    const data = (await res.json()) as { academia?: { nome?: string; logo?: string | null } };
    await applyPwaManifest({
      slug,
      name: data.academia?.nome || slug,
      iconUrl: data.academia?.logo,
    });
  } catch {
    /* keep start_url with pump.it icon */
  }
}
