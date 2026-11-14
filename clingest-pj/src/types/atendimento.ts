export type StatusAtendimento = 'PENDENTE' | 'APROVADO' | 'REJEITADO';

export interface AtendimentoPJ {
  id: string;
  prestadorId: string;
  clienteId?: string;
  pacienteNome: string;
  dataAtendimento: string;
  horasTrabalhadas: number;
  valorHoraAplicado: number; // Congelado no momento do registro
  valorTotal: number;        // horasTrabalhadas * valorHoraAplicado
  status: StatusAtendimento;
  observacoes?: string;
}