import React from 'react';
import {
  Building2,
  CheckCircle2,
  PauseCircle,
  KeyRound,
  Users,
  AlertTriangle,
  DollarSign,
  ArrowUpRight
} from 'lucide-react';
import type { EmpresaComMetricas, IndicadoresDashboardMaster } from '../../types/master';

interface MasterDashboardProps {
  indicadores: IndicadoresDashboardMaster;
  empresas: EmpresaComMetricas[];
  onAbrirEmpresa: (empresaId: string) => void;
  onIrParaEmpresas: () => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({
  indicadores,
  empresas,
  onAbrirEmpresa,
  onIrParaEmpresas
}) => {
  const formatarMoeda = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const taxaOcupacao =
    indicadores.totalLicencasContratadas > 0
      ? Math.round(
          (indicadores.totalLicencasUtilizadas / indicadores.totalLicencasContratadas) * 100
        )
      : 0;

  const empresasAtencao = empresas.filter((emp) => {
    const ocupacao =
      emp.metricas.licencasContratadas > 0
        ? emp.metricas.licencasUtilizadas / emp.metricas.licencasContratadas
        : 0;
    return (
      emp.status === 'SUSPENSA' ||
      emp.metricas.licencasExcedentes > 0 ||
      ocupacao >= 0.8
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Visao Executiva da Plataforma</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Indicadores consolidados de contratos, licencas PJ e receita recorrente do Clingest PJ.
          </p>
        </div>
        <button
          onClick={onIrParaEmpresas}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          Gerenciar Empresas
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Empresas Cadastradas</span>
            <Building2 size={18} className="text-slate-700" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{indicadores.totalEmpresas}</p>
          <p className="text-xs text-slate-500 mt-1.5">
            Base total de clientes B2B registrados
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Planos Ativos</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{indicadores.empresasAtivas}</p>
          <p className="text-xs text-emerald-700 mt-1.5 font-medium">
            Operando regularmente no SaaS
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Empresas Suspensas</span>
            <PauseCircle size={18} className="text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{indicadores.empresasSuspensas}</p>
          <p className="text-xs text-slate-500 mt-1.5">
            Acesso bloqueado com dados preservados
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">MRR Total Contratual</span>
            <DollarSign size={18} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatarMoeda(indicadores.mrrTotal)}</p>
          <p className="text-xs text-slate-500 mt-1.5">
            Base: {formatarMoeda(indicadores.mrrBase)} | Exced.: {formatarMoeda(indicadores.mrrExcedentes)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Licencas Contratadas</span>
            <KeyRound size={18} className="text-slate-700" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{indicadores.totalLicencasContratadas}</p>
          <p className="text-xs text-slate-500 mt-1.5">
            Capacidade total comercializada
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Licencas Utilizadas</span>
            <Users size={18} className="text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{indicadores.totalLicencasUtilizadas}</p>
          <p className="text-xs text-slate-500 mt-1.5">
            Ocupacao global de {taxaOcupacao}% (somente PJs ativos)
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Licencas Disponiveis</span>
            <CheckCircle2 size={18} className="text-slate-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{indicadores.totalLicencasDisponiveis}</p>
          <p className="text-xs text-slate-500 mt-1.5">
            Saldo livre nos contratos vigentes
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">PJs Excedentes</span>
            <AlertTriangle
              size={18}
              className={indicadores.totalExcedentes > 0 ? 'text-amber-600' : 'text-slate-400'}
            />
          </div>
          <p className="text-2xl font-bold text-slate-900">{indicadores.totalExcedentes}</p>
          <p className="text-xs text-slate-500 mt-1.5">
            Adicional gerado: {formatarMoeda(indicadores.mrrExcedentes)}/mes
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Monitoramento Contratual e Excedentes</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Empresas com planos suspensos, excedentes ativos ou ocupacao igual ou superior a 80%.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 px-6 font-semibold">Empresa</th>
                <th className="py-3 px-6 font-semibold">Plano</th>
                <th className="py-3 px-6 font-semibold">Licencas</th>
                <th className="py-3 px-6 font-semibold">Excedentes</th>
                <th className="py-3 px-6 font-semibold">Valor Mensal</th>
                <th className="py-3 px-6 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold text-right">Acao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {empresasAtencao.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 px-6 text-center text-slate-500">
                    Nenhuma empresa com alerta contratual ou excedente no momento.
                  </td>
                </tr>
              ) : (
                empresasAtencao.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900">{emp.nomeFantasia}</div>
                      <div className="text-xs text-slate-500">{emp.cnpj}</div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-700">{emp.plano}</td>
                    <td className="py-3.5 px-6 font-medium text-slate-900">
                      {emp.metricas.licencasUtilizadas}/{emp.metricas.licencasContratadas}
                    </td>
                    <td className="py-3.5 px-6">
                      {emp.metricas.licencasExcedentes > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          +{emp.metricas.licencasExcedentes} PJ
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      {formatarMoeda(emp.metricas.valorTotalMensal)}
                    </td>
                    <td className="py-3.5 px-6">
                      {emp.status === 'ATIVA' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Ativa
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          Suspensa
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => onAbrirEmpresa(emp.id)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                      >
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};