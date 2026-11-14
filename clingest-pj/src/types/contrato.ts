export interface ClientePJ {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
}

export interface ContratoPJ {
  id: string;
  prestadorId: string;
  clienteId: string;
  numeroContrato: string;
  valorHora: number;
  dataInicio: string;
  dataTermino: string;
  status: 'VIGENTE' | 'VENCIDO' | 'RESCINDIDO';
}
export interface EmpresaTenant {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  limitePrestadores: number;
  valorMensalidade: number;
  status: 'ATIVO' | 'SUSPENSO';
  criadoEm: string;
}