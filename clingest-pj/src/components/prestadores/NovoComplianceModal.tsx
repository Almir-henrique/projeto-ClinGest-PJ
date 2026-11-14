import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { DocumentoCompliance, StatusDocumento } from '../../types/compliance';
import type { PrestadorPJ } from '../../types/prestador';

interface NovoComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<DocumentoCompliance, 'id'>) => void;
  prestadores: PrestadorPJ[];
}

interface ComplianceFormData {
  prestadorId: string;
  tipoDocumento: string;
  dataValidade: string;
  status: StatusDocumento;
}

export const NovoComplianceModal: React.FC<NovoComplianceModalProps> = ({ isOpen, onClose, onSubmit, prestadores }) => {
  const { register, handleSubmit, reset } = useForm<ComplianceFormData>({
    defaultValues: {
      status: 'VALIDO'
    }
  });

  if (!isOpen) return null;

  const handleFormSubmit = (data: ComplianceFormData) => {
    const prestadorSelecionado = prestadores.find((p) => p.id === data.prestadorId);
    onSubmit({
      ...data,
      prestadorNome: prestadorSelecionado ? prestadorSelecionado.nome : 'Prestador PJ'
    });
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-brand-navy">Registar Documento de Compliance</h2>
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
            <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Tipo de Documento</label>
            <input
              type="text"
              {...register('tipoDocumento', { required: true })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
              placeholder="Ex: CND Federal, Contrato Social, CRF"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Data de Validade</label>
              <input
                type="date"
                {...register('dataValidade', { required: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Status</label>
              <select
                {...register('status', { required: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
              >
                <option value="VALIDO">Válido</option>
                <option value="VENCENDO">Vencendo</option>
                <option value="VENCIDO">Vencido</option>
                <option value="PENDENTE">Pendente</option>
              </select>
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
              Salvar Documento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};