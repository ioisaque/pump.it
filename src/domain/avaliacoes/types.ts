export const AVALIACAO_STATUS = {
  ACTIVE: "ACTIVE",
  DELETED: "DELETED",
} as const;

export type AvaliacaoMedidas = {
  peito?: number | null;
  cintura?: number | null;
  abdomen?: number | null;
  quadril?: number | null;
  pescoco?: number | null;
  ombro?: number | null;
  braco_dir?: number | null;
  braco_esq?: number | null;
  braco_dir_contr?: number | null;
  braco_esq_contr?: number | null;
  antebraco_dir?: number | null;
  antebraco_esq?: number | null;
  coxa_dir?: number | null;
  coxa_esq?: number | null;
  panturrilha_dir?: number | null;
  panturrilha_esq?: number | null;
  dobra_tricipital?: number | null;
  dobra_subescapular?: number | null;
  dobra_abdominal?: number | null;
  dobra_suprailiaca?: number | null;
  dobra_coxa?: number | null;
  dobra_peitoral?: number | null;
  dobra_axilar?: number | null;
  dobra_bicipital?: number | null;
  dobra_perna?: number | null;
  gordura_objetivo_pct?: number | null;
  protocolo?: string | null;
  risco_coronariano?: string | null;
  [key: string]: number | string | null | undefined;
};

export type Avaliacao = {
  id: number;
  academia_id: number;
  id_pessoa: number;
  pessoa_nome?: string | null;
  pessoa_data_nasc?: string | null;
  pessoa_anatomia_genero?: string | null;
  avaliador_nome?: string | null;
  ordinal?: number | null;
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
  abdomen?: number | string;
  quadril?: number | string;
  pescoco?: number | string;
  ombro?: number | string;
  braco_dir?: number | string;
  braco_esq?: number | string;
  braco_dir_contr?: number | string;
  braco_esq_contr?: number | string;
  antebraco_dir?: number | string;
  antebraco_esq?: number | string;
  coxa_dir?: number | string;
  coxa_esq?: number | string;
  panturrilha_dir?: number | string;
  panturrilha_esq?: number | string;
  dobra_tricipital?: number | string;
  dobra_subescapular?: number | string;
  dobra_abdominal?: number | string;
  dobra_suprailiaca?: number | string;
  dobra_coxa?: number | string;
  dobra_peitoral?: number | string;
  dobra_axilar?: number | string;
  dobra_bicipital?: number | string;
  dobra_perna?: number | string;
  gordura_objetivo_pct?: number | string;
  protocolo?: string;
  risco_coronariano?: string;
};

export const MEDIDA_KEYS = [
  "peito",
  "cintura",
  "abdomen",
  "quadril",
  "pescoco",
  "ombro",
  "braco_dir",
  "braco_esq",
  "braco_dir_contr",
  "braco_esq_contr",
  "antebraco_dir",
  "antebraco_esq",
  "coxa_dir",
  "coxa_esq",
  "panturrilha_dir",
  "panturrilha_esq",
  "dobra_tricipital",
  "dobra_subescapular",
  "dobra_abdominal",
  "dobra_suprailiaca",
  "dobra_coxa",
  "dobra_peitoral",
  "dobra_axilar",
  "dobra_bicipital",
  "dobra_perna",
  "gordura_objetivo_pct",
] as const;

export const MEDIDA_TEXT_KEYS = ["protocolo", "risco_coronariano"] as const;
