import { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { Login } from './pages/Login';
import { PainelMaster } from './pages/PainelMaster';
import { PainelGestor } from './pages/PainelGestor';
import { PortalPrestador } from './pages/PortalPrestador';
import { PainelFaturamento } from './pages/PainelFaturamento';
import { PainelPagamentos } from './pages/PainelPagamentos';
import { PainelRelatorios } from './pages/PainelRelatorios';
import { dbService } from './services/db';
import type { UsuarioSistema } from './types/usuario';
import type { PrestadorPJ } from './types/prestador';
import { LogOut, Users, CheckSquare, Building, DollarSign, CreditCard, BarChart3 } from 'lucide-react';

export function App() {
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioSistema | null>(null);
  const [prestadorObj, setPrestadorObj] = useState<PrestadorPJ | undefined>(undefined);
  const [abaAtiva, setAbaAtiva] = useState<string>('painel');

  const handleLoginSuccess = (usuario: UsuarioSistema) => {
    setUsuarioLogado(usuario);
    if (usuario.perfil === 'PRESTADOR' && usuario.prestadorId) {
      const prestadores = dbService.getPrestadores();
      const p = prestadores.find(item => item.id === usuario.prestadorId);
      setPrestadorObj(p);
      setAbaAtiva('prestador');
    } else if (usuario.perfil === 'MASTER') {
      setAbaAtiva('master');
    } else {
      setAbaAtiva('gestor');
    }
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    setPrestadorObj(undefined);
    setAbaAtiva('painel');
  };

  if (!usuarioLogado) {
    return (
      <ToastProvider>
        <Login onLoginSuccess={handleLoginSuccess} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        {usuarioLogado.perfil !== 'MASTER' && (
          <header className="bg-slate-900 border-b border-slate-800 text-white px-8 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20 text-brand-teal">
                <Building size={20} />
              </div>
              <div>
                <h1 className="font-bold text-base leading-tight">ClinGest PJ</h1>
                <p className="text-xs text-slate-400">
                  Perfil de Acesso:{' '}
                  <span className="text-brand-teal uppercase font-semibold">
                    {usuarioLogado.perfil}
                  </span>
                </p>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              {usuarioLogado.perfil === 'GESTOR' && (
                <>
                  <button
                    onClick={() => setAbaAtiva('gestor')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      abaAtiva === 'gestor'
                        ? 'bg-brand-teal text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <CheckSquare size={14} />
                    Atendimentos
                  </button>
                  <button
                    onClick={() => setAbaAtiva('faturamento')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      abaAtiva === 'faturamento'
                        ? 'bg-brand-teal text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <DollarSign size={14} />
                    Faturamento
                  </button>
                  <button
                    onClick={() => setAbaAtiva('pagamentos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      abaAtiva === 'pagamentos'
                        ? 'bg-brand-teal text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <CreditCard size={14} />
                    Pagamentos
                  </button>
                  <button
                    onClick={() => setAbaAtiva('relatorios')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      abaAtiva === 'relatorios'
                        ? 'bg-brand-teal text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <BarChart3 size={14} />
                    Relatórios
                  </button>
                </>
              )}

              {usuarioLogado.perfil === 'PRESTADOR' && (
                <button
                  onClick={() => setAbaAtiva('prestador')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    abaAtiva === 'prestador'
                      ? 'bg-brand-teal text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Users size={14} />
                  Meu Portal PJ
                </button>
              )}
            </nav>

            <div className="flex items-center gap-4 pl-4 border-l border-slate-700">
              <div className="text-right">
                <p className="text-xs font-medium text-white">{usuarioLogado.nome}</p>
                <p className="text-[10px] text-slate-400">{usuarioLogado.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Encerrar Sessão"
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>
        )}

        <main className="flex-1">
          {abaAtiva === 'master' && (
            <PainelMaster
              usuarioNome={usuarioLogado.nome}
              usuarioEmail={usuarioLogado.email}
              onLogout={handleLogout}
            />
          )}
          {abaAtiva === 'gestor' && <PainelGestor />}
          {abaAtiva === 'faturamento' && <PainelFaturamento />}
          {abaAtiva === 'pagamentos' && <PainelPagamentos />}
          {abaAtiva === 'relatorios' && <PainelRelatorios />}
          {abaAtiva === 'prestador' && prestadorObj && (
            <PortalPrestador prestadorLogado={prestadorObj} />
          )}
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;