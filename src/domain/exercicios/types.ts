export type ExercicioAnexo = {
  id: number;
  id_exercicio: number;
  tipo: string;
  caminho: string;
  ordem?: number;
  criado_em?: string | Date | null;
};

export type Exercicio = {
  id: number;
  academia_id: number;
  status: string;
  nome: string;
  descricao: string | null;
  carga_inicial?: number | null;
  capa?: { tipo: string; caminho: string } | null;
  criado_por?: number;
  criado_em?: string | Date | null;
  alterado_por?: number;
  alterado_em?: string | Date | null;
  anexos?: ExercicioAnexo[];
  musculos?: { id: number; nome: string; color: string; icon: string }[];
};

export type ExercicioFormData = {
  nome: string;
  descricao?: string;
  carga_inicial?: string | null;
  status?: string;
  musculos_ids?: number[];
};
