export type TipoRemuneracao = 'POR_HORA' | 'FIXO' | 'MISTO';
export type StatusContrato = 'VIGENTE' | 'VENCENDO' | 'RESCINDIDO';
export type SituacaoPrestador = 'ATIVO' | 'INATIVO';

export interface PrestadorPJ {
  id: string;
  empresaId?: string; 
  nome: string;
  razaoSocial: string;
  cnpj: string;
  email: string;
  servico: string;
  remuneracao: TipoRemuneracao;
  valorBase: number;
  contratoStatus: StatusContrato;
  situacao: SituacaoPrestador;
  usuario?: string;
  senha?: string;
  criadoEm: string;
}