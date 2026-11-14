import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  FileText,
  KeyRound,
  Users,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  X,
  AlertCircle,
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  Lock,
  UserCheck,
  UserX,
  Search,
  Mail,
  History
} from 'lucide-react';
import type {
  AtualizarEmpresaContratoInput,
  EmpresaComMetricas,
  LogAuditoriaMaster,
  PerfilUsuarioSistema,
  PoliticaExcedentes,
  ResultadoRedefinicaoSenha,
  StatusEmpresa,
  StatusUsuarioSistema,
  UsuarioContaMaster
} from '../../types/master';
import { masterService } from '../../services/masterService';

interface MasterEmpresaDetalhesProps {
  empresaId: string;
  onVoltar: () => void;
  onDadosAtualizados: () => void;
}

export const MasterEmpresaDetalhes: React.FC<MasterEmpresaDetalhesProps> = ({
  empresaId,
  onVoltar,
  onDadosAtualizados
}) => {
  const [empresa, setEmpresa] = useState<EmpresaComMetricas | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioContaMaster[]>([]);
  const [logsEmpresa, setLogsEmpresa] = useState<LogAuditoriaMaster[]>([]);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const [buscaUsuario, setBuscaUsuario] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState<'TODOS' | PerfilUsuarioSistema>('TODOS');

  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [erroEdicao, setErroEdicao] = useState<string | null>(null);

  const [modalStatusAberto, setModalStatusAberto] = useState(false);
  const [statusAlvo, setStatusAlvo] = useState<StatusEmpresa>('SUSPENSA');
  const [motivoAlteracaoStatus, setMotivoAlteracaoStatus] = useState('');

  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  const [usuarioAlvoSenha, setUsuarioAlvoSenha] = useState<UsuarioContaMaster | null>(null);
  const [resultadoSenha, setResultadoSenha] = useState<ResultadoRedefinicaoSenha | null>(null);

  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [emailContato, setEmailContato] = useState('');
  const [telefoneContato, setTelefoneContato] = useState('');
  const [plano, setPlano] = useState('');
  const [valorContratoBase, setValorContratoBase] = useState('');
  const [licencasContratadas, setLicencasContratadas] = useState('');
  const [politicaExcedentes, setPoliticaExcedentes] = useState<PoliticaExcedentes>('BLOQUEAR');
  const [valorPorExcedente, setValorPorExcedente] = useState('');
  const [vigenciaInicio, setVigenciaInicio] = useState('');
  const [vigenciaFim, setVigenciaFim] = useState('');

  const carregarDetalhes = useCallback(() => {
    const dadosEmpresa = masterService.getEmpresaComMetricasById(empresaId);
    const listaUsuarios = masterService.getUsuariosPorEmpresa(empresaId);
    const historicoEmpresa = masterService.getLogsPorEmpresa(empresaId);
    setEmpresa(dadosEmpresa);
    setUsuarios(listaUsuarios);
    setLogsEmpresa(historicoEmpresa);
  }, [empresaId]);

  useEffect(() => {
    carregarDetalhes();
  }, [carregarDetalhes]);

  const usuariosFiltrados = useMemo(() => {
    const termo = buscaUsuario.trim().toLowerCase();
    return usuarios.filter((u) => {
      const correspondePerfil =
        filtroPerfil === 'TODOS' || u.perfil === filtroPerfil;
      const correspondeTexto =
        !termo ||
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo);
      return correspondePerfil && correspondeTexto;
    });
  }, [usuarios, buscaUsuario, filtroPerfil]);

  const formatarMoeda = (valor: number) =>
    (Number(valor) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleAbrirModalEdicao = () => {
    if (!empresa) return;
    setRazaoSocial(empresa.razaoSocial);
    setNomeFantasia(empresa.nomeFantasia);
    setEmailContato(empresa.emailContato);
    setTelefoneContato(empresa.telefoneContato);
    setPlano(empresa.plano);
    setValorContratoBase(String(empresa.valorContratoBase));
    setLicencasContratadas(String(empresa.licencasContratadas));
    setPoliticaExcedentes(empresa.politicaExcedentes);
    setValorPorExcedente(String(empresa.valorPorExcedente || 50));
    setVigenciaInicio(empresa.vigenciaInicio);
    setVigenciaFim(empresa.vigenciaFim);
    setErroEdicao(null);
    setModalEdicaoAberto(true);
  };

  const handleSalvarEdicao = () => {
    if (!empresa) return;
    setErroEdicao(null);

    if (!razaoSocial.trim() || !nomeFantasia.trim() || !plano.trim()) {
      setErroEdicao('Preencha todos os campos obrigatorios da empresa e do plano.');
      return;
    }

    const payload: AtualizarEmpresaContratoInput = {
      razaoSocial,
      nomeFantasia,
      emailContato,
      telefoneContato,
      plano,
      valorContratoBase: Number(valorContratoBase),
      licencasContratadas: Number(licencasContratadas),
      politicaExcedentes,
      valorPorExcedente: politicaExcedentes === 'COBRAR' ? Number(valorPorExcedente) : 0,
      vigenciaInicio,
      vigenciaFim
    };

    try {
      masterService.atualizarContratoEmpresa(empresa.id, payload);
      setModalEdicaoAberto(false);
      window.setTimeout(() => {
        carregarDetalhes();
        onDadosAtualizados();
        setFeedback({
          tipo: 'sucesso',
          texto: 'Contrato e parametros de licencas atualizados com sucesso.'
        });
      }, 0);
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : 'Nao foi possivel atualizar o contrato.';
      setErroEdicao(mensagem);
    }
  };

  const handleAbrirModalStatus = (novoStatus: StatusEmpresa) => {
    setStatusAlvo(novoStatus);
    setMotivoAlteracaoStatus('');
    setModalStatusAberto(true);
  };

  const handleConfirmarAlteracaoStatus = () => {
    if (!empresa) return;

    const novoStatus = statusAlvo;
    const motivo = motivoAlteracaoStatus;

    try {
      masterService.alterarStatusEmpresa(empresa.id, novoStatus, motivo);
      setModalStatusAberto(false);
      window.setTimeout(() => {
        carregarDetalhes();
        onDadosAtualizados();
        setFeedback({
          tipo: 'sucesso',
          texto:
            novoStatus === 'SUSPENSA'
              ? 'Plano suspenso e acessos vinculados revogados imediatamente.'
              : 'Plano reativado com sucesso.'
        });
      }, 0);
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : 'Nao foi possivel alterar o status do plano.';
      setModalStatusAberto(false);
      setFeedback({ tipo: 'erro', texto: mensagem });
    }
  };

  const handleAlternarStatusUsuario = (
    usuario: UsuarioContaMaster,
    novoStatus: StatusUsuarioSistema
  ) => {
    try {
      masterService.alterarStatusUsuario(usuario.id, novoStatus);
      carregarDetalhes();
      onDadosAtualizados();
      const complemento =
        usuario.perfil === 'PJ'
          ? novoStatus === 'BLOQUEADO'
            ? ' Uma licenca PJ foi liberada automaticamente.'
            : ' Uma licenca PJ foi alocada conforme contrato.'
          : '';
      setFeedback({
        tipo: 'sucesso',
        texto: `Conta de ${usuario.nome} ${
          novoStatus === 'BLOQUEADO' ? 'bloqueada' : 'reativada'
        } com sucesso.${complemento}`
      });
    } catch (err) {
      const mensagem =
        err instanceof Error
          ? err.message
          : 'Nao foi possivel alterar o status da conta.';
      setFeedback({ tipo: 'erro', texto: mensagem });
    }
  };

  const handleAbrirModalSenha = (usuario: UsuarioContaMaster) => {
    setUsuarioAlvoSenha(usuario);
    setResultadoSenha(null);
    setModalSenhaAberto(true);
  };

  const handleConfirmarRedefinicaoSenha = () => {
    if (!usuarioAlvoSenha) return;

    try {
      const resultado = masterService.iniciarRedefinicaoSenhaUsuario(usuarioAlvoSenha.id);
      setResultadoSenha(resultado);
      window.setTimeout(() => {
        carregarDetalhes();
      }, 0);
    } catch (err) {
      const mensagem =
        err instanceof Error
          ? err.message
          : 'Nao foi possivel iniciar a redefinicao de senha.';
      setModalSenhaAberto(false);
      setFeedback({ tipo: 'erro', texto: mensagem });
    }
  };

  if (!empresa) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-800">Empresa nao encontrada.</p>
        <button
          type="button"
          onClick={onVoltar}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg"
        >
          <ArrowLeft size={14} />
          <span>Voltar para Empresas</span>
        </button>
      </div>
    );
  }

  const totalGestores = usuarios.filter((u) => u.perfil === 'GESTOR').length;
  const totalPJsAtivos = usuarios.filter(
    (u) => u.perfil === 'PJ' && u.status === 'ATIVO'
  ).length;
  const totalPJsBloqueados = usuarios.filter(
    (u) => u.perfil === 'PJ' && u.status === 'BLOQUEADO'
  ).length;
  const totalUsuariosBloqueadosIndividualmente = usuarios.filter(
    (u) => u.status === 'BLOQUEADO'
  ).length;

  const statusRegraCadastro = masterService.podeAdicionarProfissionalPJ(empresa.id);

  const percentualUso =
    empresa.metricas.licencasContratadas > 0
      ? Math.min(
          100,
          Math.round(
            (empresa.metricas.licencasUtilizadas / empresa.metricas.licencasContratadas) * 100
          )
        )
      : 0;

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium ${
            feedback.tipo === 'sucesso'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.tipo === 'sucesso' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-600 shrink-0" />
            )}
            <span>{feedback.texto}</span>
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
        <div className="space-y-1">
          <button
            type="button"
            onClick={onVoltar}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-1"
          >
            <ArrowLeft size={14} />
            <span>Voltar para Empresas</span>
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">{empresa.nomeFantasia}</h2>
            {empresa.status === 'ATIVA' ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span>Plano Ativo</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                <span>Plano Suspenso</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {empresa.razaoSocial} — CNPJ: {empresa.cnpj}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {empresa.status === 'ATIVA' ? (
            <button
              type="button"
              onClick={() => handleAbrirModalStatus('SUSPENSA')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-sm font-medium rounded-lg transition-colors"
            >
              <PauseCircle size={15} />
              <span>Suspender Plano</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleAbrirModalStatus('ATIVA')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <PlayCircle size={15} />
              <span>Reativar Plano</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAbrirModalEdicao}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Pencil size={15} />
            <span>Editar Contrato e Licencas</span>
          </button>
        </div>
      </div>

      {empresa.status === 'SUSPENSA' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Lock size={18} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <p className="font-bold text-sm">
              Empresa com Plano Suspenso — Acessos Bloqueados
            </p>
            <p>
              Todos os {totalGestores} gestor(es) e {totalPJsAtivos} profissional(is) PJ vinculados estao impedidos de realizar login. Todos os dados cadastrais, registros operacionais e historicos permanecem preservados integralmente.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Licencas Contratadas</span>
            <KeyRound size={18} className="text-slate-700" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {empresa.metricas.licencasContratadas}
          </p>
          <p className="text-xs text-slate-500 mt-1">Teto definido em contrato</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Licencas Utilizadas</span>
            <Users size={18} className="text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {empresa.metricas.licencasUtilizadas}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Somente profissionais PJ ativos ({percentualUso}%)
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Licencas Disponiveis</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {empresa.metricas.licencasDisponiveis}
          </p>
          <p className="text-xs text-slate-500 mt-1">Saldo imediato sem excedente</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Excedentes Ativos</span>
            <AlertTriangle
              size={18}
              className={
                empresa.metricas.licencasExcedentes > 0 ? 'text-amber-600' : 'text-slate-400'
              }
            />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {empresa.metricas.licencasExcedentes}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Adicional: {formatarMoeda(empresa.metricas.cobrancaAdicionalMensal)}/mes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 size={18} className="text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Dados Cadastrais da Empresa</h3>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs font-semibold text-slate-400 uppercase">Razao Social</dt>
              <dd className="text-slate-900 font-medium mt-0.5">{empresa.razaoSocial}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400 uppercase">Nome Fantasia</dt>
              <dd className="text-slate-900 font-medium mt-0.5">{empresa.nomeFantasia}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400 uppercase">CNPJ</dt>
              <dd className="text-slate-900 font-mono text-xs mt-1">{empresa.cnpj}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400 uppercase">Data de Cadastro</dt>
              <dd className="text-slate-900 font-medium mt-0.5">{empresa.dataCadastro}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400 uppercase">E-mail de Contato</dt>
              <dd className="text-slate-900 font-medium mt-0.5">{empresa.emailContato}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400 uppercase">Telefone</dt>
              <dd className="text-slate-900 font-medium mt-0.5">{empresa.telefoneContato}</dd>
            </div>
          </dl>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap gap-4">
            <span>
              Gestores vinculados: <strong className="text-slate-800">{totalGestores}</strong> (isentos de licenca)
            </span>
            <span>
              PJs bloqueados/inativos: <strong className="text-slate-800">{totalPJsBloqueados}</strong> (nao consomem licenca)
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText size={18} className="text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Informacoes Comerciais e Politica de Excedentes
            </h3>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs font-semibold text-slate-400 uppercase">Plano Contratado</dt>
              <dd className="text-slate-900 font-semibold mt-0.5">{empresa.plano}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400 uppercase">Vigencia do Contrato</dt>
              <dd className="text-slate-900 font-medium mt-0.5">
                {empresa.vigenciaInicio} ate {empresa.vigenciaFim}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400 uppercase">Valor Base Mensal</dt>
              <dd className="text-slate-900 font-medium mt-0.5">
                {formatarMoeda(empresa.valorContratoBase)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400 uppercase">Valor Total Mensal</dt>
              <dd className="text-indigo-700 font-bold mt-0.5">
                {formatarMoeda(empresa.metricas.valorTotalMensal)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400 uppercase">Politica de Excedentes</dt>
              <dd className="text-slate-900 font-medium mt-0.5">
                <span>
                  {empresa.politicaExcedentes === 'BLOQUEAR'
                    ? 'Opcao A - Bloquear excedentes'
                    : 'Opcao B - Permitir com cobranca'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400 uppercase">Valor por Excedente</dt>
              <dd className="text-slate-900 font-medium mt-0.5">
                <span>
                  {empresa.politicaExcedentes === 'COBRAR'
                    ? `${formatarMoeda(empresa.valorPorExcedente)} / mes por PJ`
                    : 'Nao aplicavel'}
                </span>
              </dd>
            </div>
          </dl>

          <div
            className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
              statusRegraCadastro.permitido
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <ShieldCheck size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                <span>Status do Motor de Licencas: </span>
                <span>
                  {statusRegraCadastro.permitido
                    ? 'Liberado para inclusao e reativacao de profissionais PJ'
                    : 'Bloqueado para novas inclusoes ou reativacoes PJ'}
                </span>
              </p>
              {statusRegraCadastro.motivo && (
                <p className="mt-0.5 opacity-90">{statusRegraCadastro.motivo}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Colaboradores e Contas Vinculadas ({usuarios.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Controle administrativo de acesso. Apenas profissionais PJ ativos consomem licencas do contrato.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={buscaUsuario}
                onChange={(e) => setBuscaUsuario(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {(['TODOS', 'GESTOR', 'PJ'] as const).map((perfil) => (
                <button
                  key={perfil}
                  type="button"
                  onClick={() => setFiltroPerfil(perfil)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filtroPerfil === perfil
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>
                    {perfil === 'TODOS'
                      ? 'Todos'
                      : perfil === 'GESTOR'
                      ? 'Gestores'
                      : 'Profissionais PJ'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 px-6 font-semibold">Usuario</th>
                <th className="py-3 px-6 font-semibold">Perfil</th>
                <th className="py-3 px-6 font-semibold">Criacao</th>
                <th className="py-3 px-6 font-semibold">Ultimo Acesso</th>
                <th className="py-3 px-6 font-semibold">Status da Conta</th>
                <th className="py-3 px-6 font-semibold text-right">Seguranca e Acesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-6 text-center text-slate-500 text-xs">
                    Nenhum usuario vinculado encontrado para os filtros informados.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900">{usr.nome}</div>
                      <div className="text-xs text-slate-500">{usr.email}</div>
                      {usr.exigirTrocaSenha && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <span>Troca de senha pendente no proximo login</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6">
                      {usr.perfil === 'GESTOR' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <span>Gestor</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
                          <span>Profissional PJ</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-600">{usr.dataCriacao}</td>
                    <td className="py-3.5 px-6 text-xs text-slate-600">{usr.ultimoLogin}</td>
                    <td className="py-3.5 px-6">
                      <div className="flex flex-col items-start gap-1">
                        {usr.status === 'ATIVO' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span>Ativo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            <span>Bloqueado</span>
                          </span>
                        )}
                        {empresa.status === 'SUSPENSA' && usr.status === 'ATIVO' && (
                          <span className="text-[11px] text-amber-700 font-medium">
                            <span>Suspenso pelo plano da empresa</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleAbrirModalSenha(usr)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                          title="Iniciar redefinicao segura de senha"
                        >
                          <KeyRound size={13} />
                          <span>Redefinir Senha</span>
                        </button>

                        {usr.status === 'ATIVO' ? (
                          <button
                            type="button"
                            onClick={() => handleAlternarStatusUsuario(usr, 'BLOQUEADO')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-medium transition-colors"
                          >
                            <UserX size={13} />
                            <span>Bloquear</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAlternarStatusUsuario(usr, 'ATIVO')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium transition-colors"
                          >
                            <UserCheck size={13} />
                            <span>Reativar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
          <History size={18} className="text-indigo-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Historico Administrativo e de Acessos da Empresa
            </h3>
            <p className="text-xs text-slate-500">
              Registro cronologico de alteracoes contratuais, suspensoes, bloqueios e seguranca de contas.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {logsEmpresa.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Nenhuma atividade administrativa registrada para esta empresa ate o momento.
            </div>
          ) : (
            logsEmpresa.map((log) => (
              <div
                key={log.id}
                className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {log.acao}
                    </span>
                    <span className="text-slate-400">por {log.atorNome}</span>
                  </div>
                  <p className="text-slate-700">{log.detalhes}</p>
                </div>
                <span className="text-slate-400 font-mono shrink-0">{log.dataHora}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {modalSenhaAberto && usuarioAlvoSenha && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Redefinicao Segura de Senha
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalSenhaAberto(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!resultadoSenha ? (
                <>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                    <p className="font-bold text-slate-900 text-sm">
                      {usuarioAlvoSenha.nome}
                    </p>
                    <p className="text-slate-600 flex items-center gap-1.5">
                      <Mail size={13} className="text-slate-400" />
                      <span>{usuarioAlvoSenha.email}</span>
                    </p>
                    <p className="text-slate-500 pt-1">
                      Perfil: <strong>{usuarioAlvoSenha.perfil}</strong>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Por politica de seguranca do Clingest PJ, senhas nunca sao exibidas no painel administrativo. Ao confirmar, um link criptografado de recuperacao sera enviado para o e-mail do usuario e a definicao de uma nova senha sera exigida no proximo acesso.
                  </p>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setModalSenhaAberto(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                    >
                      <span>Cancelar</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmarRedefinicaoSenha}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      <span>Disparar Redefinicao Segura</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-900">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Solicitacao de Redefinicao Registrada</span>
                    </div>
                    <p>
                      As instrucoes de recuperacao foram encaminhadas para{' '}
                      <strong>{resultadoSenha.usuarioEmail}</strong>.
                    </p>
                    <div className="pt-2 border-t border-emerald-200/70 flex items-center justify-between font-mono text-[11px]">
                      <span>Protocolo: {resultadoSenha.protocolo}</span>
                      <span>{resultadoSenha.dataHora}</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setModalSenhaAberto(false)}
                      className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <span>Concluir</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {modalStatusAberto && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                {statusAlvo === 'SUSPENSA' ? (
                  <PauseCircle size={18} className="text-amber-600" />
                ) : (
                  <PlayCircle size={18} className="text-emerald-600" />
                )}
                <h3 className="text-base font-bold text-slate-900">
                  <span>
                    {statusAlvo === 'SUSPENSA'
                      ? 'Confirmar Suspensao do Plano'
                      : 'Confirmar Reativacao do Plano'}
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalStatusAberto(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {statusAlvo === 'SUSPENSA' ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                  <p className="font-bold text-sm">
                    Atencao aos efeitos imediatos da suspensao:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      Todos os <strong>{totalGestores} gestor(es)</strong> e{' '}
                      <strong>{totalPJsAtivos} profissional(is) PJ</strong> vinculados a{' '}
                      <strong>{empresa.nomeFantasia}</strong> perderao o acesso imediatamente.
                    </li>
                    <li>
                      Nenhum usuario da empresa conseguira realizar login enquanto o plano estiver suspenso.
                    </li>
                    <li>
                      Todos os dados da empresa, cadastros e historicos operacionais serao preservados integralmente.
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-2">
                  <p className="font-bold text-sm">
                    Efeitos da reativacao contratual:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      A empresa <strong>{empresa.nomeFantasia}</strong> voltara ao status Ativo e retomara o faturamento recorrente.
                    </li>
                    <li>
                      Gestores e profissionais PJ ativos poderao realizar login novamente.
                    </li>
                    <li>
                      Contas com bloqueio individual previo ({totalUsuariosBloqueadosIndividualmente} usuario(s)) permanecerao bloqueadas por seguranca.
                    </li>
                  </ul>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo / Observacao Administrativa (Opcional)
                </label>
                <input
                  type="text"
                  value={motivoAlteracaoStatus}
                  onChange={(e) => setMotivoAlteracaoStatus(e.target.value)}
                  placeholder={
                    statusAlvo === 'SUSPENSA'
                      ? 'Ex: Pendencia financeira ou solicitacao contratual'
                      : 'Ex: Regularizacao financeira confirmada'
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalStatusAberto(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                >
                  <span>Cancelar</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarAlteracaoStatus}
                  className={`px-5 py-2 text-white text-sm font-medium rounded-lg transition-colors shadow-sm ${
                    statusAlvo === 'SUSPENSA'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <span>
                    {statusAlvo === 'SUSPENSA'
                      ? 'Suspender Plano Agora'
                      : 'Reativar Plano Agora'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalEdicaoAberto && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full my-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Pencil size={16} className="text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Editar Contrato e Regras de Licencas
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalEdicaoAberto(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {erroEdicao && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-xs text-red-700 font-medium">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{erroEdicao}</span>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                  Dados Cadastrais
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Razao Social
                    </label>
                    <input
                      type="text"
                      value={razaoSocial}
                      onChange={(e) => setRazaoSocial(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome Fantasia
                    </label>
                    <input
                      type="text"
                      value={nomeFantasia}
                      onChange={(e) => setNomeFantasia(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      E-mail de Contato
                    </label>
                    <input
                      type="email"
                      value={emailContato}
                      onChange={(e) => setEmailContato(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Telefone de Contato
                    </label>
                    <input
                      type="text"
                      value={telefoneContato}
                      onChange={(e) => setTelefoneContato(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                  Parametros Comerciais e Motor de Licencas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Plano Contratado
                    </label>
                    <input
                      type="text"
                      value={plano}
                      onChange={(e) => setPlano(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Valor Base Mensal (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={valorContratoBase}
                      onChange={(e) => setValorContratoBase(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Licencas PJ Contratadas
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={licencasContratadas}
                      onChange={(e) => setLicencasContratadas(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Politica de Excedentes
                    </label>
                    <select
                      value={politicaExcedentes}
                      onChange={(e) =>
                        setPoliticaExcedentes(e.target.value as PoliticaExcedentes)
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="BLOQUEAR">Opcao A - Bloquear excedentes no limite</option>
                      <option value="COBRAR">Opcao B - Permitir excedentes com cobranca</option>
                    </select>
                  </div>

                  {politicaExcedentes === 'COBRAR' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Valor por Excedente (R$/mes)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        value={valorPorExcedente}
                        onChange={(e) => setValorPorExcedente(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Inicio da Vigencia
                    </label>
                    <input
                      type="date"
                      value={vigenciaInicio}
                      onChange={(e) => setVigenciaInicio(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fim da Vigencia
                    </label>
                    <input
                      type="date"
                      value={vigenciaFim}
                      onChange={(e) => setVigenciaFim(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalEdicaoAberto(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                >
                  <span>Cancelar</span>
                </button>
                <button
                  type="button"
                  onClick={handleSalvarEdicao}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  <span>Salvar Alteracoes Contratuais</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};