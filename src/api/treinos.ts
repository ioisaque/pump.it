import { api } from "services/api";
import { Ficha } from "domain/fichas/types";

export type Treino = {
  id: number;
  academia_id: number;
  id_pessoa: number;
  id_ficha: number;
  dia: string;
  iniciado_em: string;
  encerrado_em: string | null;
  id_acesso_entrada: number | null;
  id_acesso_saida: number | null;
  ficha: Pick<Ficha, "id" | "nome" | "padrao" | "itens"> | null;
};

export async function listTreinos(params?: { academia_slug?: string }) {
  const { data } = await api.get<{ treinos: Treino[] }>("treinos", { params });
  return data.treinos;
}

export async function addTreino(body?: { academia_slug?: string; id_ficha?: number; dia?: string }) {
  const { data } = await api.post<{ treino: Treino }>("treinos/add", body ?? {});
  return data.treino;
}

export async function findTreino(id: number, params?: { academia_slug?: string }) {
  const { data } = await api.get<{ treino: Treino }>(`treinos/${id}`, { params });
  return data.treino;
}

export async function encerrarTreino(id: number, params?: { academia_slug?: string }) {
  const { data } = await api.patch<{ treino: Treino }>(`treinos/${id}/encerrar`, {}, { params });
  return data.treino;
}
