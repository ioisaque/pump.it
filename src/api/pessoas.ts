import { PESSOA_LIST_TIPO, PessoaListTipo } from "domain/pessoas/constants";
import { Pessoa, PessoaDetail } from "domain/pessoas/types";
import { api } from "services/api";

export type ListPessoasParams = {
  /** Default ALL — alunos e staff. */
  tipo?: PessoaListTipo;
  /** Filtro opcional; master sem academia lista global. */
  academia_id?: number;
};

export function listPessoas(params: ListPessoasParams = {}) {
  const tipo = params.tipo ?? PESSOA_LIST_TIPO.FUNCIONARIO;
  return api
    .get<{ pessoas: Pessoa[] }>("pessoas", {
      params: {
        tipo,
        ...(params.academia_id != null && params.academia_id > 0
          ? { academia_id: params.academia_id }
          : {}),
      },
    })
    .then((res) => res.data);
}

export function findPessoa(id: number) {
  return api.get<{ pessoa: PessoaDetail | null }>(`pessoas/${id}`).then((res) => res.data.pessoa);
}

export function addPessoa(payload: FormData | Record<string, unknown>) {
  if (payload instanceof FormData) {
    return api
      .post<{ pessoa: PessoaDetail }>("pessoas/add", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  }
  return api.post<{ pessoa: PessoaDetail }>("pessoas/add", payload).then((res) => res.data);
}

export function savePessoa(id: number, payload: FormData | Record<string, unknown>) {
  if (payload instanceof FormData) {
    return api
      .patch<{ pessoa: PessoaDetail }>(`pessoas/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  }
  return api.patch<{ pessoa: PessoaDetail }>(`pessoas/${id}`, payload).then((res) => res.data);
}

export function deletePessoa(id: number) {
  return api.delete(`pessoas/${id}/delete`);
}
