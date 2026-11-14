import React, { useEffect, useState } from 'react';
import { DollarSign, FileText, CheckCircle2, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import type { NotaFiscalPJ } from '../services/api';
import type { FaturamentoPJ, StatusFaturamento } from '../types/faturamento';
import type { PrestadorPJ } from '../types/prestador';
import { useToast } from '../context/ToastContext';

export const GestaoFaturamento: React.FC = () => {
  const [faturamentoList, setFaturamentoList] = useState<FaturamentoPJ[]>([]);
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscalPJ[]>([]);
  const [prestadores, setPrestadores] = useState<PrestadorPJ[]>([]);
  const [loading, setLoading] = useState(true);

  const [prestadorIdModal, setPrestadorIdModal] = useState('');
  const [competenciaModal, setCompetenciaModal] = useState('');
  const [valorBrutoModal, setValorBrutoModal] = useState('');
  const [impostosModal, setImpostosModal] = useState('');

  const { showToast } = useToast();

  const carregarDados = async () => {
    try {
      const [fData, nData, pData] = await Promise.all([
        api.getFaturamento(),
        api.getNotasFiscais(),
        api.getPrestadores()
      ]);
      setFaturamentoList(fData);
      setNotasFiscais(nData);
      setPrestadores(pData);
      if (pData.length > 0) {
        setPrestadorIdModal(pData[0].id);
      }
    } catch {
      showToast('Erro ao carregar dados de faturamento', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSalvarFaturamento = async (e: React.FormEvent) => {
    e.preventDefault();
    const prestadorSelecionado = prestadores.find((p) => p.id === prestadorIdModal);
    if (!prestadorSelecionado) return;

    try {
      const bruto = Number(valorBrutoModal) || 0;
      const retido = Number(impostosModal) || 0;
      const liquido = bruto - retido;

      const atualizado = await api.salvarFaturamento({
        prestadorId: prestadorSelecionado.id,
        prestadorNome: prestadorSelecionado.nome,
        competencia: competenciaModal,
        valorBruto: bruto,
        impostosRetidos: retido,
        valorLiquido: liquido,
        status: 'PENDENTE',
        dataEmissao: new Date().toISOString().split('T')[0]
      });

      setFaturamentoList(atualizado);
      setCompetenciaModal('');
      setValorBrutoModal('');
      setImpostosModal('');
      showToast('Lançamento financeiro registrado com sucesso', 'success');
      api.registrarAuditLog('LANCAMENTO_FINANCEIRO', 'Administrador', `Faturamento gerado para ${prestadorSelecionado.nome} Comp: ${competenciaModal}`);
    } catch {
      showToast('Erro ao registrar faturamento', 'error');
    }
  };

  const handleAtualizarStatus = async (id: string, status: StatusFaturamento) => {
    try {
      const atualizado = await api.atualizarStatusFaturamento(id, status);
      setFaturamentoList(atualizado);
      showToast(`Status do pagamento alterado para ${status}`, 'success');
    } catch {
      showToast('Erro ao atualizar status', 'error');
    }
  };

  const handleExcluirFaturamento = async (id: string) => {
    try {
      const atualizado = await api.excluirFaturamento(id);
      setFaturamentoList(atualizado);
      showToast('Registro financeiro removido com sucesso', 'success');
    } catch {
      showToast('Erro ao remover registro', 'error');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Carregando faturamento e notas fiscais...</div>;
  }

  const totalBrutoGeral = faturamentoList.reduce((acc, curr) => acc + curr.valorBruto, 0);
  const totalRetidoGeral = faturamentoList.reduce((acc, curr) => acc + curr.impostosRetidos, 0);
  const totalLiquidoGeral = faturamentoList.reduce((acc, curr) => acc + curr.valorLiquido, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APROVADO':
      case 'PAGO':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDENTE':
      case 'ABERTO':
      case 'HOMOLOGADO':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CANCELADO':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Faturamento, Retenções e Notas Fiscais</h1>
          <p className="text-brand-muted text-sm mt-0.5">
            Gestão de ordens de pagamento, retenção de tributos federais/municipais e homologação de NFS-e.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Volume Bruto Consolidado</span>
            <DollarSign size={20} className="text-brand-teal" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">
            {totalBrutoGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Impostos Retidos na Fonte</span>
            <ShieldAlert size={20} className="text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-600">
            -{totalRetidoGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Líquido a Pagar</span>
            <DollarSign size={20} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {totalLiquidoGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit">
          <h2 className="text-base font-bold text-brand-navy mb-4 flex items-center gap-2">
            <FileText size={18} className="text-brand-teal" />
            Novo Lançamento Financeiro
          </h2>
          <form onSubmit={handleSalvarFaturamento} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Prestador PJ</label>
              <select
                value={prestadorIdModal}
                onChange={(e) => setPrestadorIdModal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                required
              >
                {prestadores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} ({p.servico})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Competência</label>
              <input
                type="text"
                value={competenciaModal}
                onChange={(e) => setCompetenciaModal(e.target.value)}
                placeholder="Ex: 10/2026"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Valor Bruto (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorBrutoModal}
                  onChange={(e) => setValorBrutoModal(e.target.value)}
                  placeholder="8500.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Impostos Retidos (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={impostosModal}
                  onChange={(e) => setImpostosModal(e.target.value)}
                  placeholder="425.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-brand-teal hover:bg-teal-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Gerar Lançamento Financeiro
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-brand-navy mb-4 flex items-center gap-2">
            <FileText size={18} className="text-sky-600" />
            Notas Fiscais de Serviço Enviadas pelos Prestadores (NFS-e)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-brand-muted">
                  <th className="py-3 px-4 font-semibold">Competência</th>
                  <th className="py-3 px-4 font-semibold">Nº NF</th>
                  <th className="py-3 px-4 font-semibold">Valor</th>
                  <th className="py-3 px-4 font-semibold">Arquivo</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {notasFiscais.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-brand-muted">
                      Nenhuma Nota Fiscal enviada por prestadores.
                    </td>
                  </tr>
                ) : (
                  notasFiscais.map((nf) => (
                    <tr key={nf.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium text-brand-navy">{nf.competencia}</td>
                      <td className="py-3 px-4 text-brand-muted">{nf.numeroNF}</td>
                      <td className="py-3 px-4 font-semibold text-brand-navy">
                        {nf.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-3 px-4 text-brand-muted text-xs">{nf.arquivoNome}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                          {nf.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-brand-navy mb-4 flex items-center gap-2">
          <DollarSign size={18} className="text-emerald-600" />
          Ordens de Pagamento e Retenções Tributárias Consolidadas
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-brand-muted">
                <th className="py-3 px-4 font-semibold">Prestador</th>
                <th className="py-3 px-4 font-semibold">Competência</th>
                <th className="py-3 px-4 font-semibold">Valor Bruto</th>
                <th className="py-3 px-4 font-semibold">Impostos Retidos</th>
                <th className="py-3 px-4 font-semibold">Valor Líquido</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {faturamentoList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-muted">
                    Nenhum registro de faturamento encontrado.
                  </td>
                </tr>
              ) : (
                faturamentoList.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-brand-navy">{f.prestadorNome}</td>
                    <td className="py-3 px-4 text-brand-muted">{f.competencia}</td>
                    <td className="py-3 px-4 text-brand-muted">
                      {f.valorBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-3 px-4 text-rose-600 font-medium">
                      -{f.impostosRetidos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-brand-navy">
                      {f.valorLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(f.status)}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {f.status === 'PENDENTE' && (
                        <button
                          onClick={() => handleAtualizarStatus(f.id, 'APROVADO')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Aprovar Pagamento"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      {f.status === 'APROVADO' && (
                        <button
                          onClick={() => handleAtualizarStatus(f.id, 'PAGO')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          Marcar Pago
                        </button>
                      )}
                      <button
                        onClick={() => handleExcluirFaturamento(f.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Excluir Registro"
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