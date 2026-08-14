import { NOTIFICACAO_DEFAULT_FOTO_SRC } from "domain/notificacoes/default-foto";
import { NotificacaoAudiencia } from "domain/notificacoes/types";
import { resolveUploadUrl } from "domain/shared/formatters";
import { Flag, resolveFlag } from "domain/tabelas/types";

export function notificacaoFotoUrl(foto: string | null | undefined) {
  return resolveUploadUrl(foto) ?? NOTIFICACAO_DEFAULT_FOTO_SRC;
}

export function hasAudienceFilter(audiencia: NotificacaoAudiencia) {
  if (audiencia.pessoa_ids?.length) return true;
  if (audiencia.niveis?.length) return true;
  if (audiencia.online_only) return true;
  if (audiencia.active_within_minutes != null && audiencia.active_within_minutes > 0) return true;
  if (audiencia.inactive_within_minutes != null && audiencia.inactive_within_minutes > 0) return true;
  return false;
}

export function audienciaSummary(audiencia: NotificacaoAudiencia, niveis?: Flag[]) {
  const parts: string[] = [];
  if (audiencia.pessoa_ids?.length) {
    parts.push(`${audiencia.pessoa_ids.length} pessoa(s)`);
  }
  if (audiencia.niveis?.length) {
    const names = audiencia.niveis
      .map((id) => resolveFlag(id, niveis)?.nome)
      .filter(Boolean)
      .join(", ");
    parts.push(names ? `níveis: ${names}` : `níveis: ${audiencia.niveis.length}`);
  }
  if (audiencia.online_only) parts.push("somente online");
  if (audiencia.active_within_minutes) {
    parts.push(`ativos ${audiencia.active_within_minutes} min`);
  }
  if (audiencia.inactive_within_minutes) {
    parts.push(`inativos ${audiencia.inactive_within_minutes} min`);
  }
  return parts.join(" · ") || "—";
}
