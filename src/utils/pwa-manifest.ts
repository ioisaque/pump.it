import { academiaSlugFromPath } from "utils/link";

type ManifestIcon = {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
};

let blobUrl: string | null = null;

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

export function applyPwaManifest(opts: PwaManifestOpts = {}) {
  const slug = opts.slug?.trim() || academiaSlugFromPath() || "";
  const start = slug ? `/${slug}/` : "/";
  const name = (opts.name || slug || "pump.it").trim() || "pump.it";
  const iconAbs = absIcon(opts.iconUrl);
  const icons = iconAbs ? academiaIcons(iconAbs) : pumpIcons();
  const favicon = iconAbs || publicHref("app-icon.png");

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
    background_color: "#f4f1e6",
    theme_color: "#f4f1e6",
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
    applyPwaManifest({});
    return;
  }
  applyPwaManifest({ slug, name: slug });
  try {
    const res = await fetch(`/api/auth/academia/${encodeURIComponent(slug)}`);
    if (!res.ok) return;
    const data = (await res.json()) as { academia?: { nome?: string; logo?: string | null } };
    applyPwaManifest({
      slug,
      name: data.academia?.nome || slug,
      iconUrl: data.academia?.logo,
    });
  } catch {
    /* keep start_url with pump.it icon */
  }
}
