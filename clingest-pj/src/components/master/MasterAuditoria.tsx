import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  History,
  Search,
  Download,
  RefreshCw,
  ShieldAlert,
  KeyRound,
  FileText,
  Building2,
  CheckCircle2,
  ArrowUpRight,
  X
} from 'lucide-react';
import type { EmpresaSaaS, LogAuditoriaMaster } from '../../types/master';
import { masterService } from '../../services/masterService';

type CategoriaAuditoria =
  | 'TODOS'
  | 'CONTRATOS'
  | 'SUSPENSOES'
  | 'USUARIOS'
  | 'SEGURANCA';

interface MasterAuditoriaProps {
  onSelecionarEmpresa?: (empresaId: string) => void;
}

const ACOES_POR_CATEGORIA: Record<Exclude<CategoriaAuditoria, 'TODOS'>, string[]> = {
  CONTRATOS: ['CADASTRO_EMPRESA', 'ATUALIZACAO_CONTRATO_EMPRESA'],
  SUSPENSOES: ['SUSPENSAO_EMPRESA', 'REATIVACAO_EMPRESA'],
  USUARIOS: ['BLOQUEIO_USUARIO', 'REATIVACAO_USUARIO'],
  SEGURANCA: ['REDEFINICAO_SENHA_USUARIO', 'INICIALIZACAO_GOVERNANCA']
};

function obterMetadadosAcao(acao: string): { rotulo: string; classeBadge: string } {
  switch (acao) {
    case 'CADASTRO_EMPRESA':
      return {
        rotulo: 'Onboarding de Empresa',
        classeBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    case 'ATUALIZACAO_CONTRATO_EMPRESA':
      return {
        rotulo: 'Alteracao Contratual',
        classeBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200'
      };
    case 'SUSPENSAO_EMPRESA':
      return {
        rotulo: 'Suspensao de Plano',
        classeBadge: 'bg-amber-50 text-amber-800 border-amber-200'
      };
    case 'REATIVACAO_EMPRESA':
      return {
        rotulo: 'Reativacao de Plano',
        classeBadge: 'bg-teal-50 text-teal-700 border-teal-200'
      };
    case 'BLOQUEIO_USUARIO':
      return {
        rotulo: 'Bloqueio de Conta',
        classeBadge: 'bg-red-50 text-red-700 border-red-200'
      };
    case 'REATIVACAO_USUARIO':
      return {
        rotulo: 'Reativacao de Conta',
        classeBadge: 'bg-sky-50 text-sky-700 border-sky-200'
      };
    case 'REDEFINICAO_SENHA_USUARIO':
      return {
        rotulo: 'Redefinicao de Senha',
        classeBadge: 'bg-purple-50 text-purple-700 border-purple-200'
      };
    default:
      return {
        rotulo: 'Evento do Sistema',
        classeBadge: 'bg-slate-100 text-slate-700 border-slate-200'
      };
  }
}

export const MasterAuditoria: React.FC<MasterAuditoriaProps> = ({
  onSelecionarEmpresa
}) => {
  const [logs, setLogs] = useState<LogAuditoriaMaster[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaSaaS[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaAuditoria>('TODOS');
  const [filtroEmpresaId, setFiltroEmpresaId] = useState<string>('TODAS');
  const [feedback, setFeedback] = useState<string | null>(null);

  const carregarDadosAuditoria = useCallback(() => {
    setLogs(masterService.getLogsAuditoria());
    setEmpresas(masterService.getEmpresas());
  }, []);

  useEffect(() => {
    carregarDadosAuditoria();
  }, [carregarDadosAuditoria]);

  const indicadores = useMemo(() => {
    const totalEventos = logs.length;
    const suspensoesEBloqueios = logs.filter(
      (l) => l.acao === 'SUSPENSAO_EMPRESA' || l.acao === 'BLOQUEIO_USUARIO'
    ).length;
    const redefinicoesSenha = logs.filter(
      (l) => l.acao === 'REDEFINICAO_SENHA_USUARIO'
    ).length;
    const movimentacoesContratuais = logs.filter(
      (l) => l.acao === 'CADASTRO_EMPRESA' || l.acao === 'ATUALIZACAO_CONTRATO_EMPRESA'
    ).length;

    return {
      totalEventos,
      suspensoesEBloqueios,
      redefinicoesSenha,
      movimentacoesContratuais
    };
  }, [logs]);

  const logsFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return logs.filter((log) => {
      const correspondeCategoria =
        filtroCategoria === 'TODOS' ||
        ACOES_POR_CATEGORIA[filtroCategoria].includes(log.acao);

      const correspondeEmpresa =
        filtroEmpresaId === 'TODAS' || log.empresaId === filtroEmpresaId;

      const correspondeBusca =
        !termo ||
        log.acao.toLowerCase().includes(termo) ||
        log.detalhes.toLowerCase().includes(termo) ||
        log.atorNome.toLowerCase().includes(termo) ||
        (log.empresaNome && log.empresaNome.toLowerCase().includes(termo));

      return correspondeCategoria && correspondeEmpresa && correspondeBusca;
    });
  }, [logs, busca, filtroCategoria, filtroEmpresaId]);

  const handleAtualizar = () => {
    carregarDadosAuditoria();
    setFeedback('Trilha de auditoria sincronizada com os registros mais recentes.');
  };

  const handleExportarCSV = () => {
    const cabecalho = ['ID', 'Data e Hora', 'Ator', 'Codigo Acao', 'Empresa', 'Detalhes'];
    const linhas = logsFiltrados.map((log) => [
      log.id,
      log.dataHora,
      log.atorNome,
      log.acao,
      log.empresaNome || 'Global / Plataforma',
      `"${log.detalhes.replace(/"/g, '""')}"`
    ]);

    const conteudoCsv =
      '\uFEFF' +
      [cabecalho.join(';'), ...linhas.map((linha) => linha.join(';'))].join('\n');

    const blob = new Blob([conteudoCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dataHoje = new Date().toISOString().split('T')[0];

    link.href = url;
    link.setAttribute('download', `auditoria-clingest-master-${dataHoje}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setFeedback(`Relatorio CSV exportado com ${logsFiltrados.length} registro(s).`);
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 text-xs font-medium">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Auditoria Global e Seguranca SaaS
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rastreabilidade completa de contratos, suspensoes, bloqueios de contas e protocolos de seguranca.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleAtualizar}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            <RefreshCw size={14} />
            <span>Atualizar</span>
          </button>

          <button
            type="button"
            onClick={handleExportarCSV}
            disabled={logsFiltrados.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Download size={14} />
            <span>Exportar CSV ({logsFiltrados.length})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Eventos Registrados
            </span>
            <History size={18} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{indicadores.totalEventos}</p>
          <p className="text-xs text-slate-500 mt-1">Trilha imutavel de governanca</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Suspensoes e Bloqueios
            </span>
            <ShieldAlert size={18} className="text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {indicadores.suspensoesEBloqueios}
          </p>
          <p className="text-xs text-slate-500 mt-1">Restricoes de plano ou usuario</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Protocolos de Senha
            </span>
            <KeyRound size={18} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {indicadores.redefinicoesSenha}
          </p>
          <p className="text-xs text-slate-500 mt-1">Redefinicoes seguras disparadas</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Eventos Contratuais
            </span>
            <FileText size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {indicadores.movimentacoesContratuais}
          </p>
          <p className="text-xs text-slate-500 mt-1">Onboardings e ajustes de plano</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar por protocolo, e-mail, empresa ou descricao..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-slate-400 shrink-0" />
              <select
                value={filtroEmpresaId}
                onChange={(e) => setFiltroEmpresaId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="TODAS">Todas as empresas contratantes</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nomeFantasia}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'TODOS', label: 'Todos os Eventos' },
                { id: 'CONTRATOS', label: 'Contratos e Onboarding' },
                { id: 'SUSPENSOES', label: 'Suspensoes de Plano' },
                { id: 'USUARIOS', label: 'Bloqueios de Contas' },
                { id: 'SEGURANCA', label: 'Seguranca e Senhas' }
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFiltroCategoria(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filtroCategoria === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 px-6 font-semibold">Data / Hora</th>
                <th className="py-3 px-6 font-semibold">Tipo de Evento</th>
                <th className="py-3 px-6 font-semibold">Empresa Contratante</th>
                <th className="py-3 px-6 font-semibold">Ator</th>
                <th className="py-3 px-6 font-semibold">Detalhamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {logsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 px-6 text-center text-slate-500">
                    Nenhum registro de auditoria encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                logsFiltrados.map((log) => {
                  const meta = obterMetadadosAcao(log.acao);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-slate-600 whitespace-nowrap">
                        {log.dataHora}
                      </td>
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${meta.classeBadge}`}
                          >
                            <span>{meta.rotulo}</span>
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {log.acao}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        {log.empresaId && log.empresaNome ? (
                          onSelecionarEmpresa ? (
                            <button
                              type="button"
                              onClick={() => onSelecionarEmpresa(log.empresaId as string)}
                              className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              <span>{log.empresaNome}</span>
                              <ArrowUpRight size={13} />
                            </button>
                          ) : (
                            <span className="font-semibold text-slate-800">
                              {log.empresaNome}
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 italic">Plataforma Global</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-700 whitespace-nowrap">
                        {log.atorNome}
                      </td>
                      <td className="py-3.5 px-6 text-slate-700 leading-relaxed max-w-xl">
                        {log.detalhes}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};