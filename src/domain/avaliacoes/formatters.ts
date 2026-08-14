import { Avaliacao, AvaliacaoFormValues, AvaliacaoMedidas } from "./types";

export function formatAvaliacaoData(value: string | null | undefined): string {
  if (!value) return "—";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  return `${match[3]}/${match[2]}/${match[1].slice(2)}`;
}

export function calcImc(pesoKg?: number | null, alturaCm?: number | null): number | null {
  if (pesoKg == null || alturaCm == null || alturaCm <= 0) return null;
  const m = alturaCm / 100;
  return Math.round((pesoKg / (m * m)) * 10) / 10;
}

function numOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function buildMedidasFromForm(data: AvaliacaoFormValues): AvaliacaoMedidas {
  return {
    peito: numOrNull(data.peito),
    cintura: numOrNull(data.cintura),
    quadril: numOrNull(data.quadril),
    braco_dir: numOrNull(data.braco_dir),
    braco_esq: numOrNull(data.braco_esq),
    coxa_dir: numOrNull(data.coxa_dir),
    coxa_esq: numOrNull(data.coxa_esq),
  };
}

export function buildAvaliacaoPayload(data: AvaliacaoFormValues) {
  return {
    academia_id: numOrNull(data.academia_id) ?? undefined,
    id_pessoa: numOrNull(data.id_pessoa) ?? undefined,
    data: String(data.data || "").trim(),
    peso_kg: numOrNull(data.peso_kg),
    altura_cm: numOrNull(data.altura_cm),
    observacoes: data.observacoes?.trim() || null,
    medidas: buildMedidasFromForm(data),
  };
}

export function avaliacaoToFormValues(row: Avaliacao): AvaliacaoFormValues {
  const m = row.medidas ?? {};
  return {
    academia_id: row.academia_id,
    id_pessoa: row.id_pessoa,
    data: row.data ?? "",
    peso_kg: row.peso_kg ?? "",
    altura_cm: row.altura_cm ?? "",
    observacoes: row.observacoes ?? "",
    peito: m.peito ?? "",
    cintura: m.cintura ?? "",
    quadril: m.quadril ?? "",
    braco_dir: m.braco_dir ?? "",
    braco_esq: m.braco_esq ?? "",
    coxa_dir: m.coxa_dir ?? "",
    coxa_esq: m.coxa_esq ?? "",
  };
}
