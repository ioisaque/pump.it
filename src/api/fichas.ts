import { api } from "services/api";
import { Ficha, FichaPayload } from "domain/fichas/types";

export async function listFichas(): Promise<Ficha[]> {
  const { data } = await api.get<{ fichas: Ficha[] }>("fichas");
  return data.fichas ?? [];
}

export async function findFicha(id: number): Promise<Ficha | null> {
  const { data } = await api.get<{ ficha: Ficha | null }>(`fichas/${id}`);
  return data.ficha ?? null;
}

export async function addFicha(body: FichaPayload): Promise<Ficha> {
  const { data } = await api.post<{ ficha: Ficha }>("fichas/add", body);
  return data.ficha;
}

export async function saveFicha(id: number, body: FichaPayload): Promise<Ficha> {
  const { data } = await api.patch<{ ficha: Ficha }>(`fichas/${id}`, body);
  return data.ficha;
}

export async function deleteFicha(id: number): Promise<void> {
  await api.delete(`fichas/${id}/delete`);
}
