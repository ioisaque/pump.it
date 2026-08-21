import { ANAMNESE_PARQ, PARQ_ANSWER, ParqAnswer } from "domain/anamneses/constants";
import { Anamnese, AnamneseRespostas, emptyAnamneseRespostas } from "domain/anamneses/types";

export function mergeAnamneseRespostas(row: Anamnese | null | undefined): AnamneseRespostas {
  const base = emptyAnamneseRespostas();
  if (!row) return base;
  const merged: AnamneseRespostas = {
    ...base,
    ...(row.respostas ?? {}),
    objetivos: Array.isArray(row.respostas?.objetivos) ? row.respostas.objetivos.map(String) : base.objetivos,
    sintomas: Array.isArray(row.respostas?.sintomas) ? row.respostas.sintomas.map(String) : base.sintomas,
    familiar: Array.isArray(row.respostas?.familiar) ? row.respostas.familiar.map(String) : base.familiar,
    dorItens: Array.isArray(row.respostas?.dorItens)
      ? row.respostas.dorItens
          .map((item) => ({
            id_musculo: Number((item as { id_musculo?: unknown }).id_musculo),
            intensidade: String((item as { intensidade?: unknown }).intensidade ?? ""),
            tempo: String((item as { tempo?: unknown }).tempo ?? ""),
          }))
          .filter((item) => Number.isFinite(item.id_musculo))
      : Array.isArray(row.respostas?.dorMusculos)
        ? row.respostas.dorMusculos
            .map(Number)
            .filter((id) => Number.isFinite(id))
            .map((id_musculo) => ({
              id_musculo,
              intensidade: String(row.respostas?.dorIntensidade ?? ""),
              tempo: String(row.respostas?.dorTempo ?? ""),
            }))
        : base.dorItens,
    parq: base.parq,
    parqDetalhe: base.parqDetalhe,
    declaracao: Boolean(row.respostas?.declaracao),
    motivacao: typeof row.respostas?.motivacao === "number" ? row.respostas.motivacao : base.motivacao,
  };
  if (Array.isArray(row.respostas?.parqDetalhe)) {
    merged.parqDetalhe = ANAMNESE_PARQ.map((_, i) => String(row.respostas!.parqDetalhe![i] ?? ""));
  } else if (typeof row.respostas?.parqDetalhe === "string" && row.respostas.parqDetalhe) {
    merged.parqDetalhe = ANAMNESE_PARQ.map((_, i) => (i === 0 ? String(row.respostas!.parqDetalhe) : ""));
  }
  if (Array.isArray(merged.parq) && merged.parq.length !== ANAMNESE_PARQ.length) {
    merged.parq = ANAMNESE_PARQ.map((_, i) => merged.parq[i] ?? "");
  }
  if (Array.isArray(row.parq) && row.parq.length > 0) {
    merged.parq = ANAMNESE_PARQ.map((_, i) => {
      const value = row.parq![i];
      return value === PARQ_ANSWER.SIM || value === PARQ_ANSWER.NAO || value === PARQ_ANSWER.NAO_SEI ? value : "";
    });
  }
  if (!row.respostas) {
    merged.objetivoExplique = row.objetivos ?? "";
    merged.doencaRelevanteQual = row.historico_medico ?? "";
    merged.lesaoQual = row.dores_lesoes ?? "";
  }
  return merged;
}

export function parqComplete(parq: Array<ParqAnswer | "">): parq is ParqAnswer[] {
  return parq.length === ANAMNESE_PARQ.length && parq.every((value) => value === PARQ_ANSWER.SIM || value === PARQ_ANSWER.NAO);
}
