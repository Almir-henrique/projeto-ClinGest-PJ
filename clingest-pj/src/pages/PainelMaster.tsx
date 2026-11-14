import React, { useEffect, useState } from 'react';
import { FileText, Users, DollarSign, Plus, Lock } from 'lucide-react';
import { api } from '../services/api';
import type { PrestadorPJ } from '../types/prestador';
import type { ContratoPJ, NotaFiscalPJ } from '../services/api';
import { useToast } from '../context/ToastContext';

export const PainelMaster: React.FC = () => {
  const [prestadores, setPrestadores] = useState<PrestadorPJ[]>([]);
  const [contratos, setContratos] = useState<ContratoPJ[]>([]);
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscalPJ[]>([]);
  const [loading, setLoading] = useState(true);

  const [numeroContrato, setNumeroContrato] = useState('');
  const [prestadorIdSelecionado, setPrestadorIdSelecionado] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataTermino, setDataTermino] = useState('');
  const [valorMensal, setValorMensal] = useState('');

  const { showToast } = useToast();

  const carregarDadosMaster = async () => {
    try {
      const [pData, cData, nData] = await Promise.all([
        api.getPrestadores(),
        api.getContratos(),
        api.getNotasFiscais()
      ]);
      setPrestadores(pData);
      setContratos(cData);
      setNotasFiscais(nData);
    } catch {
      showToast('Erro ao carregar dados do painel master', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosMaster();
  }, []);

  const handleCadastrarContrato = async (e: React.FormEvent) => {
    e.preventDefault();
    const prestadorObj = prestadores.find((p) => p.id === prestadorIdSelecionado);
    if (!prestadorObj) {
      showToast('Selecione um prestador válido', 'error');
      return;
    }

    try {
      const novoContrato: ContratoPJ = {
        id: String(Date.now()),
        prestadorId: prestadorObj.id,
        prestadorNome: prestadorObj.nome,
        numeroContrato,
        dataInicio,
        dataTermino,
        valorMensal: Number(valorMensal) || 0,
        status: 'VIGENTE'
      };

      const contratosAtuais = await api.getContratos();
      const atualizados = [novoContrato, ...contratosAtuais];
      localStorage.setItem('@clingest_contratos', JSON.stringify(atualizados));
      setContratos(atualizados);

      setNumeroContrato('');
      setPrestadorIdSelecionado('');
      setDataInicio('');
      setDataTermino('');
      setValorMensal('');
      showToast('Contrato cadastrado e vinculado com sucesso', 'success');
      api.registrarAuditLog('NOVO_CONTRATO_MASTER', 'Henrique_dev', `Contrato ${numeroContrato} vinculado a ${prestadorObj.nome}`);
    } catch {
      showToast('Erro ao salvar contrato', 'error');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Carregando painel master...</div>;
  }

  const totalValorContratos = contratos.reduce((acc, curr) => acc + curr.valorMensal, 0);
  const _totalNFsHomologadas = notasFiscais.filter((n) => n.status === 'HOMOLOGADO').reduce((acc, curr) => acc + curr.valor, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 mb-2">
            Acesso Master / Henrique_dev
          </span>
          <h1 className="text-2xl font-bold text-brand-navy">Painel de Governança e Gestão de Contratos</h1>
          <p className="text-brand-muted text-sm mt-0.5">
            Controle total sobre contas, limites de cadastros, vigências contratuais e homologações de NFS-e.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-brand-muted">
          <Lock size={16} className="text-brand-teal" />
          <span>Perfil Master com Alçada Irrestrita</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Prestadores Ativos</span>
            <Users size={20} className="text-brand-teal" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{prestadores.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Contratos Vigentes</span>
            <FileText size={20} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{contratos.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Volume em Contratos/Mês</span>
            <DollarSign size={20} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">
            {totalValorContratos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-1">
          <h2 className="text-base font-bold text-brand-navy mb-4 flex items-center gap-2">
            <Plus size={18} className="text-brand-teal" />
            Cadastrar Novo Contrato PJ
          </h2>
          <form onSubmit={handleCadastrarContrato} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Número do Contrato</label>
              <input
                type="text"
                value={numeroContrato}
                onChange={(e) => setNumeroContrato(e.target.value)}
                placeholder="Ex: CTR-2026/045"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Selecionar Prestador PJ</label>
              <select
                value={prestadorIdSelecionado}
                onChange={(e) => setPrestadorIdSelecionado(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                required
              >
                <option value="">Selecione o profissional...</option>
                {prestadores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} ({p.servico})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Início</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Término</label>
                <input
                  type="date"
                  value={dataTermino}
                  onChange={(e) => setDataTermino(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Valor Estimado Mensal (R$)</label>
              <input
                type="number"
                step="0.01"
                value={valorMensal}
                onChange={(e) => setValorMensal(e.target.value)}
                placeholder="Ex: 5000.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-brand-teal hover:bg-teal-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Vincular Contrato Master
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
          <h2 className="text-base font-bold text-brand-navy mb-4 flex items-center gap-2">
            <FileText size={18} className="text-brand-teal" />
            Repositório Global de Contratos e Vigências
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-brand-muted">
                  <th className="py-3 px-4 font-semibold">Contrato</th>
                  <th className="py-3 px-4 font-semibold">Prestador PJ</th>
                  <th className="py-3 px-4 font-semibold">Vigência</th>
                  <th className="py-3 px-4 font-semibold">Valor Mensal</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {contratos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-brand-muted">
                      Nenhum contrato cadastrado.
                    </td>
                  </tr>
                ) : (
                  contratos.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-brand-navy">{c.numeroContrato}</td>
                      <td className="py-3 px-4 text-brand-muted">{c.prestadorNome}</td>
                      <td className="py-3 px-4 text-brand-muted text-xs">
                        {c.dataInicio} até {c.dataTermino}
                      </td>
                      <td className="py-3 px-4 font-semibold text-brand-teal">
                        {c.valorMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                          {c.status}
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
    </div>
  );
};