export const PESSOA_STATUS = {
  DELETED: "DELETED",
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
} as const;

/**
 * Catálogo `id_pessoas_niveis` (espelho isaque / sync-pessoas-tabelas-from-isaque):
 * - 1  Aluno
 * - 4  Atendente
 * - 5  Personal
 * - 6  Gestor
 * - 8  App
 * - 9  Admin
 * - 10 Master
 *
 * Aluno: nivel <= ALUNO_NIVEL_MAX.
 * Staff: nivel >= FUNCIONARIO_NIVEL_MIN.
 */
export const PESSOA_NIVEL = {
  ALUNO: 1,
  ATENDENTE: 4,
  PERSONAL: 5,
  GESTOR: 6,
  APP: 8,
  ADMIN: 9,
  MASTER: 10,
} as const;

export const ALUNO_NIVEL_MAX = 1;
export const FUNCIONARIO_NIVEL_MIN = 4;

/** Filtro de listagem (UPPERCASE). Default na UI: ALL. */
export const PESSOA_LIST_TIPO = {
  FUNCIONARIO: "FUNCIONARIO",
  ALUNO: "ALUNO",
  ALL: "ALL",
} as const;

export type PessoaListTipo = (typeof PESSOA_LIST_TIPO)[keyof typeof PESSOA_LIST_TIPO];
