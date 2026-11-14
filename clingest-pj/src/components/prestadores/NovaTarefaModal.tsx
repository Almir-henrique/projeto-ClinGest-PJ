import React from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { X } from 'lucide-react';
import type { TarefaPJ, StatusTarefa } from '../../types/tarefa';
import type { PrestadorPJ } from '../../types/prestador';

interface NovaTarefaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<TarefaPJ, 'id'>) => void;
  prestadores: PrestadorPJ[];
}

interface TarefaFormData {
  prestadorId: string;
  titulo: string;
  descricao: string;
  prazo: string;
  status: StatusTarefa;
  valorEntrega: number;
}

export const NovaTarefaModal: React.FC<NovaTarefaModalProps> = ({ isOpen, onClose, onSubmit, prestadores }) => {
  const { register, handleSubmit, reset } = useForm<TarefaFormData>({
    defaultValues: {
      status: 'EM_ANDAMENTO',
      valorEntrega: 1000
    }
  });

  if (!isOpen) return null;

  const handleFormSubmit: SubmitHandler<TarefaFormData> = (data) => {
    const prestadorSelecionado = prestadores.find((p) => p.id === data.prestadorId);
    onSubmit({
      ...data,
      prestadorNome: prestadorSelecionado ? prestadorSelecionado.nome : 'Prestador PJ',
      valorEntrega: Number(data.valorEntrega)
    });
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-brand-navy">Cadastrar Nova Entrega / Escopo</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Prestador PJ</label>
            <select
              {...register('prestadorId', { required: true })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
            >
              <option value="">Selecione o prestador...</option>
              {prestadores.map((p) => (
                <option key={p.id} value={p.id}>{p.nome} - {p.servico}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Título da Entrega</label>
            <input
              type="text"
              {...register('titulo', { required: true })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
              placeholder="Ex: Plantão Cirúrgico - Bloco B"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Descrição do Escopo</label>
            <textarea
              {...register('descricao', { required: true })}
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
              placeholder="Detalhes dos procedimentos ou entregas contratadas..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Prazo Limite</label>
              <input
                type="date"
                {...register('prazo', { required: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Valor da Entrega (R$)</label>
              <input
                type="number"
                step="0.01"
                {...register('valorEntrega', { required: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-brand-muted hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-teal text-white rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors shadow-sm"
            >
              Salvar Entrega
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};