import { api } from "services/api";

export type Academia = {
  id: number;
  status: string;
  slug: string;
  nome: string;
  razao_social: string | null;
  cnpj: string | null;
  email: string | null;
  contato: string | null;
  instagram: string | null;
  site: string | null;
  logo: string | null;
  logradouro: string | null;
  numero: number | null;
  cep: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  complemento: string | null;
  criado_por: number;
  criado_em: string;
  alterado_por: number;
  alterado_em: string | null;
};

export async function listAcademias() {
  const { data } = await api.get<{ academias: Academia[] }>("academias");
  return data;
}

export async function findAcademia(id: number) {
  const { data } = await api.get<{ academia: Academia }>(`academias/${id}`);
  return data;
}

export async function addAcademia(payload: FormData | Record<string, unknown>) {
  if (payload instanceof FormData) {
    const { data } = await api.post<{ academia: Academia }>("academias/add", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }
  const { data } = await api.post<{ academia: Academia }>("academias/add", payload);
  return data;
}

export async function saveAcademia(id: number, payload: FormData | Record<string, unknown>) {
  if (payload instanceof FormData) {
    const { data } = await api.patch<{ academia: Academia }>(`academias/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }
  const { data } = await api.patch<{ academia: Academia }>(`academias/${id}`, payload);
  return data;
}

export async function deleteAcademia(id: number) {
  const { data } = await api.delete<{ id: number; deleted: boolean }>(`academias/${id}/delete`);
  return data;
}

export async function findAcademiaPublic(slug: string) {
  const { data } = await api.get<{ academia: Pick<Academia, "slug" | "nome" | "logo"> }>(
    `auth/academia/${encodeURIComponent(slug)}`,
  );
  return data.academia;
}
