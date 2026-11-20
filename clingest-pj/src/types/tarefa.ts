export type StatusTarefa = 'PENDENTE' | 'APROVADO' | 'PAGO' | 'REJEITADO';

export interface TarefaPJ {
  id: string;
  empresaId: string;
  prestadorId: string;
  prestadorNome: string;
  titulo: string;
  descricao?: string;
  pacienteNome?: string;
  horasTrabalhadas: number;
  valorUnitario: number;
  valorEntrega: number;
  status: StatusTarefa;
  prazo: string;
  dataPagamento?: string;
}