export type StatusDocumento = 'VALIDO' | 'VENCENDO' | 'VENCIDO' | 'PENDENTE';

export interface DocumentoCompliance {
  id: string;
  prestadorId: string;
  prestadorNome: string;
  tipoDocumento: string;
  dataValidade: string;
  status: StatusDocumento;
}