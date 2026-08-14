import { ACESSO_TIPOS, AcessoTipo } from "./types";

export const ACESSO_TIPO_LABEL: Record<AcessoTipo, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
};

export function acessoTipoLabel(tipo: string): string {
  if ((ACESSO_TIPOS as readonly string[]).includes(tipo)) {
    return ACESSO_TIPO_LABEL[tipo as AcessoTipo];
  }
  return tipo;
}
