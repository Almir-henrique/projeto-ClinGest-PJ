import React from 'react';
import { BarChart3, FileSpreadsheet, Shield, Download, CheckCircle2 } from 'lucide-react';
import { dbService } from '../services/db';
import { dbServiceFaturamento } from '../services/db';
import { dbServicePagamentos } from '../services/db';
import { useToast } from '../context/ToastContext';

export const PainelRelatorios: React.FC = () => {
  const atendimentos = dbService.getAtendimentos();
  const faturamentos = dbServiceFaturamento.getFaturamentos();
  const pagamentos = dbServicePagamentos.getPagamentos();
  const prestadores = dbService.getPrestadores();
  const { showToast } = useToast();

  const handleExportarCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Prestador,Horas,Valor Total,Status"]
        .concat(atendimentos.map(a => `${a.pacienteNome},${a.horasTrabalhadas},${a.valorTotal},${a.status}`))
        .join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_atendimentos_clingest.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório CSV exportado com sucesso', 'success');
  };

  const totalHorasGeral = atendimentos.reduce((acc, curr) => acc + curr.horasTrabalhadas, 0);
  const totalBrutoGeral = atendimentos.reduce((acc, curr) => acc + curr.valorTotal, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200 mb-2">
            Inteligência e Governança
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Relatórios Operacionais e Financeiros</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Consolidação de dados de atendimentos, faturamento, pagamentos e auditoria da plataforma.
          </p>
        </div>
        <button
          onClick={handleExportarCSV}
          className="px-4 py-2.5 bg-brand-teal hover:bg-teal-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
        >
          <Download size={16} />
          Exportar Dados (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total de Atendimentos</span>
            <BarChart3 size={20} className="text-brand-teal" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{atendimentos.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total de Horas Registradas</span>
            <FileSpreadsheet size={20} className="text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalHorasGeral} h</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Volume Financeiro Geral</span>
            <Shield size={20} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {totalBrutoGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-brand-teal" />
          Resumo Consolidado por Prestador PJ
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 px-4 font-semibold">Profissional</th>
                <th className="py-3 px-4 font-semibold">CNPJ</th>
                <th className="py-3 px-4 font-semibold">Serviço</th>
                <th className="py-3 px-4 font-semibold">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {prestadores.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">{p.nome}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-xs">{p.cnpj}</td>
                  <td className="py-3 px-4 text-slate-700">{p.servico}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                      {p.situacao}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};