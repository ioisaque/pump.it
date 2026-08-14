import { Acesso, AcessoTipo } from "domain/acessos/types";
import { api } from "services/api";

export type AcessosQueryParams = {
  academia_slug?: string;
  academia_id?: number | string;
  id_pessoa?: number | string;
  tipo?: AcessoTipo | string;
};

export type AcessoBody = {
  academia_slug?: string;
  academia_id?: number;
  id_pessoa: number;
  tipo: AcessoTipo | string;
  criado_em?: string;
  origem?: string | null;
};

export async function listAcessos(params?: AcessosQueryParams) {
  const { data } = await api.get<{ acessos: Acesso[] }>("acessos", { params });
  return data;
}

export async function findAcesso(id: number, params?: AcessosQueryParams) {
  const { data } = await api.get<{ acesso: Acesso }>(`acessos/${id}`, { params });
  return data.acesso;
}

export async function addAcesso(body: AcessoBody, params?: AcessosQueryParams) {
  const { data } = await api.post<{ acesso: Acesso }>("acessos/add", body, { params });
  return data.acesso;
}

export async function saveAcesso(id: number, body: Partial<AcessoBody>, params?: AcessosQueryParams) {
  const { data } = await api.patch<{ acesso: Acesso }>(`acessos/${id}`, body, { params });
  return data.acesso;
}

export async function deleteAcesso(id: number, params?: AcessosQueryParams) {
  const { data } = await api.delete<{ id: number; deleted: boolean }>(`acessos/${id}/delete`, {
    params,
  });
  return data;
}
