import {
  NotificacaoEventConfig,
  NotificacaoEventConfigResponse,
  NotificacaoPreset,
} from "domain/notificacoes/types";
import { api } from "services/api";

function academiaParams(academiaId?: number) {
  return academiaId && academiaId > 0 ? { academia_id: academiaId } : undefined;
}

function formDataToJson(formData: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "foto" || value instanceof File) return;
    out[key] = value;
  });
  if (typeof out.audiencia === "string") {
    try {
      out.audiencia = JSON.parse(out.audiencia);
    } catch {
      /* keep string — API parseAudiencia handles it */
    }
  }
  if (out.agendado_em != null && out.agendar_em == null) {
    out.agendar_em = out.agendado_em;
  }
  if (out.academia_id != null) {
    const n = Number(out.academia_id);
    if (Number.isFinite(n)) out.academia_id = n;
  }
  return out;
}

export function listNotificacoes(academiaId?: number) {
  return api
    .get("notificacoes", { params: academiaParams(academiaId) })
    .then((res) => res.data.notificacoes ?? []);
}

export function findNotificacao(id: number, academiaId?: number) {
  return api.get(`notificacoes/${id}`, { params: academiaParams(academiaId) }).then((res) => res.data);
}

export function getInbox() {
  return api.get("notificacoes/inbox").then((res) => res.data);
}

export function addNotificacao(
  formData: FormData | Record<string, unknown>,
  _config?: Record<string, unknown>,
) {
  const body = formData instanceof FormData ? formDataToJson(formData) : formData;
  return api.post("notificacoes/add", body);
}

export function cancelNotificacao(id: number, academiaId?: number) {
  return api.post(`notificacoes/${id}/cancel`, { academia_id: academiaId }, {
    params: academiaParams(academiaId),
  });
}

export function resendNotificacaoById(id: number, academiaId?: number) {
  return api.post(
    `notificacoes/resend/${id}`,
    { academia_id: academiaId },
    { params: academiaParams(academiaId) },
  );
}

export function deleteNotificacao(id: number, academiaId?: number) {
  return api.delete(`notificacoes/${id}/delete`, { params: academiaParams(academiaId) });
}

export function listPresets(type: string, academiaId?: number) {
  return api
    .get<{ presets: NotificacaoPreset[] }>(`notificacoes/presets/${type}`, {
      params: academiaParams(academiaId),
    })
    .then((res) => res.data.presets ?? []);
}

export function addPreset(body: unknown, academiaId?: number) {
  const payload =
    body && typeof body === "object"
      ? { ...(body as Record<string, unknown>), academia_id: academiaId ?? (body as { academia_id?: number }).academia_id }
      : body;
  return api.post("notificacoes/presets", payload);
}

export function savePreset(id: number, body: unknown, academiaId?: number) {
  const payload =
    body && typeof body === "object"
      ? { ...(body as Record<string, unknown>), academia_id: academiaId ?? (body as { academia_id?: number }).academia_id }
      : body;
  return api.patch(`notificacoes/presets/${id}`, payload);
}

export function deletePreset(id: number, academiaId?: number) {
  return api.delete(`notificacoes/presets/${id}`, { params: academiaParams(academiaId) });
}

export function clearAll(academiaId?: number) {
  return api.delete("notificacoes/clear-all", { params: academiaParams(academiaId) });
}

export function markInboxRead(id: number) {
  return api.patch(`notificacoes/inbox/read/${id}`);
}

export function markAllInboxRead() {
  return api.patch("notificacoes/inbox/read-all");
}

export function getNotificacaoEventConfig() {
  return api.get<NotificacaoEventConfigResponse>("notificacoes/config").then((res) => res.data);
}

export function patchNotificacaoEventConfig(events: Partial<NotificacaoEventConfig>) {
  return api
    .patch<NotificacaoEventConfigResponse>("notificacoes/config", { events })
    .then((res) => res.data);
}
