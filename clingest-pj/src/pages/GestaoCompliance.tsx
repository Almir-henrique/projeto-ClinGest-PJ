import React, { useEffect, useState } from 'react';
import { ShieldCheck, FileText, History, Plus, Trash2, CheckCircle2, MessageSquare, Send } from 'lucide-react';
import { api } from '../services/api';
import type { ContratoPJ, AuditLog, ChamadoPJ } from '../services/api';
import type { DocumentoCompliance } from '../types/compliance';
import type { PrestadorPJ } from '../types/prestador';
import { useToast } from '../context/ToastContext';

export const GestaoCompliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compliance' | 'contratos' | 'auditoria' | 'chamados'>('compliance');
  const [complianceList, setComplianceList] = useState<DocumentoCompliance[]>([]);
  const [contratosList, setContratosList] = useState<ContratoPJ[]>([]);
  const [auditList, setAuditList] = useState<AuditLog[]>([]);
  const [chamadosList, setChamadosList] = useState<ChamadoPJ[]>([]);
  const [prestadores, setPrestadores] = useState<PrestadorPJ[]>([]);
  const [loading, setLoading] = useState(true);

  const [prestadorIdModal, setPrestadorIdModal] = useState('');
  const [tipoDocModal, setTipoDocModal] = useState('');
  const [dataValidadeModal, setDataValidadeModal] = useState('');

  const [respostaTexto, setRespostaTexto] = useState<{ [key: string]: string }>({});

  const { showToast } = useToast();

  const carregarDados = async () => {
    try {
      const [cData, ctData, aData, chData, pData] = await Promise.all([
        api.getCompliance(),
        api.getContratos(),
        api.getAuditLogs(),
        api.getChamados(),
        api.getPrestadores()
      ]);
      setComplianceList(cData);
      setContratosList(ctData);
      setAuditList(aData);
      setChamadosList(chData);
      setPrestadores(pData);
      if (pData.length > 0) {
        setPrestadorIdModal(pData[0].id);
      }
    } catch {
      showToast('Erro ao carregar dados de governança', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSalvarCompliance = async (e: React.FormEvent) => {
    e.preventDefault();
    const prestadorSelecionado = prestadores.find((p) => p.id === prestadorIdModal);
    if (!prestadorSelecionado) return;

    try {
      const hoje = new Date().toISOString().split('T')[0];
      let statusDoc: 'VALIDO' | 'VENCENDO' | 'VENCIDO' = 'VALIDO';
      if (dataValidadeModal < hoje) {
        statusDoc = 'VENCIDO';
      } else {
        const diffDays = Math.ceil((new Date(dataValidadeModal).getTime() - new Date(hoje).getTime()) / (1000 * 3600 * 24));
        if (diffDays <= 30) statusDoc = 'VENCENDO';
      }

      const atualizado = await api.salvarCompliance({
        prestadorId: prestadorSelecionado.id,
        prestadorNome: prestadorSelecionado.nome,
        tipoDocumento: tipoDocModal,
        dataValidade: dataValidadeModal,
        status: statusDoc
      });

      setComplianceList(atualizado);
      setTipoDocModal('');
      setDataValidadeModal('');
      showToast('Documento de compliance cadastrado com sucesso', 'success');
      api.registrarAuditLog('CADASTRO_COMPLIANCE', 'Administrador', `Documento cadastrado para ${prestadorSelecionado.nome}`);
    } catch {
      showToast('Erro ao salvar documento de compliance', 'error');
    }
  };

  const handleExcluirCompliance = async (id: string) => {
    try {
      const atualizado = await api.excluirCompliance(id);
      setComplianceList(atualizado);
      showToast('Documento removido com sucesso', 'success');
    } catch {
      showToast('Erro ao remover documento', 'error');
    }
  };

  const handleResponder = async (chamadoId: string) => {
    const texto = respostaTexto[chamadoId];
    if (!texto) {
      showToast('Digite uma resposta antes de enviar', 'error');
      return;
    }
    try {
      const atualizados = await api.responderChamado(chamadoId, texto);
      setChamadosList(atualizados);
      showToast('Resposta enviada com sucesso ao prestador', 'success');
      api.registrarAuditLog('RESPOSTA_CHAMADO', 'Administrador', `Chamado ${chamadoId} respondido.`);
    } catch {
      showToast('Erro ao enviar resposta', 'error');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Carregando governança e compliance...</div>;
  }

  const getStatusComplianceBadge = (status: string) => {
    switch (status) {
      case 'VALIDO':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'VENCENDO':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'VENCIDO':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Governança, Compliance e Auditoria</h1>
          <p className="text-brand-muted text-sm mt-0.5">
            Monitoramento de certidões, repositório contratual, trilha de auditoria e suporte B2B.
          </p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-xl text-xs font-semibold flex-wrap">
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3.5 py-2 rounded-lg transition-all ${activeTab === 'compliance' ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-muted hover:text-brand-navy'}`}
          >
            Compliance CND
          </button>
          <button
            onClick={() => setActiveTab('contratos')}
            className={`px-3.5 py-2 rounded-lg transition-all ${activeTab === 'contratos' ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-muted hover:text-brand-navy'}`}
          >
            Contratos
          </button>
          <button
            onClick={() => setActiveTab('chamados')}
            className={`px-3.5 py-2 rounded-lg transition-all ${activeTab === 'chamados' ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-muted hover:text-brand-navy'}`}
          >
            Suporte B2B
          </button>
          <button
            onClick={() => setActiveTab('auditoria')}
            className={`px-3.5 py-2 rounded-lg transition-all ${activeTab === 'auditoria' ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-muted hover:text-brand-navy'}`}
          >
            Auditoria
          </button>
        </div>
      </div>

      {activeTab === 'compliance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit">
            <h2 className="text-base font-bold text-brand-navy mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-600" />
              Adicionar Documento de Compliance
            </h2>
            <form onSubmit={handleSalvarCompliance} className="space-y-4">
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
                      {p.nome} ({p.cnpj})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Tipo de Documento</label>
                <input
                  type="text"
                  value={tipoDocModal}
                  onChange={(e) => setTipoDocModal(e.target.value)}
                  placeholder="Ex: CND Federal, CRF, Apólice Seguros"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Data de Validade</label>
                <input
                  type="date"
                  value={dataValidadeModal}
                  onChange={(e) => setDataValidadeModal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-brand-teal hover:bg-teal-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Cadastrar Documento
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-brand-navy mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              Monitoramento de Regularidade de Prestadores
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-brand-muted">
                    <th className="py-3 px-4 font-semibold">Prestador</th>
                    <th className="py-3 px-4 font-semibold">Tipo de Documento</th>
                    <th className="py-3 px-4 font-semibold">Validade</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {complianceList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-brand-muted">
                        Nenhum documento de compliance registrado.
                      </td>
                    </tr>
                  ) : (
                    complianceList.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-medium text-brand-navy">{c.prestadorNome}</td>
                        <td className="py-3 px-4 text-brand-muted">{c.tipoDocumento}</td>
                        <td className="py-3 px-4 text-brand-muted">{c.dataValidade}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusComplianceBadge(c.status)}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleExcluirCompliance(c.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Excluir documento"
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
      )}

      {activeTab === 'contratos' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
              <FileText size={18} className="text-sky-600" />
              Repositório Oficial de Contratos de Prestação de Serviços PJ
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-brand-muted">
                  <th className="py-3 px-4 font-semibold">Nº Contrato</th>
                  <th className="py-3 px-4 font-semibold">Prestador</th>
                  <th className="py-3 px-4 font-semibold">Início Vigência</th>
                  <th className="py-3 px-4 font-semibold">Término Vigência</th>
                  <th className="py-3 px-4 font-semibold">Valor Mensal Base</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {contratosList.map((ct) => (
                  <tr key={ct.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-brand-navy">{ct.numeroContrato}</td>
                    <td className="py-3 px-4 text-brand-muted">{ct.prestadorNome}</td>
                    <td className="py-3 px-4 text-brand-muted">{ct.dataInicio}</td>
                    <td className="py-3 px-4 text-brand-muted">{ct.dataTermino}</td>
                    <td className="py-3 px-4 font-semibold text-brand-navy">
                      {ct.valorMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ct.status === 'VIGENTE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {ct.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'chamados' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
              <MessageSquare size={18} className="text-indigo-600" />
              Gestão de Chamados e Suporte B2B dos Prestadores
            </h2>
          </div>
          <div className="space-y-4">
            {chamadosList.length === 0 ? (
              <p className="text-sm text-brand-muted text-center py-8">Nenhum chamado de suporte registrado.</p>
            ) : (
              chamadosList.map((ch) => (
                <div key={ch.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{ch.prestadorNome}</span>
                      <h3 className="text-sm font-bold text-brand-navy mt-0.5">{ch.assunto}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-brand-muted font-mono">{ch.dataCriacao}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ch.status === 'RESPONDIDO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {ch.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-brand-muted bg-white p-3 rounded-lg border border-slate-100">{ch.mensagem}</p>
                  
                  {ch.respostaAdmin ? (
                    <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-xs text-brand-navy">
                      <strong>Resposta da Administração:</strong> {ch.respostaAdmin}
                    </div>
                  ) : (
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={respostaTexto[ch.id] || ''}
                        onChange={(e) => setRespostaTexto({ ...respostaTexto, [ch.id]: e.target.value })}
                        placeholder="Digite a resposta oficial para o prestador..."
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-brand-navy focus:outline-none focus:border-indigo-600"
                      />
                      <button
                        onClick={() => handleResponder(ch.id)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Send size={14} />
                        Responder
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'auditoria' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
              <History size={18} className="text-indigo-600" />
              Trilha de Auditoria e Logs de Segurança (Audit Trail)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-brand-muted">
                  <th className="py-3 px-4 font-semibold">Data / Hora</th>
                  <th className="py-3 px-4 font-semibold">Ação Executada</th>
                  <th className="py-3 px-4 font-semibold">Usuário Responsável</th>
                  <th className="py-3 px-4 font-semibold">Detalhes da Operação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {auditList.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-brand-muted font-mono text-xs">{log.dataHora}</td>
                    <td className="py-3 px-4 font-semibold text-brand-navy">{log.acao}</td>
                    <td className="py-3 px-4 text-brand-muted">{log.usuario}</td>
                    <td className="py-3 px-4 text-brand-muted">{log.detalhes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};