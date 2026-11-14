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