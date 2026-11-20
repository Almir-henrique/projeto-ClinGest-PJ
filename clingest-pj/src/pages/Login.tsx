import { useState, type FC, type FormEvent } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, Building2, Briefcase } from 'lucide-react';
import type { UsuarioSistema } from '../types/usuario';
import { apiAuth } from '../services/api';

interface LoginProps {
  onLogin: (usuario: UsuarioSistema) => void;
}

export const Login: FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErro('');

    const resultado = apiAuth.login(email, senha);
    if (!resultado.ok || !resultado.usuario) {
      setErro(resultado.erro || 'Não foi possível entrar.');
      return;
    }

    onLogin(resultado.usuario);
  };

  const preencherDemo = (emailDemo: string, senhaDemo: string) => {
    setEmail(emailDemo);
    setSenha(senhaDemo);
    setErro('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div className="space-y-1.5">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600">
            Clingest PJ
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Acesso ao Sistema</h1>
          <p className="text-sm text-slate-500">
            Entre com seu e-mail e senha para acessar seu painel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@empresa.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {erro && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {erro}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl transition cursor-pointer"
          >
            Entrar
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Acessos de Demonstração
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => preencherDemo('henrique@clingest.com', '123456')}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-xs font-medium text-slate-700 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-slate-800" />
              Master
            </button>

            <button
              type="button"
              onClick={() => preencherDemo('gestor@saolucas.com.br', '123456')}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-medium text-slate-700 transition cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
              Clínica
            </button>

            <button
              type="button"
              onClick={() => preencherDemo('mariana.costa@clinica.com', '123')}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-xs font-medium text-slate-700 transition cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-emerald-600" />
              PJ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};