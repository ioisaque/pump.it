import { Avaliacao } from "domain/avaliacoes/types";
import { api } from "services/api";

export type ListAvaliacoesParams = {
  id_pessoa?: number;
  academia_id?: number;
};

export function listAvaliacoes(params?: ListAvaliacoesParams) {
  return api
    .get<{ avaliacoes: Avaliacao[] }>("avaliacoes", { params })
    .then((res) => res.data);
}

export function findAvaliacao(id: number, params?: { academia_id?: number }) {
  return api
    .get<{ avaliacao: Avaliacao | null }>(`avaliacoes/${id}`, { params })
    .then((res) => res.data.avaliacao);
}

export function addAvaliacao(body: Record<string, unknown>) {
  return api.post<{ avaliacao: Avaliacao }>("avaliacoes/add", body).then((res) => res.data);
}

export function saveAvaliacao(id: number, body: Record<string, unknown>) {
  return api.patch<{ avaliacao: Avaliacao }>(`avaliacoes/${id}`, body).then((res) => res.data);
}

export function deleteAvaliacao(id: number, params?: { academia_id?: number }) {
  return api
    .delete<{ id: number; deleted: boolean }>(`avaliacoes/${id}/delete`, { params })
    .then((res) => res.data);
}
