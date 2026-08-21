import { ANAMNESE_PARQ, ParqAnswer } from "domain/anamneses/constants";

export type AnamneseRespostas = {
  dataAvaliacao: string;
  profissional: string;
  profissao: string;
  emergenciaNome: string;
  emergenciaTel: string;
  emergenciaParentesco: string;
  objetivos: string[];
  objetivoOutro: string;
  objetivoExplique: string;
  metaEspecifica: string;
  prazoEvento: string;
  motivacao: number;
  praticaAtividade: string;
  quaisAtividades: string;
  tempoPratica: string;
  frequenciaSemana: string;
  duracaoSessao: string;
  ultimoTreino: string;
  frequentouAcademia: string;
  experienciaMusculacao: string;
  gosta: string;
  naoGosta: string;
  doencaRelevante: string;
  doencaRelevanteQual: string;
  hipertensao: string;
  diabetes: string;
  colesterol: string;
  cardiaca: string;
  respiratoria: string;
  respiratoriaQual: string;
  musculo: string;
  musculoQual: string;
  sintomas: string[];
  sintomaOutro: string;
  sintomasAtuais: string;
  interrompeu: string;
  interrompeuExplique: string;
  orientacaoMedica: string;
  orientacaoQual: string;
  familiar: string[];
  familiarOutro: string;
  familiarJovem: string;
  familiarObs: string;
  medicamento: string;
  medicamentoQuais: string;
  suplemento: string;
  suplementoQuais: string;
  preTreino: string;
  preTreinoQual: string;
  prescrito: string;
  dorAtual: string;
  dorItens: Array<{ id_musculo: number; intensidade: string; tempo: string }>;
  lesao: string;
  lesaoQual: string;
  lesaoQuando: string;
  lesaoRecuperado: string;
  cirurgia: string;
  cirurgiaQual: string;
  limitacao: string;
  limitacaoQual: string;
  sonoHoras: string;
  sonoQualidade: string;
  acordaDescansado: string;
  cansacoDiurno: string;
  rotina: string;
  rotinaOutro: string;
  horasSentado: string;
  diasTreino: string;
  minutosSessao: string;
  diasHorarios: string;
  atividadeExtra: string;
  alimentacao: string;
  nutricionista: string;
  dieta: string;
  dietaQual: string;
  alergia: string;
  aguaLitros: string;
  fuma: string;
  alcool: string;
  alcoolFreq: string;
  energeticos: string;
  habitosOutros: string;
  esperaProfissional: string;
  exercicioAprender: string;
  exercicioEvitar: string;
  preocupacaoAcademia: string;
  dificuldadeRegularidade: string;
  parq: Array<ParqAnswer | "">;
  parqDetalhe: string[];
  nivelTreino: string;
  liberacaoSaude: string;
  restricoes: string;
  objetivosDefinidos: string;
  freqPlanejada: string;
  obsProfissional: string;
  declaracao: boolean;
  declaracaoData: string;
};

export function emptyAnamneseRespostas(): AnamneseRespostas {
  return {
    dataAvaliacao: "",
    profissional: "",
    profissao: "",
    emergenciaNome: "",
    emergenciaTel: "",
    emergenciaParentesco: "",
    objetivos: [],
    objetivoOutro: "",
    objetivoExplique: "",
    metaEspecifica: "",
    prazoEvento: "",
    motivacao: 5,
    praticaAtividade: "",
    quaisAtividades: "",
    tempoPratica: "",
    frequenciaSemana: "",
    duracaoSessao: "",
    ultimoTreino: "",
    frequentouAcademia: "",
    experienciaMusculacao: "",
    gosta: "",
    naoGosta: "",
    doencaRelevante: "",
    doencaRelevanteQual: "",
    hipertensao: "",
    diabetes: "",
    colesterol: "",
    cardiaca: "",
    respiratoria: "",
    respiratoriaQual: "",
    musculo: "",
    musculoQual: "",
    sintomas: [],
    sintomaOutro: "",
    sintomasAtuais: "",
    interrompeu: "",
    interrompeuExplique: "",
    orientacaoMedica: "",
    orientacaoQual: "",
    familiar: [],
    familiarOutro: "",
    familiarJovem: "",
    familiarObs: "",
    medicamento: "",
    medicamentoQuais: "",
    suplemento: "",
    suplementoQuais: "",
    preTreino: "",
    preTreinoQual: "",
    prescrito: "",
    dorAtual: "",
    dorItens: [],
    lesao: "",
    lesaoQual: "",
    lesaoQuando: "",
    lesaoRecuperado: "",
    cirurgia: "",
    cirurgiaQual: "",
    limitacao: "",
    limitacaoQual: "",
    sonoHoras: "",
    sonoQualidade: "",
    acordaDescansado: "",
    cansacoDiurno: "",
    rotina: "",
    rotinaOutro: "",
    horasSentado: "",
    diasTreino: "",
    minutosSessao: "",
    diasHorarios: "",
    atividadeExtra: "",
    alimentacao: "",
    nutricionista: "",
    dieta: "",
    dietaQual: "",
    alergia: "",
    aguaLitros: "",
    fuma: "",
    alcool: "",
    alcoolFreq: "",
    energeticos: "",
    habitosOutros: "",
    esperaProfissional: "",
    exercicioAprender: "",
    exercicioEvitar: "",
    preocupacaoAcademia: "",
    dificuldadeRegularidade: "",
    parq: ANAMNESE_PARQ.map(() => ""),
    parqDetalhe: ANAMNESE_PARQ.map(() => ""),
    nivelTreino: "",
    liberacaoSaude: "",
    restricoes: "",
    objetivosDefinidos: "",
    freqPlanejada: "",
    obsProfissional: "",
    declaracao: false,
    declaracaoData: "",
  };
}

export type Anamnese = {
  id: number;
  id_pessoa: number;
  parq: ParqAnswer[];
  historico_medico: string | null;
  dores_lesoes: string | null;
  objetivos: string | null;
  respostas: AnamneseRespostas | null;
  respondido_em: string | null;
  criado_em: string;
  alterado_em: string | null;
};

export type AnamneseBody = {
  id_pessoa?: number;
  parq: Array<ParqAnswer | "">;
  respostas: AnamneseRespostas;
  finalizar?: boolean;
};
