import { digitsOnly, formatCpfCnpj, formatIpv4, formatPhone } from "utils/ideyou-masks";

function formatCep(value: string): string {
  const d = digitsOnly(value).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

function stripDigits(value: unknown, maxLength?: number): string | undefined {
  if (value === "" || value == null) return undefined;
  let d = digitsOnly(String(value));
  if (maxLength != null) d = d.slice(0, maxLength);
  return d.length > 0 ? d : undefined;
}

/** Strip input masks before sending to the API (DB stores compact values). */
export function normalizePessoaFormPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const out = { ...payload };

  if ("cpf_cnpj" in out) {
    out.cpf_cnpj = stripDigits(out.cpf_cnpj, 14);
  }
  if ("contato" in out) {
    out.contato = stripDigits(out.contato, 11);
  }
  if ("cep" in out) {
    out.cep = stripDigits(out.cep, 8);
  }
  if ("pin" in out) {
    out.pin = stripDigits(out.pin, 6);
  }

  if ("ip" in out && out.ip != null && out.ip !== "") {
    out.ip = formatIpv4(String(out.ip)) || undefined;
  }

  return out;
}

/** Apply display masks when loading form initial data from API/DB values. */
export function formatPessoaFormValues(data: Record<string, unknown>): Record<string, unknown> {
  const out = { ...data };

  if (out.cpf_cnpj != null && out.cpf_cnpj !== "") {
    out.cpf_cnpj = formatCpfCnpj(String(out.cpf_cnpj));
  }
  if (out.contato != null && out.contato !== "") {
    out.contato = formatPhone(String(out.contato));
  }
  if (out.cep != null && out.cep !== "") {
    out.cep = formatCep(String(out.cep));
  }
  if (out.ip != null && out.ip !== "") {
    out.ip = formatIpv4(String(out.ip));
  }

  return out;
}

/** Build WhatsApp URL from digits-only contato stored by the API. */
export function contatoWhatsappUrl(contato?: string | null): string | null {
  if (!contato) return null;
  return `https://wa.me/55${contato}`;
}

/** Format a single field for read-only display. */
export function formatPessoaDisplay(
  field: "cpf_cnpj" | "contato" | "cep" | "ip",
  value: unknown,
): string | number | null | undefined {
  if (value == null || value === "") return value as null | undefined;

  switch (field) {
    case "cpf_cnpj":
      return formatCpfCnpj(String(value));
    case "contato":
      return formatPhone(String(value));
    case "cep":
      return formatCep(String(value));
    case "ip":
      return formatIpv4(String(value));
    default:
      return String(value);
  }
}
