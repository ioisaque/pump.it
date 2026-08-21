import { Anamnese, AnamneseBody } from "domain/anamneses/types";
import { api } from "services/api";

export function findAnamnese(idPessoa?: number) {
  return api
    .get<{ anamnese: Anamnese | null }>("anamneses", {
      params: idPessoa ? { id_pessoa: idPessoa } : undefined,
    })
    .then((res) => res.data.anamnese);
}

export function addAnamnese(payload: AnamneseBody) {
  return api.post<{ anamnese: Anamnese }>("anamneses/add", payload).then((res) => res.data.anamnese);
}
