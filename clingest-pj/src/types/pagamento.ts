export type StatusPagamento = 'PENDENTE' | 'PROCESSAMENTO' | 'QUITADO';

export interface PagamentoPJ {
  id: string;
  prestadorId: string;
  prestadorNome: string;
  competencia: string;
  valorLiquido: number;
  dataPagamento?: string;
  status: StatusPagamento;
  comprovanteCodigo: string;
}