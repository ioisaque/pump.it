import { Mensalidade } from "domain/mensalidades/types";
import { api } from "services/api";

export type MensalidadesQuery = {
  academia_id?: number;
  id_pessoa?: number | string;
  status?: string;
  competencia?: string;
};

export function listMensalidades(params?: MensalidadesQuery) {
  return api.get<{ mensalidades: Mensalidade[] }>("mensalidades", { params }).then((r) => r.data);
}

export function findMensalidade(id: number, academia_id?: number) {
  return api
    .get<{ mensalidade: Mensalidade }>(`mensalidades/${id}`, { params: { academia_id } })
    .then((r) => r.data.mensalidade);
}

export function addMensalidade(body: Record<string, unknown>, academia_id?: number) {
  return api
    .post<{ mensalidade: Mensalidade }>("mensalidades/add", body, { params: { academia_id } })
    .then((r) => r.data.mensalidade);
}

export function saveMensalidade(id: number, body: Record<string, unknown>, academia_id?: number) {
  return api
    .patch<{ mensalidade: Mensalidade }>(`mensalidades/${id}`, body, { params: { academia_id } })
    .then((r) => r.data.mensalidade);
}

export function deleteMensalidade(id: number, academia_id?: number) {
  return api.delete(`mensalidades/${id}/delete`, { params: { academia_id } }).then((r) => r.data);
}

export function checkoutMensalidade(
  id: number,
  provider: "asaas" | "mercadopago",
  academia_id?: number,
) {
  return api
    .post<{ provider: string | null; url: string | null; id_remoto: string | null }>(
      `mensalidades/${id}/checkout`,
      { provider },
      { params: { academia_id } },
    )
    .then((r) => r.data);
}

export function getMensalidadePaymentLink(id: number, academia_id?: number) {
  return api
    .get<{ provider: string | null; url: string | null; id_remoto: string | null }>(
      `mensalidades/${id}/payment-link`,
      { params: { academia_id } },
    )
    .then((r) => r.data);
}
