import React, { useState } from 'react';
import { DollarSign, FileText, CheckCircle2, Plus } from 'lucide-react';
import { dbService } from '../services/db';
import { dbServiceFaturamento } from '../services/db';
import { useToast } from '../context/ToastContext';

export const PainelFaturamento: React.FC = () => {
  const [faturamentos, setFaturamentos] = useState(dbServiceFaturamento.getFaturamentos());
  const prestadores = dbService.getPrestadores();
  const [prestadorId, setPrestadorId] = useState('');
  const [competencia, setCompetencia] = useState('');
  const { showToast } = useToast();

  const handleGerarFechamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prestadorId || !competencia) {
      showToast('Selecione o prestador e informe a competência', 'error');
      return;
    }
    const atualizados = dbServiceFaturamento.gerarFechamentoMensal(prestadorId, competencia);
    setFaturamentos(atualizados);
    setPrestadorId('');
    setCompetencia('');
    showToast('Fechamento mensal gerado com sucesso', 'success');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            Módulo Financeiro
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Fechamento Mensal e Faturamento PJ</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Consolidação de horas trabalhadas, apuração de tributos retidos e cálculo do valor líquido.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-1">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-brand-teal" />
            Gerar Fechamento por Competência
          </h2>
          <form onSubmit={handleGerarFechamento} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Prestador PJ</label>
              <select
                value={prestadorId}
                onChange={(e) => setPrestadorId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-brand-teal"
                required
              >
                <option value="">Selecione o profissional...</option>
                {prestadores.map(p => (
                  <option key={p.id} value={p.id}>{p.nome} ({p.servico})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Competência (MM/AAAA)</label>
              <input
                type="text"
                value={competencia}
                onChange={(e) => setCompetencia(e.target.value)}
                placeholder="Ex: 10/2026"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-brand-teal"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-brand-teal hover:bg-teal-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <DollarSign size={16} />
              Calcular Fechamento Mensal
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-brand-teal" />
            Histórico de Faturamento e Fechamentos
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-3 px-4 font-semibold">Competência</th>
                  <th className="py-3 px-4 font-semibold">Prestador</th>
                  <th className="py-3 px-4 font-semibold">Horas</th>
                  <th className="py-3 px-4 font-semibold">Bruto</th>
                  <th className="py-3 px-4 font-semibold">Impostos</th>
                  <th className="py-3 px-4 font-semibold">Líquido</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {faturamentos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Nenhum fechamento registrado.
                    </td>
                  </tr>
                ) : (
                  faturamentos.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{f.competencia}</td>
                      <td className="py-3 px-4 text-slate-700">{f.prestadorNome}</td>
                      <td className="py-3 px-4 text-slate-900">{f.totalHoras} h</td>
                      <td className="py-3 px-4 text-slate-700">
                        {f.valorBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-3 px-4 text-rose-600">
                        -{f.impostosRetidos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600">
                        {f.valorLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};