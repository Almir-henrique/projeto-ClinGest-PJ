export type ModalidadeContrato = 'POR_HORA' | 'PLANTAO' | 'MENSAL';

export interface RegraNegocioSaaS {
  bloquearExcessoLicencas: boolean;
  valorAdicionalLicenca: number;
  exigirAprovacaoEntrega: boolean;
  permitirContratoHora: boolean;
  permitirContratoPlantao: boolean;
  permitirContratoMensal: boolean;
  limitePadraoLicencas: number;
  mensalidadePadrao: number;
}

export interface EmpresaTenant {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  limitePrestadores: number;
  valorMensalidade: number;
  status: 'ATIVO' | 'SUSPENSO';
  responsavelNome: string;
  responsavelEmail: string;
  senhaGestor: string;
  criadoEm: string;
}

export interface ContratoPJ {
  id: string;
  prestadorId: string;
  prestadorNome?: string;
  numeroContrato: string;
  dataInicio: string;
  dataTermino: string;
  valorMensal?: number;
  valorHora?: number;
  status: 'VIGENTE' | 'VENCENDO' | 'RESCINDIDO';
}