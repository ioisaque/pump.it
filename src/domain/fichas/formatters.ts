import { FICHA_PADRAO, FichaPadrao } from "domain/fichas/constants";

export function diasFromPadrao(padrao: string): string[] {
  const key = String(padrao || "").toUpperCase();
  if (key === FICHA_PADRAO.A_B) return ["A", "B"];
  if (key === FICHA_PADRAO.A_B_C) return ["A", "B", "C"];
  if (key === FICHA_PADRAO.A_B_C_D) return ["A", "B", "C", "D"];
  return key.split("_").filter(Boolean);
}

export function formatPadraoLabel(padrao: string): string {
  return diasFromPadrao(padrao).join(" / ");
}

export function formatDescanso(segundos: number): string {
  if (!Number.isFinite(segundos)) return "—";
  if (segundos < 60) return `${segundos}s`;
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

export function isFichaPadrao(value: string): value is FichaPadrao {
  return Object.values(FICHA_PADRAO).includes(value as FichaPadrao);
}
