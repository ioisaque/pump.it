import { apiBaseUrl } from "services/api";

export function resolveUploadUrl(caminho: string): string {
  if (!caminho) return "";
  if (/^https?:\/\//i.test(caminho)) return caminho;
  const base = apiBaseUrl().replace(/\/$/, "");
  return `${base}${caminho.startsWith("/") ? "" : "/"}${caminho}`;
}
