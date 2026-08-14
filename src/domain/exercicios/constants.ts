export const EXERCICIO_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export const EXERCICIO_ANEXO_TIPO = {
  IMAGE: "IMAGE",
  GIF: "GIF",
  VIDEO: "VIDEO",
} as const;

export const EXERCICIOS_QUERY_KEY = ["exercicios"] as const;

export function exercicioQueryKey(id: number) {
  return ["exercicios", id] as const;
}
