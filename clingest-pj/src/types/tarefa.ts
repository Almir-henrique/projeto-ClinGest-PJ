export type StatusTarefa = 'EM_ANDAMENTO' | 'CONCLUIDA' | 'APROVADO';

export interface TarefaPJ {
  id: string;
  prestadorId: string;
  prestadorNome: string;
  titulo: string;
  descricao: string;
  pacienteNome?: string;
  horasTrabalhadas?: number;
  prazo: string;
  status: StatusTarefa;
  valorEntrega: number;
}