
import React, { useState } from 'react';
import { Shield, User, Key, Building2 } from 'lucide-react';
import { dbService } from '../services/db';
import { useToast } from '../context/ToastContext';
import type { UsuarioSistema } from '../types/usuario';

interface LoginProps {
  onLoginSuccess: (usuario: UsuarioSistema) => void;
}

const CREDENCIAIS_TESTE: Record<string, string> = {
  Henrique_dev: '1234',
  gestor: '123',
  'mariana.costa': '123'
};

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { showToast } = useToast();

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (carregando) return;

    setCarregando(true);

    try {
      const usuarios = dbService.getUsuarios();
      const usuarioEncontrado = usuarios.find(
        (item) =>
          (item.usuario.toLowerCase() === usuario.trim().toLowerCase() ||
            item.email.toLowerCase() === usuario.trim().toLowerCase()) &&
          item.ativo
      );

      if (!usuarioEncontrado) {
        showToast('Usuário ou senha inválidos.', 'error');
        return;
      }

      const senhaValida =
        CREDENCIAIS_TESTE[usuarioEncontrado.usuario] === senha;

      if (!senhaValida) {
        showToast('Usuário ou senha inválidos.', 'error');
        return;
      }

      if (
        usuarioEncontrado.perfil === 'PRESTADOR' &&
        usuarioEncontrado.prestadorId
      ) {
        const prestadorExiste = dbService
          .getPrestadores()
          .some((item) => item.id === usuarioEncontrado.prestadorId);

        if (!prestadorExiste) {
          showToast('Prestador vinculado não encontrado.', 'error');
          return;
        }
      }

      showToast('Login realizado com sucesso.', 'success');
      onLoginSuccess(usuarioEncontrado);
    } catch {
      showToast('Não foi possível realizar a autenticação.', 'error');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-brand-navy p-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/10 text-brand-teal mb-4 border border-teal-500/20">
            <Building2 size={32} />
          </div>
          <h1 className="text-2xl font-bold">ClinGest PJ</h1>
          <p className="text-slate-300 text-sm mt-1">
            Plataforma de Gestão e Compliance em Saúde
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Usuário ou E-mail
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User size={18} />
              </span>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Digite seu usuário ou e-mail"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-teal"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Senha de Acesso
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Key size={18} />
              </span>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-teal"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-3 bg-brand-teal hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Shield size={18} />
            {carregando ? 'Autenticando...' : 'Acessar Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
};
