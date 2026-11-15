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
import {
  LogOut,
  Users,
  CheckSquare,
  Building,
  DollarSign,
  CreditCard,
  BarChart3
} from 'lucide-react';

export function App() {
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioSistema | null>(null);
  const [prestadorObj, setPrestadorObj] = useState<PrestadorPJ | undefined>(undefined);
  const [abaAtiva, setAbaAtiva] = useState<string>('painel');

  const handleLoginSuccess = (usuario: UsuarioSistema) => {
    setUsuarioLogado(usuario);

    if (usuario.perfil === 'PRESTADOR') {
      const prestadores = dbService.getPrestadores();
      const encontrado = prestadores.find(
        (item) =>
          (usuario.prestadorId && item.id === usuario.prestadorId) ||
          item.email.toLowerCase() === usuario.email.toLowerCase()
      );

      if (encontrado) {
        setPrestadorObj(encontrado);
      } else {
        setPrestadorObj({
          id: usuario.prestadorId || usuario.id,
          empresaId: usuario.empresaId,
          nome: usuario.nome,
          razaoSocial: `${usuario.nome} Servicos Medicos LTDA`,
          cnpj: '00.000.000/0001-00',
          email: usuario.email,
          servico: 'Atendimento Clinico PJ',
          remuneracao: 'POR_HORA',
          valorBase: 0,
          contratoStatus: 'VIGENTE',
          situacao: usuario.ativo ? 'ATIVO' : 'INATIVO',
          usuario: usuario.usuario,
          criadoEm: usuario.criadoEm
        });
      }

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
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-base leading-tight">
                    {usuarioLogado.empresaNome || 'ClinGest PJ'}
                  </h1>
                  {usuarioLogado.empresaNome && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                      ClinGest PJ
                    </span>
                  )}
                </div>
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
                    Gestao & Equipe PJ
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
                    Relatorios
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
                title="Encerrar Sessao"
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
          {abaAtiva === 'gestor' && <PainelGestor usuarioLogado={usuarioLogado} />}
          {abaAtiva === 'faturamento' && (
            <PainelFaturamento usuarioLogado={usuarioLogado} />
          )}
          {abaAtiva === 'pagamentos' && (
            <PainelPagamentos usuarioLogado={usuarioLogado} />
          )}
          {abaAtiva === 'relatorios' && (
            <PainelRelatorios usuarioLogado={usuarioLogado} />
          )}
          {abaAtiva === 'prestador' && prestadorObj && (
            <PortalPrestador prestadorLogado={prestadorObj} />
          )}
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;