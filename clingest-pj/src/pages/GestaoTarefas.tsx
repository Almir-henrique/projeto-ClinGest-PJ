import React, { useEffect, useState } from 'react';
import { Clock, CheckSquare, CheckCircle2, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import type { TarefaPJ, StatusTarefa } from '../types/tarefa';
import { useToast } from '../context/ToastContext';

export const GestaoTarefas: React.FC = () => {
  const [tarefas, setTarefas] = useState<TarefaPJ[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const carregarTarefas = async () => {
    try {
      const data = await api.getTarefas();
      setTarefas(data);
    } catch {
      showToast('Erro ao carregar apontamentos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTarefas();
  }, []);

  const handleAtualizarStatus = async (id: string, status: StatusTarefa) => {
    try {
      const atualizadas = await api.atualizarStatusTarefa(id, status);
      setTarefas(atualizadas);
      showToast(`Apontamento atualizado para ${status}`, 'success');
      api.registrarAuditLog('APROVACAO_APONTAMENTO', 'Gestor/Master', `Apontamento ${id} marcado como ${status}`);
    } catch {
      showToast('Erro ao atualizar apontamento', 'error');
    }
  };

  const handleExcluir = async (id: string) => {
    try {
      const atualizadas = await api.excluirTarefa(id);
      setTarefas(atualizadas);
      showToast('Apontamento removido com sucesso', 'success');
    } catch {
      showToast('Erro ao remover apontamento', 'error');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Carregando apontamentos de horas...</div>;
  }

  const totalHorasGeral = tarefas.reduce((acc, curr) => acc + (curr.horasTrabalhadas || 0), 0);
  const totalValorGeral = tarefas.reduce((acc, curr) => acc + curr.valorEntrega, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Gestão de Apontamentos e Horas por Prestador</h1>
          <p className="text-brand-muted text-sm mt-0.5">
            Monitoramento de plantões, atendimento a pacientes e validação de horas trabalhadas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total de Horas Apontadas</span>
            <Clock size={20} className="text-brand-teal" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{totalHorasGeral} h</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Volume Financeiro Consolidado</span>
            <CheckSquare size={20} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {totalValorGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-brand-navy mb-4 flex items-center gap-2">
          <CheckSquare size={18} className="text-brand-teal" />
          Relatório Consolidado de Apontamentos por Profissional e Paciente
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-brand-muted">
                <th className="py-3 px-4 font-semibold">Profissional PJ</th>
                <th className="py-3 px-4 font-semibold">Serviço / Plantão</th>
                <th className="py-3 px-4 font-semibold">Paciente Atendido</th>
                <th className="py-3 px-4 font-semibold">Horas</th>
                <th className="py-3 px-4 font-semibold">Valor Total</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {tarefas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-muted">
                    Nenhum apontamento registrado.
                  </td>
                </tr>
              ) : (
                tarefas.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-brand-navy">{t.prestadorNome}</td>
                    <td className="py-3 px-4 text-brand-muted">{t.titulo}</td>
                    <td className="py-3 px-4 text-brand-muted font-medium">{t.pacienteNome || 'N/A'}</td>
                    <td className="py-3 px-4 font-semibold text-brand-navy">{t.horasTrabalhadas || 0} h</td>
                    <td className="py-3 px-4 font-semibold text-brand-teal">
                      {t.valorEntrega.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {t.status === 'EM_ANDAMENTO' && (
                        <button
                          onClick={() => handleAtualizarStatus(t.id, 'APROVADO')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Aprovar Apontamento"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleExcluir(t.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
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