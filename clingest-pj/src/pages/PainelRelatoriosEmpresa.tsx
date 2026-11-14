import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Download, Users, Clock, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import type { PrestadorPJ } from '../types/prestador';
import type { TarefaPJ } from '../types/tarefa';

export const PainelRelatoriosEmpresa: React.FC = () => {
  const [prestadores, setPrestadores] = useState<PrestadorPJ[]>([]);
  const [tarefas, setTarefas] = useState<TarefaPJ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getPrestadores(),
      api.getTarefas()
    ]).then(([pData, tData]) => {
      setPrestadores(pData);
      setTarefas(tData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Carregando relatórios consolidados da empresa...</div>;
  }

  // Cálculos consolidados da empresa
  const totalHorasEquipe = tarefas.reduce((acc, curr) => acc + (curr.horasTrabalhadas || 0), 0);
  const custoTotalEquipe = tarefas.reduce((acc, curr) => acc + (curr.valorEntrega || 0), 0);
  const totalProfissionaisAtivos = prestadores.length;

  // Função para exportar dados consolidados em CSV (visão da empresa)
  const exportarCSVEmpresa = () => {
    const cabecalho = 'ID,Profissional,Servico,Paciente,Horas,ValorTotal,Status,Data\n';
    const linhas = tarefas.map(t => 
      `"${t.id}","${t.prestadorNome}","${t.titulo}","${t.pacienteNome || 'N/A'}","${t.horasTrabalhadas}","${t.valorEntrega}","${t.status}","${t.prazo}"`
    ).join('\n');

    const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_consolidado_empresa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans bg-slate-50 min-h-screen">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            Área Administrativa e Faturamento
          </span>
          <h1 className="text-2xl font-bold text-slate-800">Resumo Consolidado da Clínica</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Acompanhamento financeiro global, produção de horas da equipe e exportação de relatórios
          </p>
        </div>
        <button
          onClick={exportarCSVEmpresa}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition shadow-sm font-medium text-sm"
        >
          <Download size={18} /> Exportar Relatório Global (CSV)
        </button>
      </div>

      {/* Cards de Métricas Consolidadas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Custo Total / Faturamento Equipe</span>
            <DollarSign size={20} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {custoTotalEquipe.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total de Horas Trabalhadas</span>
            <Clock size={20} className="text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{totalHorasEquipe} h</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Profissionais Vinculados</span>
            <Users size={20} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{totalProfissionaisAtivos}</p>
        </div>
      </div>

      {/* Tabela de Resumo Produtivo por Prestador */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FileText size={18} className="text-indigo-600" />
          Consolidado de Atendimentos por Funcionário / Prestador
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 px-4 font-semibold">Profissional</th>
                <th className="py-3 px-4 font-semibold">Especialidade</th>
                <th className="py-3 px-4 font-semibold">CNPJ</th>
                <th className="py-3 px-4 font-semibold">Valor Hora</th>
                <th className="py-3 px-4 font-semibold">Total Acumulado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {prestadores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    Nenhum profissional cadastrado na clínica.
                  </td>
                </tr>
              ) : (
                prestadores.map((p) => {
                  const tarefasDoPrestador = tarefas.filter(t => t.prestadorId === p.id);
                  const totalHorasP = tarefasDoPrestador.reduce((acc, curr) => acc + (curr.horasTrabalhadas || 0), 0);
                  const valorTotalP = totalHorasP * p.valorBase;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800">{p.nome}</td>
                      <td className="py-3 px-4 text-slate-500">{p.servico}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-xs">{p.cnpj}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {p.valorBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / h
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600">
                        {valorTotalP.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};