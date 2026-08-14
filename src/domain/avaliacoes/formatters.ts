import { Avaliacao, AvaliacaoFormValues, AvaliacaoMedidas, MEDIDA_KEYS } from "./types";

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

export function classificacaoImc(imc: number | null): string | null {
  if (imc == null) return null;
  if (imc < 18.5) return "Magreza";
  if (imc < 25) return "Eutrofia";
  if (imc < 30) return "Sobrepeso";
  if (imc < 35) return "Obesidade grau I";
  if (imc < 40) return "Obesidade grau II";
  return "Obesidade grau III";
}

export function interpretacaoImc(imc: number | null): string {
  const cls = classificacaoImc(imc);
  if (imc == null || !cls) return "Informe peso e altura para calcular o IMC.";
  if (cls === "Eutrofia") {
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

export function interpretacaoCq(cq: number | null): string | null {
  if (cq == null) return null;
  if (cq >= 0.9) {
    return `Relação cintura/quadril ${cq}: em homens, valores ≥ 0,90 costumam indicar maior acúmulo abdominal (referência OMS). Não é diagnóstico.`;
  }
  return `Relação cintura/quadril ${cq}: abaixo do limiar usual de 0,90 para homens (OMS). Não é diagnóstico.`;
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
  return values;
}
