export type PerfilAcesso = 'MASTER' | 'GESTOR' | 'PRESTADOR';

export interface UsuarioSistema {
  id: string;
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilAcesso;
  empresaId?: string;
  empresaNome?: string;
}

export interface CredencialMasterView {
  id: string;
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilAcesso;
  empresaId: string;
  empresaNome: string;
  ativo: boolean;
}

export interface RegistroMovimentacaoAcesso {
  id: string;
  usuarioNome: string;
  usuarioEmail: string;
  perfil: PerfilAcesso;
  empresaNome: string;
  tipo: 'ENTRADA' | 'SAIDA';
  dataHora: string;
}