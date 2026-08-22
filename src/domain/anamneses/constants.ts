export const PARQ_ANSWER = {
  SIM: "SIM",
  NAO: "NAO",
  NAO_SEI: "NAO_SEI",
} as const;

export type ParqAnswer = (typeof PARQ_ANSWER)[keyof typeof PARQ_ANSWER];

export const SN = [
  { value: PARQ_ANSWER.NAO, label: "Não" },
  { value: PARQ_ANSWER.SIM, label: "Sim" },
] as const;

export const SNN = [...SN, { value: PARQ_ANSWER.NAO_SEI, label: "Não sei" }] as const;

export const ANAMNESE_PARQ = [
  "Algum médico já disse que você tem problema cardíaco e só deveria treinar com orientação?",
  "Sente dor no peito ao fazer atividade física?",
  "No último mês, sentiu dor no peito sem esforço?",
  "Já teve tontura com perda de equilíbrio ou desmaio?",
  "Tem problema ósseo ou articular que a atividade pode piorar?",
  "Usa medicamento para pressão ou coração?",
  "Tem diabetes?",
  "Algum familiar próximo teve problema cardíaco ou morte súbita em idade jovem?",
  "Há outro motivo para não treinar sem avaliação médica?",
] as const;

export const ANAMNESE_NAO_INFORMADO = "Não informado pelo aluno";

export const ANAMNESE_OBJETIVOS = [
  "Emagrecimento",
  "Hipertrofia",
  "Força",
  "Condicionamento",
  "Saúde / qualidade de vida",
  "Reabilitação",
  "Performance esportiva",
  "Estética",
  "Outro",
] as const;

export const ANAMNESE_EXPERIENCIA = ["Nenhuma", "Básica", "Intermediária", "Avançada"] as const;
export const ANAMNESE_ESCALA = ["Muito ruim", "Ruim", "Regular", "Boa", "Muito boa"] as const;
export const ANAMNESE_FREQUENCIA = ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"] as const;
/** Vermelho → verde (marca). Texto escuro no amarelo. */
export const ANAMNESE_ESCALA_CORES = ["#FF5356", "#f36700", "#FFD22B", "#0076F3", "#33CC66"] as const;

export function anamneseOptionChipStyle(
  value: string,
  options: readonly string[],
): { bgColor: string; txtColor: string } {
  const index = options.indexOf(value);
  const bgColor = index >= 0 ? (ANAMNESE_ESCALA_CORES[index] ?? "#64748B") : "#64748B";
  const txtColor = bgColor === "#FFD22B" ? "#111" : "#fff";
  return { bgColor, txtColor };
}
export const ANAMNESE_ROTINA = [
  "Predominantemente sentado(a)",
  "Em pé",
  "Caminho bastante",
  "Trabalho físico moderado",
  "Trabalho físico intenso",
  "Outro",
] as const;

export const ANAMNESE_SECTIONS = [
  "parq",
  "medicamentos",
  "lesoes",
  "sono",
  "rotina",
  "alimentacao",
  "habitos",
  "objetivos",
  "treino",
  "confirmacao",
] as const;

export type AnamneseSection = (typeof ANAMNESE_SECTIONS)[number];

export const ANAMNESE_STEPS = [
  {
    key: "saude",
    label: "Saúde",
    icon: "mdi:heart-pulse",
    sections: ["parq", "medicamentos", "lesoes"],
  },
  {
    key: "rotina",
    label: "Rotina",
    icon: "mdi:clock-outline",
    sections: ["sono", "rotina", "alimentacao", "habitos"],
  },
  {
    key: "objetivos",
    label: "Objetivos",
    icon: "mdi:target",
    sections: ["objetivos", "treino"],
  },
  {
    key: "confirmacao",
    label: "Confirmação",
    icon: "mdi:clipboard-text-outline",
    sections: ["confirmacao"],
  },
] as const;
