export type IntegracaoContaSummary = {
  sincronizada: boolean;
  id?: number;
  nome?: string;
};

export type IntegracaoContaCampo =
  | "banco"
  | "agencia"
  | "conta"
  | "digito"
  | "tipo_conta"
  | "chave_pix"
  | "cod_pix"
  | "saldo_inicial"
  | "saldo_atual";

export type IntegracaoContaInfo = {
  provider: string;
  providerNome: string;
  refExterna: string;
  camposBloqueados: IntegracaoContaCampo[];
};

export type IntegracaoContaFinanceiraResult = {
  id: number;
  nome: string;
  criada: boolean;
  atualizada: boolean;
  refExterna: string;
  camposBloqueados?: IntegracaoContaCampo[];
};

export type IntegracoesRefs = {
  asaas: string | null;
  mercadopago: string | null;
};

export type EntidadeAudit = {
  total: number;
  sincronizados: number;
  pendentes: number;
  idsPendentes: string[];
  fantasmas: number;
  pendencias?: Array<{ id: string; motivo: "sem_vinculo" | "ambiguo" | "faturas_pendentes" }>;
};

export type SyncAuditResult = {
  provider: string;
  pessoas: EntidadeAudit;
  faturas: EntidadeAudit;
  /** Wire key da API (legado); UI exibe como Contratos. */
  contratos: EntidadeAudit;
};

export type IntegracaoProviderSummary = {
  id: string;
  nome: string;
  ambiente: string;
  configurado: boolean;
  setupConcluido: boolean;
  ultimoErro: string | null;
  runtime: {
    isLocalDev: boolean;
    webhookDisponivel: boolean;
    asaasApiBase?: string;
    apiBase?: string;
    webhookUrl: string | null;
  };
  resumo: {
    total: number;
    sincronizados: number;
    pendentes: number;
    pessoas: EntidadeAudit;
    faturas: EntidadeAudit;
    /** Wire key da API (legado); UI exibe como Contratos. */
    contratos: EntidadeAudit;
  };
  contaFinanceira: IntegracaoContaSummary;
};

export type AsaasPaymentFees = {
  boleto: {
    valor: number;
    promocional: number | null;
    promocionalValidade: string | null;
    diasRecebimento: number;
  } | null;
  credito: {
    taxaOperacao: number;
    avista: number;
    ate6x: number;
    ate12x: number;
    ate21x: number;
    promocional: {
      avista: number | null;
      ate6x: number | null;
      ate12x: number | null;
      ate21x: number | null;
      validade: string | null;
    };
    diasRecebimento: number;
  } | null;
  debito: {
    taxaOperacao: number;
    percentual: number;
    diasRecebimento: number;
  } | null;
  pix: {
    taxaFixa: number | null;
    taxaFixaPromocional: number | null;
    percentual: number | null;
    minimo: number | null;
    maximo: number | null;
    promocionalValidade: string | null;
    recebimentosGratisMes: number;
    recebidosMesAtual: number;
  } | null;
};

export type AsaasConfigPublic = {
  ambiente: "sandbox" | "producao";
  apiKey: string;
  apiKeyPreenchida: boolean;
  syncPessoas: boolean;
  syncFaturas: boolean;
  transferenciasAutomaticas: boolean;
  saqueValidacaoConfirmada: boolean;
  emailAlertasSaque?: string | null;
  webhook: {
    habilitado: boolean;
    configurado: boolean;
    id: string | null;
    url: string | null;
    authTokenPreenchido?: boolean;
  };
  setupConcluido: boolean;
  ultimoErro: string | null;
  runtime: IntegracaoProviderSummary["runtime"];
  contaFinanceira: IntegracaoContaSummary;
};

export type MercadoPagoPaymentFees = {
  fonte: "historico" | "indisponivel";
  pix: {
    percentual: number | null;
    diasRecebimento: number;
    amostras: number;
  } | null;
  boleto: {
    percentual: number | null;
    diasRecebimento: number;
    amostras: number;
  } | null;
  credito: {
    avista: number | null;
    ate6x: number | null;
    ate12x: number | null;
    diasRecebimento: number;
    amostras: number;
  } | null;
  debito: {
    percentual: number | null;
    diasRecebimento: number;
    amostras: number;
  } | null;
};

export type MercadoPagoConfigPublic = {
  ambiente: "sandbox" | "producao";
  accessToken: string;
  publicKey: string;
  accessTokenPreenchido: boolean;
  publicKeyPreenchida: boolean;
  syncPessoas: boolean;
  syncFaturas: boolean;
  transferenciasAutomaticas: boolean;
  webhook: {
    habilitado: boolean;
    configurado: boolean;
    url: string | null;
  };
  setupConcluido: boolean;
  ultimoErro: string | null;
  runtime: IntegracaoProviderSummary["runtime"];
  contaFinanceira: IntegracaoContaSummary;
};

export type NotifyConfigPublic = {
  apiKey: string;
  apiKeyPreenchida: boolean;
  notifyUrl: string | null;
  webhook: {
    configurado: boolean;
    url: string | null;
  };
  setupConcluido: boolean;
  ultimoErro: string | null;
  runtime: IntegracaoProviderSummary["runtime"];
};

export type ReconcilePruneResult = {
  /** Keys alinhadas à API. */
  removidos: { pessoa: number; fatura: number; contrato: number };
  erros: Array<{ ref: string; entidade: string; message: string }>;
};

export type ReconcileJob = {
  id: string;
  provider: string;
  status: "pending" | "running" | "done" | "error";
  strict: boolean;
  entidadeAtual: "pessoa" | "fatura" | "contrato" | "prune" | "conta" | null;
  done: number;
  total: number;
  prune: ReconcilePruneResult | null;
  porEntidade: Record<
    "pessoa" | "fatura" | "contrato",
    { done: number; total: number; erros: Array<{ id: string; message: string }> }
  >;
  concluidoEm: string | null;
};
