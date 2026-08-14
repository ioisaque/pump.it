export type NotificacaoStatus = 0 | 1 | 2;

export type NotificacaoAudiencia = {
  pessoa_ids?: number[];
  niveis?: number[];
  online_only?: boolean;
  active_within_minutes?: number;
  inactive_within_minutes?: number;
};

export type Notificacao = {
  id: number;
  academia_id?: number;
  status: NotificacaoStatus;
  titulo: string;
  mensagem: string;
  foto: string | null;
  link: string | null;
  audiencia: NotificacaoAudiencia;
  /** sistema contract */
  agendado_em: string;
  /** pump native (mapped in API as alias) */
  agendar_em?: string | null;
  enviado_em: string | null;
  criado_por: number;
  criado_em: string | null;
};

export const NOTIFICACAO_STATUS_LABEL: Record<NotificacaoStatus, string> = {
  0: "Cancelada",
  1: "Agendada",
  2: "Enviada",
};

export const NOTIFICACAO_STATUS_COLOR: Record<NotificacaoStatus, string> = {
  0: "#757575",
  1: "#f57c00",
  2: "#2e7d32",
};

export type NotificacaoInboxItem = {
  id: number;
  id_notificacao: number;
  titulo: string;
  mensagem: string;
  foto: string | null;
  link: string | null;
  lida: boolean;
  recebida_em: string;
  lida_em: string | null;
  enviado_em: string | null;
};

export type NotificacaoDestinatario = {
  id_pessoa: number;
  nome: string;
  email: string | null;
  nivel: number;
  lida: boolean | null;
  recebida_em: string | null;
  lida_em: string | null;
};

export type NotificacaoDetail = {
  notificacao: Notificacao;
  destinatarios: NotificacaoDestinatario[];
  lidas: NotificacaoDestinatario[];
  nao_lidas: NotificacaoDestinatario[];
  previstos: boolean;
};

export const NOTIFICACAO_PRESET_TYPE = {
  pessoa_foto_updated: "pessoa_foto_updated",
  novo_login: "novo_login",
  senha_redefinida: "senha_redefinida",
} as const;

export type NotificacaoPresetType =
  (typeof NOTIFICACAO_PRESET_TYPE)[keyof typeof NOTIFICACAO_PRESET_TYPE];

export const NOTIFICACAO_PRESET_STATUS = {
  inactive: 0,
  active: 1,
} as const;

export type NotificacaoPreset = {
  id: number;
  academia_id?: number | null;
  status: number;
  type: string;
  titulo: string | null;
  mensagem: string;
  criado_por: number;
  criado_em: string | null;
  alterado_por: number;
  alterado_em: string | null;
};

export { MASTER_NIVEL_ID } from "domain/auth/constants";

export type NotificacaoEventKey = string;

export type NotificacaoEventMeta = {
  key: NotificacaoEventKey;
  label: string;
  description: string;
};

export type NotificacaoEventCategoryMeta = {
  id: string;
  label: string;
  events: NotificacaoEventMeta[];
};

export type NotificacaoEventConfig = Record<string, boolean>;

export type NotificacaoEventConfigResponse = {
  events: NotificacaoEventConfig;
  catalog: NotificacaoEventCategoryMeta[];
};
