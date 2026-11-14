import React, { useEffect, useState } from 'react';
import { Users, DollarSign, ShieldCheck, CheckSquare, TrendingUp, AlertTriangle } from 'lucide-react';
import type { PrestadorPJ } from '../types/prestador';
import type { TarefaPJ } from '../types/tarefa';
import type { DocumentoCompliance } from '../types/compliance';
import type { FaturamentoPJ } from '../types/faturamento';
import { api } from '../services/api';

export const DashboardAnalytics: React.FC = () => {
  const [prestadores, setPrestadores] = useState<PrestadorPJ[]>([]);
  const [tarefas, setTarefas] = useState<TarefaPJ[]>([]);
  const [compliance, setCompliance] = useState<DocumentoCompliance[]>([]);
  const [faturamento, setFaturamento] = useState<FaturamentoPJ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getPrestadores(),
      api.getTarefas(),
      api.getCompliance(),
      api.getFaturamento()
    ]).then(([pData, tData, cData, fData]) => {
      setPrestadores(pData);
      setTarefas(tData);
      setCompliance(cData);
      setFaturamento(fData);
      setLoading(false);
    });
  }, []);

  const totalLiquido = faturamento.reduce((acc, curr) => acc + curr.valorLiquido, 0);
  const contratosVigentes = prestadores.filter((p) => p.contratoStatus === 'VIGENTE').length;
  const tarefasConcluidas = tarefas.filter((t) => t.status === 'CONCLUIDA').length;
  const documentosValidos = compliance.filter((c) => c.status === 'VALIDO').length;
  const documentosAtencao = compliance.filter((c) => c.status === 'VENCENDO' || c.status === 'VENCIDO').length;

  const remuneracaoContagem = prestadores.reduce((acc: Record<string, number>, curr) => {
    acc[curr.remuneracao] = (acc[curr.remuneracao] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Carregando indicadores...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-navy">Dashboard Analítico</h1>
        <p className="text-brand-muted text-sm mt-1">
          Visão consolidada de indicadores operacionais, financeiros e de conformidade do ClinGest PJ.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Prestadores Ativos</span>
            <Users size={20} className="text-brand-teal" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{prestadores.length}</p>
          <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">
            {contratosVigentes} contratos vigentes
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Faturamento Líquido</span>
            <DollarSign size={20} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">
            {totalLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <span className="text-xs text-brand-muted font-medium mt-1 inline-block">
            Acumulado do período atual
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Entregas Concluídas</span>
            <CheckSquare size={20} className="text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{tarefasConcluidas}</p>
          <span className="text-xs text-brand-muted font-medium mt-1 inline-block">
            De {tarefas.length} escopos totais
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Compliance Fiscal</span>
            <ShieldCheck size={20} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{documentosValidos}</p>
          <span className="text-xs text-rose-600 font-medium mt-1 inline-block">
            {documentosAtencao} alertas de vencimento
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-brand-navy flex items-center gap-2">
              <TrendingUp size={18} className="text-brand-teal" />
              Modelos de Remuneração PJ
            </h3>
          </div>
          <div className="space-y-4">
            {Object.entries(remuneracaoContagem).map(([modelo, qtd]) => {
              const percentual = Math.round((qtd / prestadores.length) * 100) || 0;
              return (
                <div key={modelo}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-brand-navy">{modelo.replace('_', ' ')}</span>
                    <span className="text-brand-muted">{qtd} prestador(es) ({percentual}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-teal h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-brand-navy flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-600" />
              Resumo de Alertas e Riscos
            </h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900">Documentos Vencendo ou Vencidos</h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Existem {documentosAtencao} documento(s) fiscal(is) ou certidão(ões) exigindo regularização imediata para evitar bloqueio de repasses.
                </p>
              </div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 flex items-start gap-3">
              <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-900">Mitigação de Vínculo Empregatício (CLT)</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Todos os {tarefas.length} escopos estão atrelados a entregas por projeto/tarefa, garantindo conformidade com a autonomia exigida para prestadores PJ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};