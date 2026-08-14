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
};

export type Ficha = {
  id: number;
  academia_id: number;
  id_pessoa?: number | null;
  status: string;
  nome: string;
  padrao: FichaPadrao | string;
  criado_por?: number;
  criado_em?: string | null;
  alterado_por?: number;
  alterado_em?: string | null;
  itens: FichaItem[];
};

export type FichaPayload = {
  academia_id?: number;
  id_pessoa?: number | null;
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
