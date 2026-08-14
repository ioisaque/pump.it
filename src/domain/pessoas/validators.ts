import { QueryClient } from "@tanstack/react-query";
import { PESSOA_NIVEL, PESSOA_STATUS } from "domain/pessoas/constants";
import { formatPessoaFormValues, normalizePessoaFormPayload } from "domain/pessoas/formatters";
import { Pessoa, PessoaDetail } from "domain/pessoas/types";
import { CAPS, cleanUp, rBRN, US_DATE } from "domain/shared/formatters";
import { flagCode, flagId } from "domain/tabelas/types";
import { pessoaQueryKey } from "hooks/usePessoa";
import toast from "react-hot-toast";
import { NavigateFunction } from "react-router-dom";

export type PessoaFormSource = Pessoa | PessoaDetail;

export type PessoaSubmitDeps = {
  queryClient: QueryClient;
  navigate?: NavigateFunction;
  /** Absolute list path e.g. `/slug/pessoas` or `/pessoas`. */
  listPath?: string;
  onSuccess?: () => void | Promise<void>;
  fotoFile?: File | null;
};

type SaveContext = Pick<Pessoa, "id" | "nivel" | "status" | "origem" | "etiqueta">;

/** Fields pump API accepts on create/patch. */
const PUMP_API_FIELDS = new Set([
  "id",
  "academia_id",
  "cpf_cnpj",
  "status",
  "nivel",
  "origem",
  "etiqueta",
  "nome",
  "pin",
  "email",
  "senha",
  "data_nasc",
  "contato",
  "instagram",
  "foto",
  "logradouro",
  "numero",
  "cep",
  "bairro",
  "cidade",
  "estado",
  "complemento",
]);

function optionalInt(value: unknown): number | undefined {
  if (value === "" || value === null || value === undefined) return undefined;
  const s = String(value).trim();
  const n = /[.,]/.test(s) ? Math.trunc(rBRN(s)) : parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}

function coercePessoaNumericFields(payload: Record<string, unknown>): Record<string, unknown> {
  for (const key of ["id", "nivel", "origem", "etiqueta", "academia_id", "numero"] as const) {
    if (!(key in payload)) continue;
    const v = optionalInt(payload[key]);
    if (v === undefined) delete payload[key];
    else payload[key] = v;
  }

  Object.keys(payload).forEach((k) => {
    if (payload[k] === undefined) delete payload[k];
  });

  return payload;
}

function toPumpApiBody(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (!PUMP_API_FIELDS.has(key)) continue;
    if (value === undefined || value === null) continue;
    out[key] = value;
  }
  if ("status" in out) {
    out.status =
      flagCode(out.status as string | number | null | undefined) ?? PESSOA_STATUS.ACTIVE;
  }
  return out;
}

export function buildPessoaCreatePayload(cleaned: Record<string, unknown>): Record<string, unknown> {
  return toPumpApiBody(coercePessoaNumericFields(normalizePessoaFormPayload({ ...cleaned })));
}

export function buildEmptyPessoaFormInitialData(academiaId?: number): Record<string, unknown> {
  return {
    nome: "",
    cpf_cnpj: "",
    email: "",
    data_nasc: "",
    contato: "",
    instagram: "",
    academia_id: academiaId && academiaId > 0 ? academiaId : "",
    nivel: PESSOA_NIVEL.ADMIN,
    status: 1,
    origem: 2,
    etiqueta: 2,
    pin: "",
    senha1: "",
    senha2: "",
    logradouro: "",
    numero: "",
    cep: "",
    bairro: "",
    cidade: "",
    estado: "",
    complemento: "",
    latitude: "",
    longitude: "",
    ip: "",
  };
}

export function buildPessoaFormInitialData(p: PessoaFormSource): Record<string, unknown> {
  return formatPessoaFormValues({
    nome: p.nome ?? "",
    cpf_cnpj: p.cpf_cnpj ?? "",
    email: p.email ?? "",
    data_nasc: US_DATE(p.data_nasc),
    contato: p.contato ?? "",
    instagram: p.instagram ?? "",
    academia_id: p.academia_id && p.academia_id > 0 ? p.academia_id : "",
    nivel: flagId(p.nivel) ?? PESSOA_NIVEL.ADMIN,
    status: flagId(p.status) ?? 1,
    origem: flagId(p.origem) ?? 2,
    etiqueta: flagId(p.etiqueta) ?? 2,
    pin: "",
    senha1: "",
    senha2: "",
    logradouro: p.logradouro ?? "",
    numero: p.numero ?? "",
    cep: p.cep ?? "",
    bairro: p.bairro ?? "",
    cidade: p.cidade ?? "",
    estado: CAPS(p.estado).slice(0, 2),
    complemento: p.complemento ?? "",
    latitude: p.latitude ?? "",
    longitude: p.longitude ?? "",
    ip: p.ip ?? "",
  });
}

export function buildPessoaSavePayload(
  cleaned: Record<string, unknown>,
  current: SaveContext,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    ...cleaned,
    id: current.id,
    nivel: optionalInt(cleaned.nivel) ?? flagId(current.nivel) ?? PESSOA_NIVEL.ADMIN,
    status:
      flagCode(cleaned.status as string | number | null | undefined) ??
      flagCode(current.status) ??
      PESSOA_STATUS.ACTIVE,
    origem: optionalInt(cleaned.origem) ?? flagId(current.origem) ?? undefined,
    etiqueta: optionalInt(cleaned.etiqueta) ?? flagId(current.etiqueta) ?? undefined,
  };

  if (cleaned.data_nasc) {
    payload.data_nasc = cleaned.data_nasc;
  }

  return toPumpApiBody(coercePessoaNumericFields(normalizePessoaFormPayload(payload)));
}

/** Returns an error message, or null when passwords are valid. Mutates `data` in place. */
export function applyPasswordFields(data: Record<string, unknown>): string | null {
  if (data.senha1 && data.senha1 !== data.senha2) {
    return "As senhas não correspondem.";
  }
  if (data.senha1) {
    data.senha = data.senha1;
  }
  delete data.senha1;
  delete data.senha2;
  return null;
}

export function validatePessoaCreate(data: Record<string, unknown>): string | null {
  if (!String(data.nome ?? "").trim()) {
    return "Informe o nome.";
  }
  if (!String(data.email ?? "").trim()) {
    return "Informe o e-mail.";
  }
  const cpfDigits = String(data.cpf_cnpj ?? "").replace(/\D/g, "");
  if (cpfDigits.length !== 11 && cpfDigits.length !== 14) {
    return "Informe o CPF/CNPJ.";
  }
  const nivel = parseInt(String(data.nivel), 10);
  if (!Number.isFinite(nivel) || nivel < 1) {
    return "Selecione o nível.";
  }
  return null;
}

function handleApiError(err: unknown): void {
  const error = err as { response?: { data?: { statusCode?: number; message?: string } }; message?: string };
  const { statusCode, message } = error.response?.data ?? {};
  toast.error(`${statusCode ?? "?"}: ${message ?? error.message ?? "Erro"}.`);
}

function goList(deps: PessoaSubmitDeps) {
  if (deps.onSuccess) return deps.onSuccess();
  if (deps.navigate) {
    deps.navigate(deps.listPath ?? "/pessoas", { replace: true });
  }
}

export async function submitPessoaCreate(
  data: Record<string, unknown>,
  deps: PessoaSubmitDeps,
): Promise<boolean> {
  const createError = validatePessoaCreate(data);
  if (createError) {
    toast.error(createError);
    return false;
  }

  const passwordError = applyPasswordFields(data);
  if (passwordError) {
    toast.error(passwordError);
    return false;
  }

  const cleaned = cleanUp({ ...data }) as Record<string, unknown>;
  const payload = buildPessoaCreatePayload(cleaned);
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "foto") return;
    if (value === undefined || value === null) return;
    formData.append(key, String(value));
  });
  if (deps.fotoFile) {
    formData.append("foto", deps.fotoFile);
  }

  try {
    await import("api/pessoas").then((m) => m.addPessoa(formData));
    toast.success("Salvo com sucesso!");
    await deps.queryClient.invalidateQueries({ queryKey: ["pessoas"] });
    await goList(deps);
    return true;
  } catch (err) {
    handleApiError(err);
    return false;
  }
}

export async function submitPessoaUpdate(
  data: Record<string, unknown>,
  pessoa: SaveContext,
  deps: PessoaSubmitDeps,
): Promise<boolean> {
  if (!pessoa.id) return false;

  const passwordError = applyPasswordFields(data);
  if (passwordError) {
    toast.error(passwordError);
    return false;
  }

  const cleaned = cleanUp(data) as Record<string, unknown>;
  const payload = buildPessoaSavePayload(cleaned, pessoa);
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "foto" || key === "id") return;
    if (value === undefined || value === null) return;
    formData.append(key, String(value));
  });
  if (deps.fotoFile) {
    formData.append("foto", deps.fotoFile);
  }

  try {
    await import("api/pessoas").then((m) => m.savePessoa(pessoa.id, formData));
    toast.success("Salvo com sucesso!");
    await deps.queryClient.invalidateQueries({ queryKey: ["pessoas"] });
    await deps.queryClient.refetchQueries({ queryKey: pessoaQueryKey(pessoa.id), type: "active" });
    await goList(deps);
    return true;
  } catch (err) {
    handleApiError(err);
    return false;
  }
}
