import React, { useState } from 'react';
import { CheckSquare, Users, FileText, DollarSign, CheckCircle2, Clock } from 'lucide-react';
import { dbService } from '../services/db';
import { useToast } from '../context/ToastContext';

export const PainelGestor: React.FC = () => {
  const [atendimentos, setAtendimentos] = useState(dbService.getAtendimentos());
  const prestadores = dbService.getPrestadores();
  const contratos = dbService.getContratos();
  const { showToast } = useToast();

  const handleAprovar = (id: string) => {
    const atualizados = dbService.atualizarStatusAtendimento(id, 'APROVADO');
    setAtendimentos(atualizados);
    showToast('Atendimento aprovado com sucesso', 'success');
  };

  const totalHorasAprovadas = atendimentos
    .filter(a => a.status === 'APROVADO')
    .reduce((acc, curr) => acc + curr.horasTrabalhadas, 0);

  const valorTotalDevido = atendimentos
    .filter(a => a.status === 'APROVADO')
    .reduce((acc, curr) => acc + curr.valorTotal, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200 mb-2">
            Visão Operacional / Gestor
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Painel de Gestão e Aprovação de Atendimentos</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Acompanhamento de plantões, horas trabalhadas e fechamento financeiro dos prestadores.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Prestadores Ativos</span>
            <Users size={20} className="text-brand-teal" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{prestadores.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Horas Aprovadas</span>
            <Clock size={20} className="text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalHorasAprovadas} h</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Valor Devido Consolidado</span>
            <DollarSign size={20} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {valorTotalDevido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CheckSquare size={18} className="text-brand-teal" />
          Atendimentos Registrados para Validação
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 px-4 font-semibold">Data</th>
                <th className="py-3 px-4 font-semibold">Paciente</th>
                <th className="py-3 px-4 font-semibold">Horas</th>
                <th className="py-3 px-4 font-semibold">Valor/Hora</th>
                <th className="py-3 px-4 font-semibold">Total a Pagar</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {atendimentos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Nenhum atendimento registrado.
                  </td>
                </tr>
              ) : (
                atendimentos.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500">{a.dataAtendimento}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{a.pacienteNome}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{a.horasTrabalhadas} h</td>
                    <td className="py-3 px-4 text-slate-500">
                      {a.valorHoraAplicado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">
                      {a.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        a.status === 'APROVADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {a.status === 'PENDENTE' && (
                        <button
                          onClick={() => handleAprovar(a.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={14} />
                          Aprovar
                        </button>
                      )}
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