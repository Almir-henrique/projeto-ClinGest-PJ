import React, { useEffect, useState } from 'react';
import { CheckSquare, DollarSign, ShieldCheck, Plus, Upload, Calculator, MessageSquare, Clock, User } from 'lucide-react';
import type { PrestadorPJ } from '../types/prestador';
import type { TarefaPJ } from '../types/tarefa';
import type { DocumentoCompliance } from '../types/compliance';
import type { FaturamentoPJ } from '../types/faturamento';
import { api } from '../services/api';
import type { NotaFiscalPJ, ChamadoPJ } from '../services/api';
import { useToast } from '../context/ToastContext';

interface PortalPrestadorProps {
  prestadorLogado: PrestadorPJ;
}

export const PortalPrestador: React.FC<PortalPrestadorProps> = ({ prestadorLogado }) => {
  const [tarefas, setTarefas] = useState<TarefaPJ[]>([]);
  const [compliance, setCompliance] = useState<DocumentoCompliance[]>([]);
  const [faturamento, setFaturamento] = useState<FaturamentoPJ[]>([]);
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscalPJ[]>([]);
  const [loading, setLoading] = useState(true);

  const [tituloAtendimento, setTituloAtendimento] = useState('');
  const [pacienteNome, setPacienteNome] = useState('');
  const [horasTrabalhadas, setHorasTrabalhadas] = useState('');
  const [dataAtendimento, setDataAtendimento] = useState('');

  const [competenciaNF, setCompetenciaNF] = useState('');
  const [numeroNF, setNumeroNF] = useState('');
  const [valorNF, setValorNF] = useState('');
  const [arquivoNF, setArquivoNF] = useState<File | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([
      api.getTarefas(),
      api.getCompliance(),
      api.getFaturamento(),
      api.getNotasFiscais()
    ]).then(([tData, cData, fData, nData]) => {
      setTarefas(tData.filter((t) => t.prestadorId === prestadorLogado.id));
      setCompliance(cData.filter((c) => c.prestadorId === prestadorLogado.id));
      setFaturamento(fData.filter((f) => f.prestadorId === prestadorLogado.id));
      setNotasFiscais(nData.filter((n) => n.prestadorId === prestadorLogado.id));
      setLoading(false);
    });
  }, [prestadorLogado.id]);

  const handleSalvarApontamento = async (e: React.FormEvent) => {
    e.preventDefault();
    const horas = Number(horasTrabalhadas) || 0;
    const valorCalculado = horas * prestadorLogado.valorBase;

    try {
      const novoApontamento = {
        prestadorId: prestadorLogado.id,
        prestadorNome: prestadorLogado.nome,
        titulo: tituloAtendimento,
        descricao: `Atendimento ao paciente ${pacienteNome} (${horas} horas trabalhadas)`,
        pacienteNome,
        horasTrabalhadas: horas,
        prazo: dataAtendimento || new Date().toISOString().split('T')[0],
        status: 'EM_ANDAMENTO' as const,
        valorEntrega: valorCalculado
      };

      const atualizadas = await api.salvarTarefa(novoApontamento);
      setTarefas(atualizadas.filter((t) => t.prestadorId === prestadorLogado.id));
      setTituloAtendimento('');
      setPacienteNome('');
      setHorasTrabalhadas('');
      setDataAtendimento('');
      showToast('Apontamento de horas registrado com sucesso para validacao', 'success');
    } catch {
      showToast('Erro ao registrar apontamento', 'error');
    }
  };

  const handleUploadNF = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competenciaNF || !numeroNF || !valorNF) {
      showToast('Preencha todos os campos da Nota Fiscal', 'error');
      return;
    }
    try {
      const novas = await api.salvarNotaFiscal({
        prestadorId: prestadorLogado.id,
        prestadorNome: prestadorLogado.nome,
        competencia: competenciaNF,
        numeroNF,
        valor: Number(valorNF),
        arquivoNome: arquivoNF ? arquivoNF.name : 'nota_fiscal_servico.pdf'
      });
      setNotasFiscais(novas.filter((n: NotaFiscalPJ) => n.prestadorId === prestadorLogado.id));
      setCompetenciaNF('');
      setNumeroNF('');
      setValorNF('');
      setArquivoNF(null);
      showToast('Nota Fiscal enviada com sucesso para homologação', 'success');
    } catch {
      showToast('Erro ao enviar Nota Fiscal', 'error');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Carregando painel do profissional de saude...</div>;
  }

  const totalHorasMes = tarefas.reduce((acc, curr) => acc + (curr.horasTrabalhadas || 0), 0);
  const totalReceber = faturamento.reduce((acc, curr) => acc + curr.valorLiquido, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-brand-teal border border-teal-200 mb-2">
            {prestadorLogado.servico}
          </span>
          <h1 className="text-2xl font-bold text-brand-navy">{prestadorLogado.nome}</h1>
          <p className="text-brand-muted text-sm mt-0.5">
            {prestadorLogado.razaoSocial} — CNPJ: {prestadorLogado.cnpj}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-brand-muted uppercase font-semibold">Valor Hora Contratual</p>
          <p className="text-sm font-bold text-brand-teal mt-0.5">
            {prestadorLogado.valorBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / hora
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total a Receber (Liquido)</span>
            <DollarSign size={20} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">
            {totalReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Horas Apontadas no Mes</span>
            <Clock size={20} className="text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{totalHorasMes} h</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Atendimentos Registrados</span>
            <CheckSquare size={20} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{tarefas.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-brand-navy mb-4 flex items-center gap-2">
            <Clock size={18} className="text-brand-teal" />
            Apontamento de Horas e Atendimento a Paciente
          </h2>
          <form onSubmit={handleSalvarApontamento} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Tipo de Plantao / Servico</label>
              <input
                type="text"
                value={tituloAtendimento}
                onChange={(e) => setTituloAtendimento(e.target.value)}
                placeholder="Ex: Plantao UTI / Atendimento Especializado"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Nome do Paciente Atendido</label>
              <input
                type="text"
                value={pacienteNome}
                onChange={(e) => setPacienteNome(e.target.value)}
                placeholder="Ex: Carlos Alberto Santos"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Quantidade de Horas</label>
                <input
                  type="number"
                  step="0.5"
                  value={horasTrabalhadas}
                  onChange={(e) => setHorasTrabalhadas(e.target.value)}
                  placeholder="Ex: 8"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Data do Atendimento</label>
                <input
                  type="date"
                  value={dataAtendimento}
                  onChange={(e) => setDataAtendimento(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                  required
                />
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-brand-muted">
              Valor calculado com base na sua hora ({prestadorLogado.valorBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/h): 
              <strong className="text-brand-navy ml-1">
                {((Number(horasTrabalhadas) || 0) * prestadorLogado.valorBase).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-brand-teal hover:bg-teal-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Registrar Apontamento de Horas
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-brand-navy mb-4 flex items-center gap-2">
            <Upload size={18} className="text-teal-600" />
            Envio de Nota Fiscal de Servico (NFS-e)
          </h2>
          <form onSubmit={handleUploadNF} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Competencia</label>
                <input
                  type="text"
                  value={competenciaNF}
                  onChange={(e) => setCompetenciaNF(e.target.value)}
                  placeholder="Ex: 10/2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Numero da NFS-e</label>
                <input
                  type="text"
                  value={numeroNF}
                  onChange={(e) => setNumeroNF(e.target.value)}
                  placeholder="Ex: 000185"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Valor Bruto Total (R$)</label>
              <input
                type="number"
                step="0.01"
                value={valorNF}
                onChange={(e) => setValorNF(e.target.value)}
                placeholder="Ex: 3000.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Arquivo PDF da NFS-e</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setArquivoNF(e.target.files ? e.target.files[0] : null)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-brand-navy focus:outline-none focus:border-brand-teal file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-brand-teal hover:file:bg-teal-100"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-brand-teal hover:bg-teal-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              Enviar NFS-e para Homologacao
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-brand-navy mb-4 flex items-center gap-2">
          <CheckSquare size={18} className="text-indigo-600" />
          Historico de Apontamentos e Atendimentos Realizados
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-brand-muted">
                <th className="py-3 px-4 font-semibold">Data</th>
                <th className="py-3 px-4 font-semibold">Servico / Plantao</th>
                <th className="py-3 px-4 font-semibold">Paciente Atendido</th>
                <th className="py-3 px-4 font-semibold">Horas</th>
                <th className="py-3 px-4 font-semibold">Valor Total</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {tarefas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-brand-muted">
                    Nenhum apontamento de horas registrado.
                  </td>
                </tr>
              ) : (
                tarefas.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-brand-muted">{t.prazo}</td>
                    <td className="py-3 px-4 font-medium text-brand-navy">{t.titulo}</td>
                    <td className="py-3 px-4 text-brand-muted">{t.pacienteNome || 'N/A'}</td>
                    <td className="py-3 px-4 text-brand-navy font-semibold">{t.horasTrabalhadas || 0} h</td>
                    <td className="py-3 px-4 font-semibold text-brand-teal">
                      {t.valorEntrega.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                        {t.status}
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
  );
};