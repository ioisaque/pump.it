import { Academia } from "api/academias";
import { CAPS } from "domain/shared/formatters";

export function buildEmptyAcademiaFormInitialData(): Record<string, unknown> {
  return {
    nome: "",
    razao_social: "",
    cnpj: "",
    slug: "",
    status: "ACTIVE",
    email: "",
    contato: "",
    instagram: "",
    site: "",
    logradouro: "",
    numero: "",
    cep: "",
    bairro: "",
    cidade: "",
    estado: "",
    complemento: "",
  };
}

export function buildAcademiaFormInitialData(a: Academia): Record<string, unknown> {
  return {
    nome: a.nome ?? "",
    razao_social: a.razao_social ?? "",
    cnpj: a.cnpj ?? "",
    slug: a.slug ?? "",
    status: a.status ?? "ACTIVE",
    email: a.email ?? "",
    contato: a.contato ?? "",
    instagram: a.instagram ?? "",
    site: a.site ?? "",
    logradouro: a.logradouro ?? "",
    numero: a.numero ?? "",
    cep: a.cep ?? "",
    bairro: a.bairro ?? "",
    cidade: a.cidade ?? "",
    estado: CAPS(a.estado).slice(0, 2),
    complemento: a.complemento ?? "",
  };
}

export function academiaAddressQuery(data: {
  logradouro?: string | null;
  numero?: string | number | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
}): string {
  return [data.logradouro, data.numero, data.bairro, data.cidade, data.estado, data.cep]
    .map((v) => (v == null ? "" : String(v).trim()))
    .filter(Boolean)
    .join(", ");
}

export function buildAcademiaPayload(data: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    const s = String(value).trim();
    if (key === "slug") {
      out[key] = s.toLowerCase();
      continue;
    }
    out[key] = s;
  }
  return out;
}

export function academiaToFormData(
  payload: Record<string, string>,
  logoFile?: File | null,
): FormData {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "logo") return;
    if (value === undefined || value === null || value === "") return;
    formData.append(key, value);
  });
  if (logoFile) {
    formData.append("logo", logoFile);
  }
  return formData;
}
