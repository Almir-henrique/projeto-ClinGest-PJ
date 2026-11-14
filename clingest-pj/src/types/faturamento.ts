export type StatusFaturamento = 'ABERTO' | 'HOMOLOGADO' | 'PENDENTE' | 'APROVADO' | 'PAGO';

export interface FaturamentoPJ {
  id: string;
  prestadorId: string;
  prestadorNome: string;
  competencia: string;
  totalHoras?: number;
  valorBruto: number;
  impostosRetidos: number;
  valorLiquido: number;
  status: StatusFaturamento;
  dataEmissao: string;
}