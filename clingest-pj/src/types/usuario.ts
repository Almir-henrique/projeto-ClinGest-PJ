export type PerfilAcesso = 'MASTER' | 'GESTOR' | 'PRESTADOR';

export interface UsuarioSistema {
  id: string;
  empresaId?: string; // Vinculo com a empresa contratante (multi-tenant)
  empresaNome?: string;
  nome: string;
  email: string;
  usuario: string;
  senha?: string;
  perfil: PerfilAcesso;
  prestadorId?: string; // Vinculo caso seja perfil PRESTADOR
  ativo: boolean;
  exigirTrocaSenha?: boolean;
  criadoEm: string;
}