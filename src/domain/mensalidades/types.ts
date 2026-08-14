export const MENSALIDADE_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

export type MensalidadeStatus = (typeof MENSALIDADE_STATUS)[keyof typeof MENSALIDADE_STATUS];

export type Mensalidade = {
  id: number;
  academia_id: number;
  id_pessoa: number;
  status: string;
  competencia: string;
  valor: number;
  vencimento: string;
  pago_em?: string | null;
  pessoa_nome?: string;
  pessoa_email?: string | null;
  pessoa_cpf_cnpj?: string | null;
  criado_em?: string;
  alterado_em?: string | null;
};

export const MENSALIDADE_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Paga",
  OVERDUE: "Vencida",
  CANCELLED: "Cancelada",
  REFUNDED: "Estornada",
};
