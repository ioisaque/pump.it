import { isFichaPadrao } from "domain/fichas/formatters";
import { FichaItem, FichaPayload } from "domain/fichas/types";

export function validateFichaForm(data: {
  nome?: string;
  padrao?: string;
  itens?: FichaItem[];
}): string | null {
  const nome = String(data.nome ?? "").trim();
  if (nome.length < 2) return "Informe o nome da ficha.";
  const padrao = String(data.padrao ?? "").trim().toUpperCase();
  if (!isFichaPadrao(padrao)) return "Selecione o padrão (A_B, A_B_C ou A_B_C_D).";
  const itens = data.itens ?? [];
  for (const item of itens) {
    if (!item.id_exercicio || Number(item.id_exercicio) < 1) {
      return "Cada item precisa de um exercício válido.";
    }
    if (!String(item.repeticoes ?? "").trim()) {
      return "Informe as repeticoes de cada item.";
    }
    if (!String(item.dia ?? "").trim()) {
      return "Informe o dia (A/B/C/D) de cada item.";
    }
  }
  return null;
}

export function buildFichaPayload(
  data: { nome: string; padrao: string; status?: string },
  itens: FichaItem[],
  academiaId?: number,
): FichaPayload {
  return {
    academia_id: academiaId,
    status: data.status,
    nome: String(data.nome).trim(),
    padrao: String(data.padrao).trim().toUpperCase(),
    itens: itens.map((item, index) => ({
      id: item.id,
      id_exercicio: Number(item.id_exercicio),
      dia: String(item.dia).toUpperCase().slice(0, 1),
      ordem: item.ordem ?? index,
      series: Number(item.series) || 3,
      repeticoes: String(item.repeticoes).trim(),
      carga: item.carga == null || Number.isNaN(Number(item.carga)) ? null : Number(item.carga),
      descanso_segundos: Number(item.descanso_segundos) || 60,
    })),
  };
}
