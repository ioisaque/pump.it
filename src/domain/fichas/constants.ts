export const FICHA_STATUS = {
  DELETED: "DELETED",
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
} as const;

export type FichaStatus = (typeof FICHA_STATUS)[keyof typeof FICHA_STATUS];

export const FICHA_PADRAO = {
  A_B: "A_B",
  A_B_C: "A_B_C",
  A_B_C_D: "A_B_C_D",
} as const;

export type FichaPadrao = (typeof FICHA_PADRAO)[keyof typeof FICHA_PADRAO];

export const FICHA_PADRAO_OPTIONS = [
  { value: FICHA_PADRAO.A_B, label: "A / B" },
  { value: FICHA_PADRAO.A_B_C, label: "A / B / C" },
  { value: FICHA_PADRAO.A_B_C_D, label: "A / B / C / D" },
] as const;

export const fichasQueryKey = ["fichas"] as const;

export function fichaQueryKey(id: number | string) {
  return ["fichas", Number(id)] as const;
}
