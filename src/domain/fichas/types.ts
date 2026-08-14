import { FichaPadrao } from "domain/fichas/constants";

export type FichaItem = {
  id?: number;
  id_exercicio: number;
  exercicio_nome?: string | null;
  dia: string;
  ordem: number;
  series: number;
  repeticoes: string;
  carga?: number | null;
  descanso_segundos: number;
  musculos?: { id: number; nome: string; color: string; icon: string }[];
};

export type FichaAlunoRef = {
  id: number;
  nome: string;
};

export type Ficha = {
  id: number;
  academia_id: number;
  status: string;
  nome: string;
  padrao: FichaPadrao | string;
  modelo?: boolean;
  id_origem?: number | null;
  alunos_count?: number;
  alunos?: FichaAlunoRef[];
  criado_por?: number;
  criado_em?: string | null;
  alterado_por?: number;
  alterado_em?: string | null;
  itens: FichaItem[];
};

export type FichaPayload = {
  academia_id?: number;
  id_pessoa?: number | null;
  salvar_como?: "todos" | "novo";
  status?: string;
  nome: string;
  padrao: string;
  itens?: Array<{
    id?: number;
    id_exercicio: number;
    dia: string;
    ordem?: number;
    series?: number;
    repeticoes: string;
    carga?: number | null;
    descanso_segundos?: number;
  }>;
};
