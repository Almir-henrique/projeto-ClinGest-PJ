import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckSquare,
  DollarSign,
  Plus,
  Upload,
  Clock,
  Download,
  Building2,
  FileText,
  AlertTriangle
} from 'lucide-react';
import type { PrestadorPJ } from '../types/prestador';
import type { TarefaPJ } from '../types/tarefa';
import type { FaturamentoPJ } from '../types/faturamento';
import type { PagamentoPJ } from '../types/pagamento';
import { api } from '../services/api';
import type { NotaFiscalPJ } from '../services/api';
import { dbServicePagamentos } from '../services/db';
import { masterService } from '../services/masterService';
import { useToast } from '../context/ToastContext';

interface PortalPrestadorProps {
  prestadorLogado: PrestadorPJ;
}

export const PortalPrestador: React.FC<PortalPrestadorProps> = ({
  prestadorLogado
}) => {
  const [tarefas, setTarefas] = useState<TarefaPJ[]>([]);
  const [faturamento, setFaturamento] = useState<FaturamentoPJ[]>([]);
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscalPJ[]>([]);
  const [pagamentos, setPagamentos] = useState<PagamentoPJ[]>([]);
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

  const empresaVinculada = useMemo(() => {
    if (!prestadorLogado.empresaId) return undefined;
    return masterService
      .getEmpresas()
      .find((emp) => emp.id === prestadorLogado.empresaId);
  }, [prestadorLogado.empresaId]);

  const acessoBloqueado =
    prestadorLogado.situacao !== 'ATIVO' ||
    (empresaVinculada !== undefined && empresaVinculada.status !== 'ATIVA');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getTarefas(),
      api.getFaturamento(),
      api.getNotasFiscais()
    ]).then(([tData, fData, nData]) => {
      setTarefas(tData.filter((t) => t.prestadorId === prestadorLogado.id));
      setFaturamento(fData.filter((f) => f.prestadorId === prestadorLogado.id));
      setNotasFiscais(
        nData.filter((n) => n.prestadorId === prestadorLogado.id)
      );

      const todosPagamentos = dbServicePagamentos.getPagamentos();
      setPagamentos(
        todosPagamentos.filter((p) => p.prestadorId === prestadorLogado.id)
      );
      setLoading(false);
    });
  }, [prestadorLogado.id]);

  const handleSalvarApontamento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (acessoBloqueado) {
      showToast(
        'Seu vinculo ou a empresa contratante esta inativo no momento.',
        'error'
      );
      return;
    }

    const horas = Number(horasTrabalhadas) || 0;
    if (horas <= 0) {
      showToast('Informe uma quantidade de horas valida.', 'error');
      return;
    }

    const valorCalculado = Number(
      (horas * prestadorLogado.valorBase).toFixed(2)
    );

    try {
      const novoApontamento = {
        prestadorId: prestadorLogado.id,
        prestadorNome: prestadorLogado.nome,
        titulo: tituloAtendimento.trim(),
        descricao: `Atendimento ao paciente ${pacienteNome.trim()} (${horas} horas trabalhadas)`,
        pacienteNome: pacienteNome.trim(),
        horasTrabalhadas: horas,
        prazo: dataAtendimento || new Date().toISOString().split('T')[0],
        status: 'PENDENTE' as const,
        valorEntrega: valorCalculado
      };

      const atualizadas = await api.salvarTarefa(novoApontamento);
      setTarefas(atualizadas.filter((t) => t.prestadorId === prestadorLogado.id));
      setTituloAtendimento('');
      setPacienteNome('');
      setHorasTrabalhadas('');
      setDataAtendimento('');
      showToast(
        'Apontamento de horas enviado para aprovacao do gestor!',
        'success'
      );
    } catch {
      showToast('Erro ao registrar apontamento', 'error');
    }
  };

  const handleUploadNF = async (e: React.FormEvent) => {
    e.preventDefault();

    if (acessoBloqueado) {
      showToast(
        'Seu vinculo ou a empresa contratante esta inativo no momento.',
        'error'
      );
      return;
    }

    if (!competenciaNF || !numeroNF || !valorNF) {
      showToast('Preencha todos os campos da Nota Fiscal', 'error');
      return;
    }

    try {
      const novas = await api.salvarNotaFiscal({
        prestadorId: prestadorLogado.id,
        prestadorNome: prestadorLogado.nome,
        competencia: competenciaNF.trim(),
        numeroNF: numeroNF.trim(),
        valor: Number(valorNF),
        arquivoNome: arquivoNF ? arquivoNF.name : 'nota_fiscal_servico.pdf'
      });
      setNotasFiscais(
        novas.filter((n: NotaFiscalPJ) => n.prestadorId === prestadorLogado.id)
      );
      setCompetenciaNF('');
      setNumeroNF('');
      setValorNF('');
      setArquivoNF(null);
      showToast('Nota Fiscal enviada com sucesso para homologacao', 'success');
    } catch {
      showToast('Erro ao enviar Nota Fiscal', 'error');
    }
  };

  const exportarCSVPessoal = () => {
    const cabecalho = 'ID,Servico,Paciente,Horas,ValorTotal,Status,Data\n';
    const linhas = tarefas
      .map(
        (t) =>
          `"${t.id}","${t.titulo}","${t.pacienteNome || 'N/A'}","${
            t.horasTrabalhadas
          }","${t.valorEntrega}","${t.status}","${t.prazo}"`
      )
      .join('\n');

    const blob = new Blob([cabecalho + linhas], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `meu_extrato_horas_${prestadorLogado.nome
        .toLowerCase()
        .replace(/\s+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Carregando painel do profissional de saude...
      </div>
    );
  }

  const totalHorasMes = tarefas.reduce(
    (acc, curr) => acc + (curr.horasTrabalhadas || 0),
    0
  );
  const totalReceber = faturamento.reduce(
    (acc, curr) => acc + curr.valorLiquido,
    0
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans bg-slate-50 min-h-screen">
      {acessoBloqueado && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm font-medium">
            Seu cadastro PJ esta inativo ou a empresa contratante encontra-se
            suspensa. Novos apontamentos e envios de NFS-e estao temporariamente
            bloqueados.
          </p>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              {prestadorLogado.servico}
            </span>
            {empresaVinculada && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <Building2 size={12} />
                {empresaVinculada.nomeFantasia}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {prestadorLogado.nome}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {prestadorLogado.razaoSocial} — CNPJ: {prestadorLogado.cnpj}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase font-semibold">
              Valor Hora Contratual
            </p>
            <p className="text-sm font-bold text-emerald-600 mt-0.5">
              {prestadorLogado.valorBase.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}{' '}
              / hora
            </p>
          </div>
          <button
            onClick={exportarCSVPessoal}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl transition shadow-sm font-medium text-sm"
          >
            <Download size={16} /> Baixar CSV Pessoal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Faturado (Liquido)
            </span>
            <DollarSign size={20} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {totalReceber.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Horas Apontadas
            </span>
            <Clock size={20} className="text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{totalHorasMes} h</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Atendimentos Registrados
            </span>
            <CheckSquare size={20} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{tarefas.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-indigo-600" />
            Apontamento de Horas e Atendimento a Paciente
          </h2>
          <form onSubmit={handleSalvarApontamento} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Tipo de Plantao / Servico
              </label>
              <input
                type="text"
                value={tituloAtendimento}
                onChange={(e) => setTituloAtendimento(e.target.value)}
                placeholder="Ex: Plantao UTI / Atendimento Especializado"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                disabled={acessoBloqueado}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Nome do Paciente Atendido
              </label>
              <input
                type="text"
                value={pacienteNome}
                onChange={(e) => setPacienteNome(e.target.value)}
                placeholder="Ex: Carlos Alberto Santos"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                disabled={acessoBloqueado}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Quantidade de Horas
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={horasTrabalhadas}
                  onChange={(e) => setHorasTrabalhadas(e.target.value)}
                  placeholder="Ex: 8"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  disabled={acessoBloqueado}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Data do Atendimento
                </label>
                <input
                  type="date"
                  value={dataAtendimento}
                  onChange={(e) => setDataAtendimento(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  disabled={acessoBloqueado}
                  required
                />
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500">
              Valor calculado com base na sua hora (
              {prestadorLogado.valorBase.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
              /h):
              <strong className="text-slate-800 ml-1">
                {(
                  (Number(horasTrabalhadas) || 0) * prestadorLogado.valorBase
                ).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </strong>
            </div>
            <button
              type="submit"
              disabled={acessoBloqueado}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Registrar Apontamento de Horas
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Upload size={18} className="text-indigo-600" />
            Envio de Nota Fiscal de Servico (NFS-e)
          </h2>
          <form onSubmit={handleUploadNF} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Competencia
                </label>
                <input
                  type="text"
                  value={competenciaNF}
                  onChange={(e) => setCompetenciaNF(e.target.value)}
                  placeholder="Ex: 11/2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  disabled={acessoBloqueado}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Numero da NFS-e
                </label>
                <input
                  type="text"
                  value={numeroNF}
                  onChange={(e) => setNumeroNF(e.target.value)}
                  placeholder="Ex: 000185"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  disabled={acessoBloqueado}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Valor Bruto Total (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valorNF}
                onChange={(e) => setValorNF(e.target.value)}
                placeholder="Ex: 3000.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                disabled={acessoBloqueado}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Arquivo PDF da NFS-e
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) =>
                  setArquivoNF(e.target.files ? e.target.files[0] : null)
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                disabled={acessoBloqueado}
                required
              />
            </div>
            <button
              type="submit"
              disabled={acessoBloqueado}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              Enviar NFS-e para Homologacao
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CheckSquare size={18} className="text-indigo-600" />
          Meu Historico de Apontamentos e Atendimentos
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
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
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    Nenhum apontamento de horas registrado por voce.
                  </td>
                </tr>
              ) : (
                tarefas.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-500">{t.prazo}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {t.titulo}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {t.pacienteNome || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-semibold">
                      {t.horasTrabalhadas || 0} h
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">
                      {t.valorEntrega.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          t.status === 'APROVADO'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : (t.status as string) === 'REJEITADO'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            Notas Fiscais (NFS-e) Enviadas
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-3 px-4 font-semibold">Competencia</th>
                  <th className="py-3 px-4 font-semibold">Numero NF</th>
                  <th className="py-3 px-4 font-semibold">Valor</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {notasFiscais.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-slate-500"
                    >
                      Nenhuma NFS-e enviada ate o momento.
                    </td>
                  </tr>
                ) : (
                  notasFiscais.map((nf) => (
                    <tr
                      key={nf.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {nf.competencia}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                        {nf.numeroNF}
                        <span className="block font-sans text-[11px] text-slate-400">
                          {nf.arquivoNome}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {nf.valor.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            nf.status === 'HOMOLOGADO' ||
                            nf.status === 'APROVADO'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : nf.status === 'REJEITADA'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
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

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-600" />
            Meus Pagamentos e Comprovantes PIX
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-3 px-4 font-semibold">Competencia</th>
                  <th className="py-3 px-4 font-semibold">Valor Liquido</th>
                  <th className="py-3 px-4 font-semibold">Comprovante</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {pagamentos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-slate-500"
                    >
                      Nenhum pagamento registrado ainda.
                    </td>
                  </tr>
                ) : (
                  pagamentos.map((pg) => (
                    <tr
                      key={pg.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {pg.competencia}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600">
                        {pg.valorLiquido.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">
                        {pg.comprovanteCodigo}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            pg.status === 'QUITADO'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {pg.status}
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