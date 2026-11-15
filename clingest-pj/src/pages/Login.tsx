import React, { useState } from 'react';
import { Shield, User, Key, Building2, Eye, EyeOff } from 'lucide-react';
import { dbService } from '../services/db';
import { masterService } from '../services/masterService';
import { useToast } from '../context/ToastContext';
import type { UsuarioSistema } from '../types/usuario';

interface LoginProps {
  onLoginSuccess: (usuario: UsuarioSistema) => void;
}

const SENHAS_PADRAO_SISTEMA: Record<string, string> = {
  Henrique_dev: '1234',
  gestor: '123',
  'mariana.costa': '123'
};

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const { showToast } = useToast();

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (carregando) return;

    const identificador = usuario.trim();
    if (!identificador || !senha) {
      showToast('Preencha o usuario e a senha de acesso.', 'error');
      return;
    }

    setCarregando(true);

    try {
      // 1. Verifica acesso MASTER
      const usuariosSistema = dbService.getUsuarios();
      const contaMaster = usuariosSistema.find(
        (item) =>
          item.perfil === 'MASTER' &&
          (item.usuario.toLowerCase() === identificador.toLowerCase() ||
            item.email.toLowerCase() === identificador.toLowerCase())
      );

      if (contaMaster) {
        if (!contaMaster.ativo) {
          showToast('Conta Master desativada.', 'error');
          return;
        }
        const senhaEsperada =
          contaMaster.senha || SENHAS_PADRAO_SISTEMA[contaMaster.usuario];
        if (senha !== senhaEsperada) {
          showToast('Usuario ou senha invalidos.', 'error');
          return;
        }
        showToast('Acesso Master realizado com sucesso.', 'success');
        onLoginSuccess(contaMaster);
        return;
      }

      // 2. Valida empresas, gestores e prestadores cadastrados na Area Master
      const validacaoMaster = masterService.validarAutenticacaoUsuario(
        identificador,
        senha
      );

      if (validacaoMaster.permitido && validacaoMaster.usuario) {
        const conta = validacaoMaster.usuario;
        masterService.registrarLoginUsuario(conta.id);

        const usuarioLogado: UsuarioSistema = {
          id: conta.id,
          empresaId: conta.empresaId,
          empresaNome: conta.empresaNome,
          nome: conta.nome,
          email: conta.email,
          usuario: conta.usuario || conta.email.split('@')[0],
          senha: conta.senha,
          perfil: conta.perfil === 'PJ' ? 'PRESTADOR' : conta.perfil,
          prestadorId: conta.perfil === 'PJ' ? conta.id : undefined,
          ativo: conta.status === 'ATIVO',
          exigirTrocaSenha: conta.exigirTrocaSenha,
          criadoEm: conta.dataCriacao
        };

        showToast(`Bem-vindo(a), ${usuarioLogado.nome}!`, 'success');
        onLoginSuccess(usuarioLogado);
        return;
      }

      // Se a empresa estiver suspensa ou conta bloqueada, exibe o motivo exato
      if (validacaoMaster.usuario && validacaoMaster.motivo) {
        showToast(validacaoMaster.motivo, 'error');
        return;
      }

      // 3. Fallback para contas locais legadas do dbService
      const usuarioLegado = usuariosSistema.find(
        (item) =>
          item.usuario.toLowerCase() === identificador.toLowerCase() ||
          item.email.toLowerCase() === identificador.toLowerCase()
      );

      if (!usuarioLegado) {
        showToast('Usuario ou senha invalidos.', 'error');
        return;
      }

      if (!usuarioLegado.ativo) {
        showToast('Usuario inativo. Contate o administrador.', 'error');
        return;
      }

      const senhaLegadaValida =
        (usuarioLegado.senha || SENHAS_PADRAO_SISTEMA[usuarioLegado.usuario]) === senha;

      if (!senhaLegadaValida) {
        showToast('Usuario ou senha invalidos.', 'error');
        return;
      }

      showToast('Login realizado com sucesso.', 'success');
      onLoginSuccess(usuarioLegado);
    } catch {
      showToast('Nao foi possivel realizar a autenticacao.', 'error');
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
            Plataforma de Gestao e Compliance em Saude
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Usuario ou E-mail
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User size={18} />
              </span>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Digite seu usuario ou e-mail"
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
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-teal"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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