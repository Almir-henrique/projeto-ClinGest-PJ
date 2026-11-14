import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, DollarSign, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiEmpresas, api } from '../services/api';
import type { EmpresaTenant } from '../types/contrato';
import type { PrestadorPJ } from '../types/prestador';

export const PainelMaster: React.FC = () => {
  const [empresas, setEmpresas] = useState<EmpresaTenant[]>([]);
  const [prestadores, setPrestadores] = useState<PrestadorPJ[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  
  // Estados do formulário de nova empresa cliente
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [limitePrestadores, setLimitePrestadores] = useState(10);
  const [valorMensalidade, setValorMensalidade] = useState(750.00);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const listaEmpresas = await apiEmpresas.getEmpresas();
    const listaPrestadores = await api.getPrestadores();
    setEmpresas(listaEmpresas);
    setPrestadores(listaPrestadores);
  };

  const calcularMensalidadeSugerida = (limite: number) => {
    const basePorPrestador = 75.00;
    return limite * basePorPrestador;
  };

  const handleLimiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setLimitePrestadores(val);
    setValorMensalidade(calcularMensalidadeSugerida(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeFantasia || !cnpj) return;

    await apiEmpresas.salvarEmpresa({
      nomeFantasia,
      razaoSocial,
      cnpj,
      limitePrestadores,
      valorMensalidade,
      status: 'ATIVO'
    });

    setNomeFantasia('');
    setRazaoSocial('');
    setCnpj('');
    setLimitePrestadores(10);
    setValorMensalidade(750.00);
    setModalAberto(false);
    carregarDados();
  };

  const toggleStatusEmpresa = async (id: string, statusAtual: 'ATIVO' | 'SUSPENSO') => {
    const novoStatus = statusAtual === 'ATIVO' ? 'SUSPENSO' : 'ATIVO';
    await apiEmpresas.atualizarStatusEmpresa(id, novoStatus);
    carregarDados();
  };

  const receitaTotalMRR = empresas
    .filter(e => e.status === 'ATIVO')
    .reduce((acc, curr) => acc + curr.valorMensalidade, 0);

  const totalGeralPrestadores = prestadores.length;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" /> Painel Master - Governança SaaS
          </h1>
          <p className="text-sm text-slate-500">Controle centralizado de tenants, limites de licenças por funcionários e faturamento recorrente (MRR)</p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-sm font-medium text-sm"
        >
          <Plus className="w-5 h-5" /> Cadastrar Empresa Cliente
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Empresas Contratantes</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{empresas.length}</h3>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">MRR Total (Receita Mensal)</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              R$ {receitaTotalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total de Prestadores no Ecossistema</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalGeralPrestadores}</h3>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabela de Empresas / Tenants */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 font-semibold text-slate-800 flex justify-between items-center">
          <span>Clínicas e Hospitais Licenciados (Tenants)</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-normal">
            Controle de Limite de Funcionários por Plano
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-semibold">Empresa / Razão Social</th>
                <th className="p-4 font-semibold">CNPJ</th>
                <th className="p-4 font-semibold">Ocupação de Licenças (Funcionários)</th>
                <th className="p-4 font-semibold">Mensalidade (R$)</th>
                <th className="p-4 font-semibold">Status do Plano</th>
                <th className="p-4 font-semibold text-right">Ações Master</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {empresas.map(emp => {
                // Simulação de vínculo por empresa (caso o prestador possua empresaId ou geral)
                const prestadoresDaEmpresa = prestadores.filter(p => p.empresaId === emp.id || !p.empresaId);
                const totalAtual = prestadoresDaEmpresa.length;
                const percentual = (totalAtual / emp.limitePrestadores) * 100;
                const limiteAtingido = totalAtual >= emp.limitePrestadores;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-medium text-slate-800">
                      {emp.nomeFantasia}
                      <span className="block text-xs text-slate-400 font-normal">{emp.razaoSocial}</span>
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-xs">{emp.cnpj}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${limiteAtingido ? 'text-red-600' : 'text-slate-800'}`}>
                          {totalAtual} / {emp.limitePrestadores}
                        </span>
                        {limiteAtingido && (
                          <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Limite Atingido
                          </span>
                        )}
                      </div>
                      <div className="w-48 bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${limiteAtingido ? 'bg-red-500' : 'bg-indigo-600'}`} 
                          style={{ width: `${Math.min(percentual, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-4 text-emerald-600 font-bold">
                      R$ {emp.valorMensalidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        emp.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleStatusEmpresa(emp.id, emp.status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          emp.status === 'ATIVO' 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {emp.status === 'ATIVO' ? 'Suspender Acesso' : 'Ativar Plano'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro de Nova Empresa Tenant */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-800">Cadastrar Nova Empresa Cliente (Tenant)</h2>
              <button 
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Fantasia da Clínica / Hospital</label>
                <input
                  type="text"
                  required
                  value={nomeFantasia}
                  onChange={e => setNomeFantasia(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: Hospital São Lucas"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Razão Social</label>
                <input
                  type="text"
                  required
                  value={razaoSocial}
                  onChange={e => setRazaoSocial(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: São Lucas Serviços Médicos Ltda"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">CNPJ</label>
                <input
                  type="text"
                  required
                  value={cnpj}
                  onChange={e => setCnpj(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="00.000.000/0001-00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Limite de Funcionários</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={limitePrestadores}
                    onChange={handleLimiteChange}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Teto de cadastros permitidos para a clínica.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mensalidade (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={valorMensalidade}
                    onChange={e => setValorMensalidade(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-indigo-500 outline-none bg-emerald-50/30"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Base de ganho recorrente (MRR).</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
                >
                  Salvar Empresa Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};