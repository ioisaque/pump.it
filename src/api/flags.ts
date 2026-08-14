import { EntityStatusFlag } from "domain/tabelas/types";
import { api } from "services/api";

export type FlagKind = "status" | "niveis" | "origens" | "etiquetas" | "musculos";
export type StatusEntity = "pessoas";

export const listFlags = <T>(kind: FlagKind) =>
  api.get(`flags/${kind}`).then((res) => res.data.data as T[]);

export const listEntityStatus = (entity: StatusEntity) =>
  api.get(`flags/status/${entity}`).then((res) => res.data.data as EntityStatusFlag[]);

export const saveEntityStatus = (
  entity: StatusEntity,
  code: string,
  payload: { label?: string; nome?: string; icon?: string; color?: string },
) =>
  api
    .patch(`flags/status/${entity}/${code}`, payload)
    .then((res) => res.data.data as EntityStatusFlag);

export const findFlag = <T>(kind: FlagKind, id: number) =>
  api.get(`flags/${kind}/${id}`).then((res) => res.data.data as T);

export const addFlag = <T>(
  kind: Exclude<FlagKind, "status">,
  payload: { nome: string; status?: number; color?: string; icon?: string },
) => api.post(`flags/${kind}/add`, payload).then((res) => res.data.data as T);

export const saveFlag = (
  kind: Exclude<FlagKind, "status">,
  id: number,
  payload: { nome?: string; status?: number; color?: string; icon?: string },
) => api.patch(`flags/${kind}/${id}`, payload);

export const deleteFlag = (kind: Exclude<FlagKind, "status">, id: number) =>
  api.delete(`flags/${kind}/${id}/delete`);
