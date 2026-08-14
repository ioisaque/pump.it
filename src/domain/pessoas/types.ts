import { DeviceInfo } from "domain/shared/types";
import { AuditableFlag, Flag } from "domain/tabelas/types";

export type Pessoa = {
  id: number;
  academia_id?: number;
  cpf_cnpj?: string | null;
  status?: number | string | Flag | null;
  nivel?: number | AuditableFlag | null;
  origem?: number | AuditableFlag | null;
  etiqueta?: number | AuditableFlag | null;
  nome: string;
  pin?: string | null;
  email?: string | null;
  data_nasc?: string | null;
  contato?: string | null;
  instagram?: string | null;
  foto?: string | null;
  ip?: string | null;
  device?: string | null;
  visto_em?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  criado_por?: number;
  criado_em?: string;
  alterado_por?: number;
  alterado_em?: string | null;
  logradouro?: string | null;
  numero?: number | null;
  cep?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  complemento?: string | null;
};

/** HTTP row from `pessoas/:id` and `pessoas` list. */
export type PessoaDetail = Pessoa & {
  device?: DeviceInfo | null;
};
