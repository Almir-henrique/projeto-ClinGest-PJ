import React, { useState } from 'react';
import { DollarSign, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';
import { dbServicePagamentos } from '../services/db';
import { useToast } from '../context/ToastContext';

export const PainelPagamentos: React.FC = () => {
  const [pagamentos, setPagamentos] = useState(dbServicePagamentos.getPagamentos());
  const { showToast } = useToast();

  const handleQuitar = (id: string) => {
    const codigo = `PIX-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const atualizados = dbServicePagamentos.quitarPagamento(id, codigo);
    setPagamentos(atualizados);
    showToast('Pagamento quitado e registrado com comprovante', 'success');
  };

  const totalQuitado = pagamentos
    .filter(p => p.status === 'QUITADO')
    .reduce((acc, curr) => acc + curr.valorLiquido, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            Controle Financeiro
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Pagamentos a Prestadores PJ</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Acompanhamento de valores quitados, pendentes e comprovantes de transferência bancária/PIX.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase font-semibold">Total Pago no Período</p>
          <p className="text-xl font-bold text-emerald-600 mt-0.5">
            {totalQuitado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CreditCard size={18} className="text-brand-teal" />
          Ordens de Pagamento e Transferências
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 px-4 font-semibold">Competência</th>
                <th className="py-3 px-4 font-semibold">Prestador PJ</th>
                <th className="py-3 px-4 font-semibold">Valor Líquido</th>
                <th className="py-3 px-4 font-semibold">Data Pagamento</th>
                <th className="py-3 px-4 font-semibold">Comprovante / PIX</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {pagamentos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Nenhum pagamento registrado.
                  </td>
                </tr>
              ) : (
                pagamentos.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{p.competencia}</td>
                    <td className="py-3 px-4 text-slate-700">{p.prestadorNome}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">
                      {p.valorLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{p.dataPagamento || 'Pendente'}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">{p.comprovanteCodigo}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        p.status === 'QUITADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status === 'PENDENTE' && (
                        <button
                          onClick={() => handleQuitar(p.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={14} />
                          Quitar Pagamento
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