import { FormHandles } from "@unform/core";
import toast from "react-hot-toast";
import { apiOrigin } from "services/api";
import { digitsOnly } from "utils/ideyou-masks";

type ViaCepResponse = {
  erro?: boolean;
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

export function resolveUploadUrl(foto: string | null | undefined): string | null {
  if (!foto) return null;
  if (foto.startsWith("http") || foto.startsWith("blob:") || foto.startsWith("data:")) return foto;
  return `${apiOrigin()}${foto.startsWith("/") ? foto : `/${foto}`}`;
}

export function CAPS(value?: string | number | null): string {
  if (value == null || value === "") return "";
  return String(value).trim().toUpperCase();
}

export function DATA(value: string | Date | null | undefined): string {
  if (value == null || value === "") return "";
  const raw = typeof value === "string" ? value : value.toISOString();
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  return `${m[3]}/${m[2]}/${m[1].slice(-2)}`;
}

export function HORA(value: string | Date | null | undefined, withSeconds = false): string {
  if (value == null || value === "") return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (!withSeconds) return `${hh}:${mm}`;
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function US_DATE(value: string | Date | null | undefined): string {
  if (value == null || value === "") return "";
  if (typeof value === "string") {
    const cal = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (cal) return `${cal[1]}-${cal[2]}-${cal[3]}`;
  }
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function handleBuscarCep(form: FormHandles | null | undefined): Promise<void> {
  if (!form) return;

  const data = form.getData() as Record<string, unknown>;
  const raw = digitsOnly(String(data.cep ?? ""));
  if (raw.length !== 8) {
    toast.error("Informe um CEP com 8 dígitos.");
    return;
  }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
    const j = (await res.json()) as ViaCepResponse;
    if (j.erro) {
      toast.error("CEP não encontrado.");
      return;
    }
    const uf = CAPS(j.uf);
    form.setData({
      ...data,
      cep: j.cep ?? data.cep,
      logradouro: j.logradouro ?? "",
      bairro: j.bairro ?? "",
      cidade: j.localidade ?? "",
      estado: uf,
      complemento: data.complemento ?? "",
    });
    if (uf) {
      form.setFieldValue("estado", uf);
    }
    toast.success("Endereço preenchido pelo CEP.");
  } catch {
    toast.error("Erro ao consultar o CEP.");
  }
}

export function BRN(value: number): string;
export function BRN(value: string): string;
export function BRN(value: number | string): string {
  if (typeof value === "number") {
    const n = !value || value < 0 ? 0 : value;
    return n.toLocaleString("pt-BR").padStart(3, "0");
  }

  const trimmed = value.trim();
  const negative = trimmed.startsWith("-");
  const commaIdx = trimmed.lastIndexOf(",");

  let intPart: string;
  let decPart = "";

  if (commaIdx >= 0) {
    intPart = trimmed.slice(0, commaIdx).replace(/\D/g, "");
    decPart = trimmed.slice(commaIdx + 1).replace(/\D/g, "");
  } else {
    intPart = trimmed.replace(/\D/g, "");
  }

  if (!intPart && !decPart) return negative ? "-" : "";

  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const formatted = decPart ? `${grouped},${decPart}` : grouped;
  return negative ? `-${formatted}` : formatted;
}

export function BRL(value: number): string {
  value = !value || value < 0 ? 0 : value;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function rBRN(txt: string): number {
  const trimmed = txt.trim();
  if (!trimmed || trimmed === "-") return 0;
  const negative = trimmed.startsWith("-");
  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(normalized);
  if (Number.isNaN(n)) return 0;
  return negative ? -n : n;
}

export function cleanUp(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null && v != ""));
}
