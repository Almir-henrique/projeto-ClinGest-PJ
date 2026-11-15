import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Plus,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
  Building2,
  UserCheck,
  UserX
} from 'lucide-react';
import { api } from '../services/api';
import { masterService } from '../services/masterService';
import { useToast } from '../context/ToastContext';
import type { PrestadorPJ, SituacaoPrestador } from '../types/prestador';
import type { TarefaPJ } from '../types/tarefa';
import type { UsuarioSistema } from '../types/usuario';
import type { EmpresaComMetricas } from '../types/master';

interface PainelGestorProps {
  usuarioLogado?: UsuarioSistema;
}

const STORAGE_PRESTADORES = '@clingest_prestadores';
const STORAGE_USUARIOS_SISTEMA = '@clingest_usuarios';
const STORAGE_USUARIOS_MASTER = 'clingest_usuarios_admin';

export const PainelGestor: React.FC<PainelGestorProps> = ({ usuarioLogado }) => {
  const [prestadores, setPrestadores] = useState<PrestadorPJ[]>([]);
  const [tarefas, setTarefas] = useState<TarefaPJ[]>([]);
  const [empresaInfo, setEmpresaInfo] = useState<EmpresaComMetricas | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Estados do formulário de cadastro de funcionário/prestador pela clínica
  const [nome, setNome] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [servico, setServico] = useState('');
  const [valorBase, setValorBase] = useState(75.0);
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const { showToast } = useToast();
  const empresaId = usuarioLogado?.empresaId;

  const sincronizarPrestadoresDaEmpresa = (
    todosPrestadores: PrestadorPJ[],
    idEmpresa?: string
  ): PrestadorPJ[] => {
    if (!idEmpresa) {
      return todosPrestadores;
    }

    const contasMasterEmpresa = masterService
      .getUsuariosPorEmpresa(idEmpresa)
      .filter((u) => u.perfil === 'PJ');

    const listaAtualizada = [...todosPrestadores];
    let houveAlteracao = false;

    contasMasterEmpresa.forEach((conta) => {
      const jaExiste = listaAtualizada.some(
        (p) =>
          p.id === conta.id ||
          p.email.toLowerCase() === conta.email.toLowerCase()
      );

      if (!jaExiste) {
        listaAtualizada.push({
          id: conta.id,
          empresaId: idEmpresa,
          nome: conta.nome,
          razaoSocial: `${conta.nome} Servicos Medicos LTDA`,
          cnpj: '00.000.000/0001-00',
          email: conta.email,
          servico: 'Atendimento Clinico PJ',
          remuneracao: 'POR_HORA',
          valorBase: 80.0,
          contratoStatus: 'VIGENTE',
          situacao: conta.status === 'ATIVO' ? 'ATIVO' : 'INATIVO',
          usuario: conta.usuario || conta.email.split('@')[0],
          senha: conta.senha || '123',
          criadoEm: conta.dataCriacao
        });
        houveAlteracao = true;
      }
    });

    if (houveAlteracao) {
      localStorage.setItem(STORAGE_PRESTADORES, JSON.stringify(listaAtualizada));
    }

    return listaAtualizada.filter((p) => p.empresaId === idEmpresa);
  };

  const carregarDados = async () => {
    const listaPrestadores = await api.getPrestadores();
    const prestadoresFiltrados = sincronizarPrestadoresDaEmpresa(
      listaPrestadores,
      empresaId
    );
    setPrestadores(prestadoresFiltrados);

    const idsEquipe = new Set(prestadoresFiltrados.map((p) => p.id));
    const listaTarefas = await api.getTarefas();
    const tarefasFiltradas = empresaId
      ? listaTarefas.filter((t) => idsEquipe.has(t.prestadorId))
      : listaTarefas;
    setTarefas(tarefasFiltradas);

    if (empresaId) {
      const dadosEmpresa = masterService.getEmpresaComMetricasById(empresaId);
      setEmpresaInfo(dadosEmpresa);
    } else {
      setEmpresaInfo(null);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [empresaId]);

  const limitePlanoEmpresa = empresaInfo?.licencasContratadas ?? 10;
  const politicaExcedentes = empresaInfo?.politicaExcedentes ?? 'BLOQUEAR';
  const valorPorExcedente = empresaInfo?.valorPorExcedente ?? 0;

  const totalAtivos = useMemo(
    () => prestadores.filter((p) => p.situacao === 'ATIVO').length,
    [prestadores]
  );

  const atingiuLimiteBase = totalAtivos >= limitePlanoEmpresa;
  const bloqueadoPorLimite =
    atingiuLimiteBase && politicaExcedentes === 'BLOQUEAR';
  const emCobrancaExcedente =
    atingiuLimiteBase && politicaExcedentes === 'COBRAR';

  const registrarCredenciaisNoSistema = (novoPrestador: PrestadorPJ) => {
    const nomeEmpresa =
      empresaInfo?.nomeFantasia ||
      usuarioLogado?.empresaNome ||
      'Clinica Contratante';

    // 1. Garante persistência dos campos multi-tenant no storage de prestadores
    const prestadoresAtuais: PrestadorPJ[] = JSON.parse(
      localStorage.getItem(STORAGE_PRESTADORES) || '[]'
    );
    const prestadoresAtualizados = prestadoresAtuais.map((p) =>
      p.id === novoPrestador.id ||
      p.email.toLowerCase() === novoPrestador.email.toLowerCase()
        ? {
            ...p,
            empresaId: novoPrestador.empresaId,
            usuario: novoPrestador.usuario,
            senha: novoPrestador.senha
          }
        : p
    );
    localStorage.setItem(
      STORAGE_PRESTADORES,
      JSON.stringify(prestadoresAtualizados)
    );

    // 2. Sincroniza no banco de usuários do sistema (@clingest_usuarios)
    const usuariosSistema: UsuarioSistema[] = JSON.parse(
      localStorage.getItem(STORAGE_USUARIOS_SISTEMA) || '[]'
    );
    const jaExisteUsuario = usuariosSistema.some(
      (u) => u.email.toLowerCase() === novoPrestador.email.toLowerCase()
    );

    if (!jaExisteUsuario) {
      const novoUsuarioSistema: UsuarioSistema = {
        id: novoPrestador.id,
        empresaId: novoPrestador.empresaId,
        empresaNome: nomeEmpresa,
        nome: novoPrestador.nome,
        email: novoPrestador.email,
        usuario: novoPrestador.usuario || novoPrestador.email.split('@')[0],
        senha: novoPrestador.senha || '123',
        perfil: 'PRESTADOR',
        prestadorId: novoPrestador.id,
        ativo: novoPrestador.situacao === 'ATIVO',
        criadoEm: novoPrestador.criadoEm
      };
      localStorage.setItem(
        STORAGE_USUARIOS_SISTEMA,
        JSON.stringify([novoUsuarioSistema, ...usuariosSistema])
      );
    }

    // 3. Sincroniza na base consolidada da Área Master (clingest_usuarios_admin)
    if (novoPrestador.empresaId) {
      const usuariosMaster = JSON.parse(
        localStorage.getItem(STORAGE_USUARIOS_MASTER) || '[]'
      );
      const jaExisteMaster = usuariosMaster.some(
        (u: { email?: string }) =>
          u.email?.toLowerCase() === novoPrestador.email.toLowerCase()
      );
      if (!jaExisteMaster) {
        usuariosMaster.unshift({
          id: novoPrestador.id,
          empresaId: novoPrestador.empresaId,
          empresaNome: nomeEmpresa,
          nome: novoPrestador.nome,
          usuario: novoPrestador.usuario || novoPrestador.email.split('@')[0],
          email: novoPrestador.email.toLowerCase(),
          senha: novoPrestador.senha || '123',
          perfil: 'PJ',
          dataCriacao: novoPrestador.criadoEm,
          ultimoLogin: 'Nunca acessou',
          status: novoPrestador.situacao === 'ATIVO' ? 'ATIVO' : 'BLOQUEADO'
        });
        localStorage.setItem(
          STORAGE_USUARIOS_MASTER,
          JSON.stringify(usuariosMaster)
        );
      }
    }
  };

  const handleAbrirModalNovo = () => {
    if (bloqueadoPorLimite) {
      showToast(
        `Limite de ${limitePlanoEmpresa} licencas PJ atingido no plano ${
          empresaInfo?.plano || 'atual'
        }. Solicite upgrade ao suporte Master.`,
        'error'
      );
      return;
    }
    setModalAberto(true);
  };

  const handleCadastrarFuncionario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (empresaId) {
      const validacao = masterService.podeAdicionarProfissionalPJ(empresaId);
      if (!validacao.permitido) {
        showToast(
          validacao.motivo || 'Limite de licencas PJ atingido para esta empresa.',
          'error'
        );
        return;
      }
    } else if (bloqueadoPorLimite) {
      showToast(
        'Limite de funcionarios atingido para o seu plano atual!',
        'error'
      );
      return;
    }

    const emailNormalizado = email.trim().toLowerCase();
    const usuarioNormalizado = usuario.trim();

    if (
      !nome.trim() ||
      !cnpj.trim() ||
      !emailNormalizado ||
      !usuarioNormalizado ||
      !senha.trim()
    ) {
      showToast('Preencha todos os campos obrigatorios.', 'error');
      return;
    }

    const emailEmUso = prestadores.some(
      (p) => p.email.toLowerCase() === emailNormalizado
    );
    const usuarioEmUso = prestadores.some(
      (p) => (p.usuario || '').toLowerCase() === usuarioNormalizado.toLowerCase()
    );

    if (emailEmUso || usuarioEmUso) {
      showToast('Ja existe um profissional com este usuario ou e-mail.', 'error');
      return;
    }

    const listaAtualizada = await api.salvarPrestador({
      empresaId,
      nome: nome.trim(),
      razaoSocial: razaoSocial.trim(),
      cnpj: cnpj.trim(),
      email: emailNormalizado,
      servico: servico.trim(),
      remuneracao: 'POR_HORA',
      valorBase: Number(valorBase),
      contratoStatus: 'VIGENTE',
      situacao: 'ATIVO',
      usuario: usuarioNormalizado,
      senha: senha.trim()
    });

    const salvo = listaAtualizada[0];
    if (salvo) {
      registrarCredenciaisNoSistema({
        ...salvo,
        empresaId,
        usuario: usuarioNormalizado,
        senha: senha.trim()
      });
    }

    if (emCobrancaExcedente && valorPorExcedente > 0) {
      showToast(
        `Profissional cadastrado como licenca excedente (+R$ ${valorPorExcedente.toFixed(
          2
        )}/mes).`,
        'success'
      );
    } else {
      showToast('Profissional PJ cadastrado e acesso liberado!', 'success');
    }

    setNome('');
    setRazaoSocial('');
    setCnpj('');
    setEmail('');
    setServico('');
    setValorBase(75.0);
    setUsuario('');
    setSenha('');
    setMostrarSenha(false);
    setModalAberto(false);
    carregarDados();
  };

  const handleAlternarSituacaoPrestador = (prestador: PrestadorPJ) => {
    const novaSituacao: SituacaoPrestador =
      prestador.situacao === 'ATIVO' ? 'INATIVO' : 'ATIVO';

    if (novaSituacao === 'ATIVO' && empresaId) {
      const validacao = masterService.podeReativarProfissionalPJ(empresaId);
      if (!validacao.permitido) {
        showToast(
          validacao.motivo ||
            'Limite de licencas atingido para reativar este profissional.',
          'error'
        );
        return;
      }
    }

    const prestadoresAtuais: PrestadorPJ[] = JSON.parse(
      localStorage.getItem(STORAGE_PRESTADORES) || '[]'
    );
    const atualizados = prestadoresAtuais.map((p) =>
      p.id === prestador.id ? { ...p, situacao: novaSituacao } : p
    );
    localStorage.setItem(STORAGE_PRESTADORES, JSON.stringify(atualizados));

    // Sincroniza status na base de usuários
    const usuariosSistema: UsuarioSistema[] = JSON.parse(
      localStorage.getItem(STORAGE_USUARIOS_SISTEMA) || '[]'
    );
    localStorage.setItem(
      STORAGE_USUARIOS_SISTEMA,
      JSON.stringify(
        usuariosSistema.map((u) =>
          u.id === prestador.id ||
          u.email.toLowerCase() === prestador.email.toLowerCase()
            ? { ...u, ativo: novaSituacao === 'ATIVO' }
            : u
        )
      )
    );

    const usuariosMaster = JSON.parse(
      localStorage.getItem(STORAGE_USUARIOS_MASTER) || '[]'
    );
    localStorage.setItem(
      STORAGE_USUARIOS_MASTER,
      JSON.stringify(
        usuariosMaster.map(
          (u: { id?: string; email?: string; status?: string }) =>
            u.id === prestador.id ||
            u.email?.toLowerCase() === prestador.email.toLowerCase()
              ? { ...u, status: novaSituacao === 'ATIVO' ? 'ATIVO' : 'BLOQUEADO' }
              : u
        )
      )
    );

    showToast(
      novaSituacao === 'ATIVO'
        ? `${prestador.nome} reativado (1 licenca alocada).`
        : `${prestador.nome} inativado (1 licenca liberada).`,
      'success'
    );
    carregarDados();
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-7 h-7 text-indigo-600" />
              {empresaInfo?.nomeFantasia ||
                usuarioLogado?.empresaNome ||
                'Painel da Clinica'}
            </h1>
            {empresaInfo?.plano && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                <Building2 size={12} />
                Plano {empresaInfo.plano}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Controle interno de prestadores PJ, credenciais de acesso e aprovacao de plantoes
          </p>
        </div>

        <button
          onClick={handleAbrirModalNovo}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition shadow-sm font-medium text-sm ${
            bloqueadoPorLimite
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <Plus className="w-5 h-5" /> Novo Funcionario / Prestador
        </button>
      </div>

      {/* Alerta de Consumo de Licenças do Plano */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          bloqueadoPorLimite
            ? 'bg-red-50 border-red-200 text-red-900'
            : emCobrancaExcedente
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          {bloqueadoPorLimite || emCobrancaExcedente ? (
            <AlertTriangle
              className={`w-6 h-6 shrink-0 ${
                bloqueadoPorLimite ? 'text-red-600' : 'text-amber-600'
              }`}
            />
          ) : (
            <Users className="w-6 h-6 text-indigo-600 shrink-0" />
          )}
          <div>
            <h4 className="font-bold text-sm">Ocupacao do Plano Contratado</h4>
            <p className="text-xs opacity-85">
              {bloqueadoPorLimite
                ? `Limite maximo de ${limitePlanoEmpresa} licencas PJ atingido. Inative um profissional ou solicite upgrade ao administrador Master.`
                : emCobrancaExcedente
                ? `Limite base de ${limitePlanoEmpresa} licencas atingido. Novos profissionais ativos geram cobranca adicional de R$ ${valorPorExcedente.toFixed(
                    2
                  )}/mes.`
                : `Voce esta utilizando ${totalAtivos} de ${limitePlanoEmpresa} licencas de profissionais PJ contratadas.`}
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <span
            className={`text-lg font-bold ${
              bloqueadoPorLimite
                ? 'text-red-600'
                : emCobrancaExcedente
                ? 'text-amber-700'
                : 'text-indigo-600'
            }`}
          >
            {totalAtivos} / {limitePlanoEmpresa}
          </span>
          <span className="block text-[10px] uppercase font-semibold text-slate-400">
            Licencas PJ Ativas
          </span>
        </div>
      </div>

      {/* Lista de Profissionais da Clínica */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
          <span>Profissionais e Credenciais Vinculadas</span>
          <span className="text-xs font-normal text-slate-500">
            {prestadores.length} cadastrado(s)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-semibold">Profissional / Especialidade</th>
                <th className="p-4 font-semibold">CNPJ / Razao Social</th>
                <th className="p-4 font-semibold">Credencial (Login)</th>
                <th className="p-4 font-semibold">Valor Base Hora</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Acesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {prestadores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                    Nenhum profissional PJ cadastrado nesta empresa ainda. Clique em{' '}
                    <strong>Novo Funcionario / Prestador</strong> para adicionar.
                  </td>
                </tr>
              ) : (
                prestadores.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-medium text-slate-800">
                      {p.nome}
                      <span className="block text-xs text-slate-400 font-normal">
                        {p.servico}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {p.cnpj}
                      <span className="block text-xs text-slate-400 font-normal">
                        {p.razaoSocial}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-indigo-600 font-semibold">
                      {p.usuario || p.email}
                      <span className="block text-[11px] font-sans font-normal text-slate-400">
                        {p.email}
                      </span>
                    </td>
                    <td className="p-4 text-emerald-600 font-bold">
                      R$ {Number(p.valorBase || 0).toFixed(2)}/h
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                          p.situacao === 'ATIVO'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {p.situacao}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleAlternarSituacaoPrestador(p)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          p.situacao === 'ATIVO'
                            ? 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={
                          p.situacao === 'ATIVO'
                            ? 'Inativar profissional e liberar licenca'
                            : 'Reativar profissional'
                        }
                      >
                        {p.situacao === 'ATIVO' ? (
                          <>
                            <UserX size={14} /> Inativar
                          </>
                        ) : (
                          <>
                            <UserCheck size={14} /> Reativar
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apontamentos / Horas Enviadas para Aprovação */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 font-semibold text-slate-800 flex justify-between items-center">
          <span>Aprovacao de Atendimentos e Horas da Equipe</span>
          <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium">
            {tarefas.filter((t) => t.status === 'PENDENTE').length} pendente(s)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-semibold">Profissional</th>
                <th className="p-4 font-semibold">Paciente</th>
                <th className="p-4 font-semibold">Horas / Valor Total</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Acao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {tarefas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                    Nenhum apontamento de horas registrado pela equipe ate o momento.
                  </td>
                </tr>
              ) : (
                tarefas.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-medium text-slate-800">
                      {t.prestadorNome}
                    </td>
                    <td className="p-4 text-slate-600">
                      {t.pacienteNome || 'Nao especificado'}
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      {t.horasTrabalhadas}h{' '}
                      <span className="text-xs text-emerald-600 font-normal">
                        (R$ {t.valorEntrega.toFixed(2)})
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          t.status === 'APROVADO'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {t.status === 'PENDENTE' && (
                        <button
                          onClick={async () => {
                            await api.atualizarStatusTarefa(t.id, 'APROVADO');
                            carregarDados();
                          }}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition"
                        >
                          Aprovar Horas
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

      {/* Modal de Cadastro de Funcionário / Prestador */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-800">
                Cadastrar Novo Profissional (Funcionario PJ)
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {emCobrancaExcedente && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                Atencao: sua clinica ja atingiu as {limitePlanoEmpresa} licencas base. Este
                cadastro adicionara <strong>R$ {valorPorExcedente.toFixed(2)}/mes</strong> na
                fatura da empresa.
              </div>
            )}

            <form onSubmit={handleCadastrarFuncionario} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: Dra. Juliana Souza"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Razao Social
                  </label>
                  <input
                    type="text"
                    required
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: Souza Saude S/S"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    required
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="email@clinica.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Especialidade / Servico
                  </label>
                  <input
                    type="text"
                    required
                    value={servico}
                    onChange={(e) => setServico(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: Enfermagem UTI"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Valor da Hora Base (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={valorBase}
                  onChange={(e) => setValorBase(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs font-bold text-slate-700 mb-2">
                  Credenciais de Acesso do Funcionario
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Nome de Usuario (Login)
                    </label>
                    <input
                      type="text"
                      required
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                      placeholder="juliana.souza"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Senha Provisoria
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarSenha ? 'text' : 'password'}
                        required
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl p-3 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Minimo 4 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenha(!mostrarSenha)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
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
                  Cadastrar e Gerar Acesso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};