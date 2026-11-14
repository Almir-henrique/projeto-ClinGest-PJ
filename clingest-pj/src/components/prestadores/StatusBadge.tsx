import React from 'react';
import type { StatusContrato, SituacaoPrestador } from '../../types/prestador';

interface StatusBadgeProps {
  status: StatusContrato | SituacaoPrestador;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    VIGENTE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ATIVO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    VENCENDO: 'bg-amber-50 text-amber-700 border-amber-200',
    PENDENTE: 'bg-amber-50 text-amber-700 border-amber-200',
    RESCINDIDO: 'bg-rose-50 text-rose-700 border-rose-200',
    INATIVO: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  const labels: Record<string, string> = {
    VIGENTE: 'Vigente',
    ATIVO: 'Ativo',
    VENCENDO: 'Vencendo',
    PENDENTE: 'Pendente',
    RESCINDIDO: 'Rescindido',
    INATIVO: 'Inativo'
  };

  const currentStyle = styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  const currentLabel = labels[status] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}>
      {currentLabel}
    </span>
  );
};