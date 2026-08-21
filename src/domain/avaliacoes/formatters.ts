import { Avaliacao, AvaliacaoFormValues, AvaliacaoMedidas, MEDIDA_KEYS, MEDIDA_TEXT_KEYS } from "./types";

export function formatAvaliacaoData(value: string | null | undefined): string {
  if (!value) return "—";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  return `${match[3]}/${match[2]}/${match[1].slice(2)}`;
}

export function idadeNaData(nasc: string | null | undefined, data: string | null | undefined): number | null {
  if (!nasc || !data) return null;
  const n = Date.parse(`${nasc.slice(0, 10)}T00:00:00`);
  const d = Date.parse(`${data.slice(0, 10)}T00:00:00`);
  if (!Number.isFinite(n) || !Number.isFinite(d)) return null;
  const nd = new Date(n);
  const dd = new Date(d);
  let age = dd.getFullYear() - nd.getFullYear();
  const m = dd.getMonth() - nd.getMonth();
  if (m < 0 || (m === 0 && dd.getDate() < nd.getDate())) age -= 1;
  return age >= 0 && age < 120 ? age : null;
}

export function isAlunoFem(genero?: string | null): boolean {
  return String(genero ?? "").toUpperCase() === "FEM";
}

export function calcImc(pesoKg?: number | null, alturaCm?: number | null): number | null {
  if (pesoKg == null || alturaCm == null || alturaCm <= 0) return null;
  const m = alturaCm / 100;
  return Math.round((pesoKg / (m * m)) * 10) / 10;
}

export function classificacaoImc(imc: number | null): string | null {
  if (imc == null) return null;
  if (imc < 18.5) return "Magreza";
  if (imc < 25) return "Normal";
  if (imc < 30) return "Sobrepeso";
  if (imc < 35) return "Obesidade grau I";
  if (imc < 40) return "Obesidade grau II";
  return "Obesidade grau III";
}

export function interpretacaoImc(imc: number | null): string {
  const cls = classificacaoImc(imc);
  if (imc == null || !cls) return "Informe peso e altura para calcular o IMC.";
  if (cls === "Normal") {
    return `IMC ${imc} (${cls}): faixa associada a menor risco metabólico na classificação da OMS. Não substitui avaliação clínica.`;
  }
  if (cls === "Sobrepeso") {
    return `IMC ${imc} (${cls}): acima da faixa de eutrofia. Circunferência da cintura e relação cintura/quadril ajudam a contextualizar. Não é diagnóstico.`;
  }
  if (cls === "Magreza") {
    return `IMC ${imc} (${cls}): abaixo da faixa de eutrofia. Vale acompanhar composição e orientação profissional. Não é diagnóstico.`;
  }
  return `IMC ${imc} (${cls}): classificação da OMS para índice de massa corporal. Use junto das perimetrias; não é diagnóstico médico.`;
}

export function calcCinturaQuadril(cintura?: number | null, quadril?: number | null): number | null {
  if (cintura == null || quadril == null || quadril <= 0) return null;
  return Math.round((cintura / quadril) * 100) / 100;
}

export function classificacaoWhr(whr: number | null, fem: boolean): string | null {
  if (whr == null) return null;
  if (fem) {
    if (whr < 0.8) return "Risco baixo";
    if (whr < 0.85) return "Risco moderado";
    return "Risco alto";
  }
  if (whr < 0.85) return "Risco baixo";
  if (whr < 0.9) return "Risco moderado";
  return "Risco alto";
}

export function interpretacaoCq(cq: number | null, fem = false): string | null {
  const cls = classificacaoWhr(cq, fem);
  if (cq == null || !cls) return null;
  return `Relação cintura/quadril ${cq}: ${cls} (referência OMS). Não é diagnóstico.`;
}

export function calcBmrHarrisBenedict(
  pesoKg?: number | null,
  alturaCm?: number | null,
  idade?: number | null,
  fem = false,
): number | null {
  if (pesoKg == null || alturaCm == null || idade == null || idade <= 0) return null;
  const kcal = fem
    ? 655.1 + 9.563 * pesoKg + 1.85 * alturaCm - 4.676 * idade
    : 66.5 + 13.75 * pesoKg + 5.003 * alturaCm - 6.775 * idade;
  return Math.round(kcal);
}

const JP7_KEYS = [
  "dobra_peitoral",
  "dobra_axilar",
  "dobra_tricipital",
  "dobra_subescapular",
  "dobra_abdominal",
  "dobra_suprailiaca",
  "dobra_coxa",
] as const;

export const DOBRA_LABELS: Record<string, string> = {
  dobra_peitoral: "Peitoral",
  dobra_axilar: "Axilar média",
  dobra_bicipital: "Bíceps",
  dobra_tricipital: "Tríceps",
  dobra_subescapular: "Subescapular",
  dobra_suprailiaca: "Suprailíaca",
  dobra_abdominal: "Abdominal",
  dobra_coxa: "Coxa",
  dobra_perna: "Perna",
};

export const DOBRA_DIST_KEYS = [
  "dobra_peitoral",
  "dobra_axilar",
  "dobra_abdominal",
  "dobra_bicipital",
  "dobra_subescapular",
  "dobra_coxa",
  "dobra_tricipital",
  "dobra_suprailiaca",
  "dobra_perna",
] as const;

export function medidaNum(m: AvaliacaoMedidas | null | undefined, key: string): number | null {
  const v = m?.[key];
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function calcJacksonPollock7(
  medidas: AvaliacaoMedidas | null | undefined,
  idade: number | null,
  fem: boolean,
): number | null {
  if (idade == null || idade <= 0) return null;
  const folds: number[] = [];
  for (const key of JP7_KEYS) {
    const n = medidaNum(medidas, key);
    if (n == null) return null;
    folds.push(n);
  }
  const s = folds.reduce((a, b) => a + b, 0);
  const s2 = s * s;
  const dens = fem
    ? 1.097 - 0.00046971 * s + 0.00000056 * s2 - 0.00012828 * idade
    : 1.112 - 0.00043499 * s + 0.00000055 * s2 - 0.00028826 * idade;
  if (dens <= 0) return null;
  return Math.round(((495 / dens - 450) * 100)) / 100;
}

export function classificacaoGordura(pct: number | null, idade: number | null, fem: boolean): string | null {
  if (pct == null || idade == null) return null;
  const avgMax = fem ? (idade < 30 ? 22 : idade < 40 ? 24 : 26) : idade < 30 ? 16 : idade < 40 ? 18 : 20;
  const lowMax = fem ? (idade < 30 ? 17 : idade < 40 ? 18 : 19) : idade < 30 ? 11 : idade < 40 ? 12 : 13;
  if (pct < lowMax) return "Abaixo";
  if (pct <= avgMax) return "Na média";
  return "Acima";
}

export function distribuicaoGordura(medidas: AvaliacaoMedidas | null | undefined): { key: string; label: string; pct: number }[] {
  const items: { key: string; label: string; mm: number }[] = [];
  for (const key of DOBRA_DIST_KEYS) {
    const mm = medidaNum(medidas, key);
    if (mm == null) continue;
    items.push({ key, label: DOBRA_LABELS[key] ?? key, mm });
  }
  const sum = items.reduce((a, b) => a + b.mm, 0);
  if (sum <= 0) return [];
  return items.map((i) => ({ key: i.key, label: i.label, pct: Math.round((i.mm / sum) * 1000) / 10 }));
}

export type ComposicaoCorporal = {
  protocolo: string;
  gorduraAtual: number;
  gorduraClass: string | null;
  gorduraObjetivo: number;
  massaGorda: number;
  massaMagra: number;
  massaIdeal: number;
  excessoGordura: number;
  gorduraIdeal: number;
};

export function calcComposicao(
  pesoKg: number | null | undefined,
  gorduraAtual: number | null,
  gorduraObjetivo: number | null,
  gorduraClass: string | null,
): ComposicaoCorporal | null {
  if (pesoKg == null || gorduraAtual == null) return null;
  const obj = gorduraObjetivo != null && gorduraObjetivo > 0 && gorduraObjetivo < 50 ? gorduraObjetivo : 11;
  const frac = gorduraAtual / 100;
  const massaGorda = Math.round(pesoKg * frac * 100) / 100;
  const massaMagra = Math.round((pesoKg - massaGorda) * 100) / 100;
  const massaIdeal = Math.round(pesoKg * (1 - frac + obj / 100) * 100) / 100;
  const excessoGordura = Math.round((pesoKg - massaIdeal) * 100) / 100;
  const gorduraIdeal = Math.round((massaGorda - excessoGordura) * 100) / 100;
  return {
    protocolo: "Jackson & Pollock - 7",
    gorduraAtual,
    gorduraClass,
    gorduraObjetivo: obj,
    massaGorda,
    massaMagra,
    massaIdeal,
    excessoGordura,
    gorduraIdeal,
  };
}

function numOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function buildMedidasFromForm(data: AvaliacaoFormValues): AvaliacaoMedidas {
  const medidas: AvaliacaoMedidas = {};
  for (const key of MEDIDA_KEYS) {
    medidas[key] = numOrNull(data[key]);
  }
  for (const key of MEDIDA_TEXT_KEYS) {
    const raw = data[key];
    medidas[key] = raw == null || raw === "" ? null : String(raw).trim() || null;
  }
  if (!medidas.protocolo) medidas.protocolo = "jp7";
  return medidas;
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
  const values: AvaliacaoFormValues = {
    academia_id: row.academia_id,
    id_pessoa: row.id_pessoa,
    data: row.data ?? "",
    peso_kg: row.peso_kg ?? "",
    altura_cm: row.altura_cm ?? "",
    observacoes: row.observacoes ?? "",
  };
  for (const key of MEDIDA_KEYS) {
    values[key] = m[key] ?? "";
  }
  for (const key of MEDIDA_TEXT_KEYS) {
    values[key] = m[key] ?? (key === "protocolo" ? "jp7" : "");
  }
  return values;
}
