export type PerfilAcesso = 'MASTER' | 'GESTOR' | 'PRESTADOR';

export interface UsuarioSistema {
  id: string;
  nome: string;
  email: string;
  usuario: string;
  perfil: PerfilAcesso;
  prestadorId?: string; // Vinculo caso seja perfil PRESTADOR
  ativo: boolean;
  criadoEm: string;
}