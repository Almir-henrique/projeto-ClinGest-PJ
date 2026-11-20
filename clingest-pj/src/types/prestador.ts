import type { ModalidadeContrato } from './contrato';

export interface PrestadorPJ {
  id: string;
  empresaId: string;
  nome: string;
  razaoSocial: string;
  cnpj: string;
  email: string;
  senha: string;
  servico: string;
  remuneracao: ModalidadeContrato;
  valorBase: number;
  contratoStatus: 'VIGENTE' | 'ENCERRADO';
  situacao: 'ATIVO' | 'INATIVO';
  dataEntrada: string;
  dataSaida?: string;
  criadoEm: string;
}