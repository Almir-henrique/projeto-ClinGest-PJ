import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { PrestadorPJ, TipoRemuneracao, StatusContrato, SituacaoPrestador } from '../../types/prestador';

interface NovoPrestadorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<PrestadorPJ, 'id' | 'criadoEm'>) => void;
}

interface PrestadorFormData {
  nome: string;
  razaoSocial: string;
  cnpj: string;
  email: string;
  servico: string;
  remuneracao: TipoRemuneracao;
  valorBase: number;
  contratoStatus: StatusContrato;
  situacao: SituacaoPrestador;
  usuario: string;
  senha: string;
}

export const NovoPrestadorModal: React.FC<NovoPrestadorModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { register, handleSubmit, reset } = useForm<PrestadorFormData>({
    defaultValues: {
      remuneracao: 'POR_HORA',
      contratoStatus: 'VIGENTE',
      situacao: 'ATIVO'
    }
  });

  if (!isOpen) return null;

  const handleFormSubmit = (data: PrestadorFormData) => {
    onSubmit({
      ...data,
      valorBase: Number(data.valorBase)
    });
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-brand-navy">Cadastrar Novo Prestador PJ</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Nome do Profissional</label>
              <input
                type="text"
                {...register('nome', { required: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                placeholder="Ex: Dra. Mariana Costa"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Razão Social da Empresa PJ</label>
              <input
                type="text"
                {...register('razaoSocial', { required: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                placeholder="Ex: Costa Odontologia S/S"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">CNPJ</label>
              <input
                type="text"
                {...register('cnpj', { required: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                placeholder="00.000.000/0001-00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">E-mail de Contato</label>
              <input
                type="email"
                {...register('email', { required: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                placeholder="email@empresa.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Serviço Prestado</label>
              <input
                type="text"
                {...register('servico', { required: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                placeholder="Ex: Odontologia / Radiologia"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Modelo de Remuneração</label>
              <select
                {...register('remuneracao', { required: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
              >
                <option value="POR_HORA">Por Hora / Plantão</option>
                <option value="FIXO">Fixo Mensal</option>
                <option value="MISTO">Misto</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Valor Base (R$ / Hora)</label>
              <input
                type="number"
                step="0.01"
                {...register('valorBase', { required: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Status Contrato</label>
              <select
                {...register('contratoStatus', { required: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
              >
                <option value="VIGENTE">Vigente</option>
                <option value="VENCENDO">Vencendo</option>
                <option value="RESCINDIDO">Rescindido</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Situação</label>
              <select
                {...register('situacao', { required: true })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase text-brand-navy tracking-wider">Credenciais de Acesso do Portal PJ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Nome de Usuário / Código</label>
                <input
                  type="text"
                  {...register('usuario', { required: true })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                  placeholder="Ex: mariana.costa"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Senha de Acesso</label>
                <input
                  type="text"
                  {...register('senha', { required: true })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                  placeholder="Ex: senha123"
                />
              </div>
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
              Salvar e Gerar Credenciais
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};