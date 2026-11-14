import React, { useCallback, useEffect, useState } from 'react';
import { LayoutDashboard, Building2, ShieldCheck, ShieldAlert, LogOut } from 'lucide-react';
import { masterService } from '../services/masterService';
import type { EmpresaComMetricas, IndicadoresDashboardMaster } from '../types/master';
import { MasterDashboard } from '../components/master/MasterDashboard';
import { MasterEmpresasList } from '../components/master/MasterEmpresasList';
import { MasterEmpresaDetalhes } from '../components/master/MasterEmpresaDetalhes';
import { MasterAuditoria } from '../components/master/MasterAuditoria';

type SecaoMaster = 'dashboard' | 'empresas' | 'detalhes' | 'auditoria';

interface PainelMasterProps {
  usuarioNome?: string;
  usuarioEmail?: string;
  onLogout?: () => void;
}

export const PainelMaster: React.FC<PainelMasterProps> = ({
  usuarioNome = 'Proprietario SaaS',
  usuarioEmail,
  onLogout
}) => {
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoMaster>('dashboard');
  const [empresaSelecionadaId, setEmpresaSelecionadaId] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<EmpresaComMetricas[]>([]);
  const [indicadores, setIndicadores] = useState<IndicadoresDashboardMaster>({
    totalEmpresas: 0,
    empresasAtivas: 0,
    empresasSuspensas: 0,
    totalLicencasContratadas: 0,
    totalLicencasUtilizadas: 0,
    totalLicencasDisponiveis: 0,
    totalExcedentes: 0,
    mrrBase: 0,
    mrrExcedentes: 0,
    mrrTotal: 0
  });

  const carregarDadosMaster = useCallback(() => {
    const listaEmpresas = masterService.getEmpresasComMetricas();
    const dadosIndicadores = masterService.getIndicadoresDashboard();
    setEmpresas(listaEmpresas);
    setIndicadores(dadosIndicadores);
  }, []);

  useEffect(() => {
    carregarDadosMaster();
  }, [carregarDadosMaster]);

  const handleAbrirEmpresa = (empresaId: string) => {
    setEmpresaSelecionadaId(empresaId);
    setSecaoAtiva('detalhes');
  };

  const tituloTopbar: Record<SecaoMaster, string> = {
    dashboard: 'Dashboard Geral',
    empresas: 'Empresas Contratantes',
    detalhes: 'Detalhes da Empresa e Contrato',
    auditoria: 'Auditoria e Seguranca'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-900">
      <aside className="w-full lg:w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Clingest PJ
          </span>
          <h1 className="text-lg font-bold text-white mt-0.5">Master Admin</h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <button
            type="button"
            onClick={() => setSecaoAtiva('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              secaoAtiva === 'dashboard'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setSecaoAtiva('empresas')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              secaoAtiva === 'empresas' || secaoAtiva === 'detalhes'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Building2 size={18} />
            <span>Empresas</span>
          </button>

          <button
            type="button"
            onClick={() => setSecaoAtiva('auditoria')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              secaoAtiva === 'auditoria'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldAlert size={18} />
            <span>Auditoria</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
          Governanca SaaS B2B
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Administracao Central
            </p>
            <h2 className="text-base font-bold text-slate-900">{tituloTopbar[secaoAtiva]}</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <ShieldCheck size={16} className="text-indigo-600 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-700 leading-tight">
                  {usuarioNome}
                </p>
                {usuarioEmail && (
                  <p className="text-[10px] text-slate-500 leading-tight">{usuarioEmail}</p>
                )}
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                title="Encerrar Sessao"
              >
                <LogOut size={14} />
                <span>Sair</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {secaoAtiva === 'dashboard' && (
            <MasterDashboard
              indicadores={indicadores}
              empresas={empresas}
              onAbrirEmpresa={handleAbrirEmpresa}
              onIrParaEmpresas={() => setSecaoAtiva('empresas')}
            />
          )}

          {secaoAtiva === 'empresas' && (
            <MasterEmpresasList
              empresas={empresas}
              onAbrirEmpresa={handleAbrirEmpresa}
              onEmpresaCadastrada={carregarDadosMaster}
            />
          )}

          {secaoAtiva === 'detalhes' && empresaSelecionadaId && (
            <MasterEmpresaDetalhes
              empresaId={empresaSelecionadaId}
              onVoltar={() => setSecaoAtiva('empresas')}
              onDadosAtualizados={carregarDadosMaster}
            />
          )}

          {secaoAtiva === 'auditoria' && (
            <MasterAuditoria onSelecionarEmpresa={handleAbrirEmpresa} />
          )}
        </main>
      </div>
    </div>
  );
};