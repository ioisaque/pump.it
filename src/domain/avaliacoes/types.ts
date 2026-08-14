export const AVALIACAO_STATUS = {
  ACTIVE: "ACTIVE",
  DELETED: "DELETED",
} as const;

export type AvaliacaoMedidas = {
  peito?: number | null;
  cintura?: number | null;
  quadril?: number | null;
  braco_dir?: number | null;
  braco_esq?: number | null;
  coxa_dir?: number | null;
  coxa_esq?: number | null;
  [key: string]: number | string | null | undefined;
};

export type Avaliacao = {
  id: number;
  academia_id: number;
  id_pessoa: number;
  pessoa_nome?: string | null;
  status: string;
  data: string | null;
  peso_kg?: number | null;
  altura_cm?: number | null;
  observacoes?: string | null;
  medidas?: AvaliacaoMedidas | null;
  criado_por?: number;
  criado_em?: string | null;
  alterado_por?: number;
  alterado_em?: string | null;
};

export type AvaliacaoFormValues = {
  academia_id?: number | string;
  id_pessoa?: number | string;
  data?: string;
  peso_kg?: number | string;
  altura_cm?: number | string;
  observacoes?: string;
  peito?: number | string;
  cintura?: number | string;
  quadril?: number | string;
  braco_dir?: number | string;
  braco_esq?: number | string;
  coxa_dir?: number | string;
  coxa_esq?: number | string;
};
