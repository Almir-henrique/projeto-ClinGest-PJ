import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { FaturamentoPJ, StatusFaturamento } from '../../types/faturamento';
import type { PrestadorPJ } from '../../types/prestador';

interface NovoFaturamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<FaturamentoPJ, 'id' | 'valorLiquido'>) => void;
  prestadores: PrestadorPJ[];
}

interface FaturamentoFormData {
  prestadorId: string;
  competencia: string;
  valorBruto: number;
  impostosRetidos: number;
  status: StatusFaturamento;
  dataEmissao: string;
}

export const NovoFaturamentoModal: React.FC<NovoFaturamentoModalProps> = ({ isOpen, onClose, onSubmit, prestadores }) => {
  const { register, handleSubmit, reset } = useForm<FaturamentoFormData>({
    defaultValues: {
      status: 'PENDENTE',
      competencia: '10/2026',
      dataEmissao: new Date().toISOString().split('T')[0]
    }
  });

  if (!isOpen) return null;

  const handleFormSubmit = (data: FaturamentoFormData) => {
    const prestadorSelecionado = prestadores.find((p) => p.id === data.prestadorId);
    onSubmit({
      prestadorId: data.prestadorId,
      prestadorNome: prestadorSelecionado ? prestadorSelecionado.nome : 'Prestador PJ',
      competencia: data.competencia,
      valorBruto: Number(data.valorBruto),
      impostosRetidos: Number(data.impostosRetidos),
      status: data.status,
      dataEmissao: data.dataEmissao
    });
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-brand-navy">Registar Faturamento / NF</h2>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Competência</label>
              <input
                type="text"
                {...register('competencia', { required: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                placeholder="Ex: 10/2026"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Data Emissão NF</label>
              <input
                type="date"
                {...register('dataEmissao', { required: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Valor Bruto (R$)</label>
              <input
                type="number"
                step="0.01"
                {...register('valorBruto', { required: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Impostos Retidos (R$)</label>
              <input
                type="number"
                step="0.01"
                {...register('impostosRetidos', { required: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Status Inicial</label>
            <select
              {...register('status', { required: true })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
            >
              <option value="ABERTO">Aberto</option>
              <option value="HOMOLOGADO">Homologado</option>
              <option value="PENDENTE">Pendente</option>
              <option value="APROVADO">Aprovado</option>
              <option value="PAGO">Pago</option>
            </select>
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
              Salvar Faturamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};