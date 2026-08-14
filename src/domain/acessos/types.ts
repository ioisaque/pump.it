export const ACESSO_TIPOS = ["ENTRADA", "SAIDA"] as const;
export type AcessoTipo = (typeof ACESSO_TIPOS)[number];

export type Acesso = {
  id: number;
  academia_id: number;
  id_pessoa: number;
  pessoa_nome?: string | null;
  tipo: AcessoTipo | string;
  criado_em: string;
  origem?: string | null;
  criado_por: number;
};

export type AcessoFormValues = {
  id_pessoa: number | "";
  tipo: AcessoTipo;
  criado_em?: string;
  origem?: string;
};
