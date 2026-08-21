/** 1º segmento que nunca é slug de academia. */
export const ROOT_SEGMENTS = new Set([
  "login",
  "install",
  "plataforma",
  "pessoas",
  "exercicios",
  "fichas",
  "workout-plans",
  "avaliacoes",
  "acessos",
  "checkin",
  "workout",
  "workouts",
  "mensalidades",
  "tabelas",
  "notificacoes",
  "configuracoes",
  "sistema",
  "api",
  "offline",
  "400",
  "401",
  "402",
  "403",
  "404",
  "500",
  "501",
  "503",
  "anamnese",
]);

export type LinkQuery = Record<string, string | number | boolean | null | undefined>;

export function academiaSlugFromPath(pathname?: string): string | undefined {
  const path =
    pathname ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const seg = path.split("/").filter(Boolean)[0];
  if (!seg || ROOT_SEGMENTS.has(seg)) return undefined;
  return seg;
}

function normalizePath(path: string): { pathname: string; search: string } {
  const raw = path.trim() || "/";
  const q = raw.indexOf("?");
  const before = (q >= 0 ? raw.slice(0, q) : raw) || "/";
  const search = q >= 0 ? raw.slice(q + 1) : "";
  let pathname = before.startsWith("/") ? before : `/${before}`;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }
  return { pathname, search };
}

function buildSearch(existing: string, query?: LinkQuery): string {
  const params = new URLSearchParams(existing);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value == null || value === "") params.delete(key);
      else params.set(key, String(value));
    }
  }
  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
}

/**
 * Monta path interno. Inclui `/:slug` só quando há academia no path atual
 * (ou `slug` explícito). `/plataforma/*` nunca recebe slug.
 *
 * `LINK("/pessoas/1/edit")` → `/now/pessoas/1/edit` ou `/pessoas/1/edit`
 * `LINK("/login")` → `/now/login` ou `/login`
 * `LINK("/workout-plans/1/treino", { dia: "A" })`
 * `LINK("/", undefined, "now")` → `/now`
 */
export function LINK(path: string, query?: LinkQuery, slug?: string | null): string {
  const { pathname, search } = normalizePath(path);
  const first = pathname.split("/").filter(Boolean)[0];
  const resolved = slug === undefined ? academiaSlugFromPath() : slug || undefined;

  let out = pathname;
  if (first !== "plataforma" && resolved && first !== resolved) {
    out = pathname === "/" ? `/${resolved}` : `/${resolved}${pathname}`;
  }

  return `${out}${buildSearch(search, query)}`;
}
