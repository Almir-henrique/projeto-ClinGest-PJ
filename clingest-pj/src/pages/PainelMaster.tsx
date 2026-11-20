import { useMemo, useState, type FC, type FormEvent } from 'react';
import {
  Building2,
  Plus,
  Power,
  Users,
  DollarSign,
  Sliders,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  KeyRound,
  Search,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import type { EmpresaTenant, RegraNegocioSaaS } from '../types/contrato';
import type { PrestadorPJ } from '../types/prestador';
import type {
  CredencialMasterView,
  RegistroMovimentacaoAcesso,
  UsuarioSistema
} from '../types/usuario';
import { api, apiEmpresas } from '../services/api';

interface PainelMasterProps {
  usuario: UsuarioSistema;
  onLogout: () => void;
}

export const PainelMaster: FC<PainelMasterProps> = ({ usuario, onLogout }) => {
  const [empresas, setEmpresas] = useState<EmpresaTenant[]>(() =>
    apiEmpresas.getEmpresas()
  );
  const [prestadores] = useState<PrestadorPJ[]>(() => api.getPrestadores());
  const [regras, setRegras] = useState<RegraNegocioSaaS>(() =>
    api.getRegrasNegocio()
  );
  const [credenciais, setCredenciais] = useState<CredencialMasterView[]>(() =>
    api.getCredenciaisConsolidadas()
  );
  const [acessos] = useState<RegistroMovimentacaoAcesso[]>(() =>
    api.getMovimentacoesAcesso()
  );

  const [busca, setBusca] = useState('');
  const [mostrarSenhas, setMostrarSenhas] = useState(false);
  const [feedbackRegra, setFeedbackRegra] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [limitePrestadores, setLimitePrestadores] = useState(
    regras.limitePadraoLicencas
  );
  const [valorMensalidade, setValorMensalidade] = useState(
    regras.mensalidadePadrao
  );
  const [responsavelNome, setResponsavelNome] = useState('');
  const [responsavelEmail, setResponsavelEmail] = useState('');
  const [senhaGestor, setSenhaGestor] = useState('');

  const metricas = useMemo(() => {
    const ativas = empresas.filter((e) => e.status === 'ATIVO');
    const inativas = empresas.filter((e) => e.status !== 'ATIVO');
    const rendimentoMensal = ativas.reduce(
      (acc, emp) => acc + Number(emp.valorMensalidade || 0),
      0
    );
    const licencasTotais = ativas.reduce(
      (acc, emp) => acc + Number(emp.limitePrestadores || 0),
      0
    );
    const licencasConsumidas = prestadores.filter((p) => {
      const emp = ativas.find((e) => e.id === p.empresaId);
      return p.situacao === 'ATIVO' && Boolean(emp);
    }).length;

    return {
      rendimentoMensal,
      ativas: ativas.length,
      inativas: inativas.length,
      licencasTotais,
      licencasConsumidas
    };
  }, [empresas, prestadores]);

  const abrirModalCadastro = () => {
    setNomeFantasia('');
    setRazaoSocial('');
    setCnpj('');
    setLimitePrestadores(regras.limitePadraoLicencas);
    setValorMensalidade(regras.mensalidadePadrao);
    setResponsavelNome('');
    setResponsavelEmail('');
    setSenhaGestor('');
    setModalAberto(true);
  };

  const handleCadastrarEmpresa = (e: FormEvent) => {
    e.preventDefault();
    if (
      !nomeFantasia.trim() ||
      !cnpj.trim() ||
      !responsavelEmail.trim() ||
      !senhaGestor.trim()
    ) {
      return;
    }

    const atualizadas = apiEmpresas.salvarEmpresa({
      nomeFantasia: nomeFantasia.trim(),
      razaoSocial: razaoSocial.trim() || nomeFantasia.trim(),
      cnpj: cnpj.trim(),
      limitePrestadores: Number(limitePrestadores),
      valorMensalidade: Number(valorMensalidade),
      responsavelNome:
        responsavelNome.trim() || `Gestor ${nomeFantasia.trim()}`,
      responsavelEmail: responsavelEmail.trim().toLowerCase(),
      senhaGestor: senhaGestor.trim()
    });

    setEmpresas(atualizadas);
    setCredenciais(api.getCredenciaisConsolidadas());
    setModalAberto(false);
  };

  const handleAlternarContrato = (empresaId: string) => {
    const atualizadas = apiEmpresas.alternarStatusContrato(empresaId);
    setEmpresas(atualizadas);
    setCredenciais(api.getCredenciaisConsolidadas());
  };

  const handleAtualizarRegras = (novas: RegraNegocioSaaS) => {
    setRegras(novas);
    api.salvarRegrasNegocio(novas);
    setFeedbackRegra(true);
    setTimeout(() => setFeedbackRegra(false), 1800);
  };

  const handleRedefinirSenha = (email: string, senhaAtual: string) => {
    const nova = window.prompt(`Nova senha de acesso para ${email}:`, senhaAtual);
    if (!nova || !nova.trim()) return;
    api.redefinirSenhaUsuario(email, nova.trim());
    setEmpresas(apiEmpresas.getEmpresas());
    setCredenciais(api.getCredenciaisConsolidadas());
  };

  const credenciaisFiltradas = useMemo(() => {
    const termo = busca.toLowerCase();
    return credenciais.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        c.email.toLowerCase().includes(termo) ||
        c.empresaNome.toLowerCase().includes(termo)
    );
  }, [credenciais, busca]);

  const formatarMoeda = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 text-lg">Clingest PJ</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-900 text-white">
              <ShieldCheck className="w-3.5 h-3.5" />
              Master SaaS
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{usuario.nome}</p>
              <p className="text-xs text-slate-500">{usuario.email}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Controle Central da Plataforma
            </h1>
            <p className="text-sm text-slate-500">
              Contratos ativos, licenças consumidas, regras de negócio e controle de acessos.
            </p>
          </div>

          <button
            type="button"
            onClick={abrirModalCadastro}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Empresa / Clínica
          </button>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Rendimento Mensal</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {formatarMoeda(metricas.rendimentoMensal)}
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              Receita recorrente de contratos ativos
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Contratos Ativos</span>
              <Building2 className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {metricas.ativas}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Clínicas com acesso liberado
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Contratos Inativos</span>
              <Power className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {metricas.inativas}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Clínicas com acesso suspenso
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Licenças Consumidas</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {metricas.licencasConsumidas}{' '}
              <span className="text-sm font-normal text-slate-400">
                / {metricas.licencasTotais}
              </span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              PJs ativos nas empresas habilitadas
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Empresas e Contratos ({empresas.length})
              </h2>
              <p className="text-xs text-slate-500">
                Ative ou desative contratos e acompanhe o consumo de licenças por unidade.
              </p>
            </div>

            <div className="space-y-3">
              {empresas.map((emp) => {
                const consumidas = prestadores.filter(
                  (p) => p.empresaId === emp.id && p.situacao === 'ATIVO'
                ).length;
                const percentual =
                  emp.limitePrestadores > 0
                    ? Math.min(
                        100,
                        Math.round((consumidas / emp.limitePrestadores) * 100)
                      )
                    : 0;
                const ativo = emp.status === 'ATIVO';

                return (
                  <div
                    key={emp.id}
                    className={`p-4 rounded-xl border transition ${
                      ativo
                        ? 'border-slate-200 bg-white'
                        : 'border-red-200 bg-red-50/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900">
                            {emp.nomeFantasia}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                              ativo
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {ativo ? 'ATIVO' : 'INATIVO'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          CNPJ: {emp.cnpj} • Login Gestor: {emp.responsavelEmail}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-800">
                          {formatarMoeda(emp.valorMensalidade)}
                          <span className="text-xs font-normal text-slate-400">
                            /mês
                          </span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleAlternarContrato(emp.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            ativo
                              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          {ativo ? 'Desativar Contrato' : 'Ativar Contrato'}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500 font-medium">
                          Licenças consumidas
                        </span>
                        <span className="font-semibold text-slate-800">
                          {consumidas} de {emp.limitePrestadores} ({percentual}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            percentual >= 100
                              ? 'bg-red-500'
                              : percentual >= 80
                              ? 'bg-amber-500'
                              : 'bg-indigo-600'
                          }`}
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Regras de Negócio
                </h2>
              </div>
              {feedbackRegra && (
                <span className="text-xs font-semibold text-emerald-600">
                  Atualizado
                </span>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-800">
                    Bloquear excesso de licenças
                  </p>
                  <p className="text-xs text-slate-500">
                    Impede cadastro acima do limite contratado
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={regras.bloquearExcessoLicencas}
                  onChange={(e) =>
                    handleAtualizarRegras({
                      ...regras,
                      bloquearExcessoLicencas: e.target.checked
                    })
                  }
                  className="w-4 h-4 accent-indigo-600"
                />
              </label>

              <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-800">
                    Exigir aprovação do Gestor
                  </p>
                  <p className="text-xs text-slate-500">
                    Entregas PJ aguardam validação antes de pagar
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={regras.exigirAprovacaoEntrega}
                  onChange={(e) =>
                    handleAtualizarRegras({
                      ...regras,
                      exigirAprovacaoEntrega: e.target.checked
                    })
                  }
                  className="w-4 h-4 accent-indigo-600"
                />
              </label>

              <div className="p-3 rounded-xl border border-slate-200 space-y-2">
                <p className="font-semibold text-slate-800">
                  Modalidades de contrato permitidas
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regras.permitirContratoHora}
                      onChange={(e) =>
                        handleAtualizarRegras({
                          ...regras,
                          permitirContratoHora: e.target.checked
                        })
                      }
                      className="accent-indigo-600"
                    />
                    Por Hora
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regras.permitirContratoPlantao}
                      onChange={(e) =>
                        handleAtualizarRegras({
                          ...regras,
                          permitirContratoPlantao: e.target.checked
                        })
                      }
                      className="accent-indigo-600"
                    />
                    Por Plantão
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regras.permitirContratoMensal}
                      onChange={(e) =>
                        handleAtualizarRegras({
                          ...regras,
                          permitirContratoMensal: e.target.checked
                        })
                      }
                      className="accent-indigo-600"
                    />
                    Fixo Mensal
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Licenças Padrão
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={regras.limitePadraoLicencas}
                    onChange={(e) =>
                      handleAtualizarRegras({
                        ...regras,
                        limitePadraoLicencas: Number(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Mensalidade (R$)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={regras.mensalidadePadrao}
                    onChange={(e) =>
                      handleAtualizarRegras({
                        ...regras,
                        mensalidadePadrao: Number(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Acessos e Credenciais ({credenciais.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Usuários de todas as empresas cadastradas e suas senhas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarSenhas((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  {mostrarSenhas ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      Mostrar Senhas
                    </>
                  )}
                </button>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar..."
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-40 sm:w-48"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Usuário</th>
                    <th className="py-2.5 px-3">Empresa</th>
                    <th className="py-2.5 px-3">Perfil</th>
                    <th className="py-2.5 px-3">Senha</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {credenciaisFiltradas.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-slate-900 text-xs">
                          {item.nome}
                        </p>
                        <p className="text-xs text-slate-500">{item.email}</p>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-700">
                        {item.empresaNome}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {item.perfil}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-800">
                        {mostrarSenhas ? item.senha : '••••••'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            item.ativo
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.ativo ? 'ATIVO' : 'BLOQUEADO'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.perfil !== 'MASTER' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRedefinirSenha(item.email, item.senha)
                            }
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            Senha
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Quem Entra e Quem Sai
              </h2>
              <p className="text-xs text-slate-500">
                Registro de logins e encerramentos de sessão.
              </p>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {acessos.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Nenhuma movimentação registrada ainda.
                </p>
              ) : (
                acessos.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-start justify-between gap-2 text-xs"
                  >
                    <div className="flex items-start gap-2">
                      {acc.tipo === 'ENTRADA' ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold text-slate-800">
                          {acc.usuarioNome}
                        </p>
                        <p className="text-slate-500">
                          {acc.empresaNome} • {acc.perfil}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          acc.tipo === 'ENTRADA'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {acc.tipo}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {acc.dataHora}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {modalAberto && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Cadastrar Nova Empresa
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  A empresa será criada com o painel limpo para cadastrar seus próprios funcionários.
                </p>
              </div>

              <form onSubmit={handleCadastrarEmpresa} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome Fantasia *
                    </label>
                    <input
                      type="text"
                      required
                      value={nomeFantasia}
                      onChange={(e) => setNomeFantasia(e.target.value)}
                      placeholder="Ex: Clínica Vida"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CNPJ *
                    </label>
                    <input
                      type="text"
                      required
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Razão Social
                  </label>
                  <input
                    type="text"
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    placeholder="Razão Social Ltda"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Limite de Licenças *
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={limitePrestadores}
                      onChange={(e) =>
                        setLimitePrestadores(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mensalidade (R$) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      required
                      value={valorMensalidade}
                      onChange={(e) =>
                        setValorMensalidade(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <p className="text-xs font-bold text-indigo-700 uppercase">
                    Acesso do Gestor da Clínica
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome do Gestor
                    </label>
                    <input
                      type="text"
                      value={responsavelNome}
                      onChange={(e) => setResponsavelNome(e.target.value)}
                      placeholder="Ex: Dra. Ana Paula"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        E-mail de Login *
                      </label>
                      <input
                        type="email"
                        required
                        value={responsavelEmail}
                        onChange={(e) => setResponsavelEmail(e.target.value)}
                        placeholder="gestor@clinica.com"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Senha *
                      </label>
                      <input
                        type="text"
                        required
                        value={senhaGestor}
                        onChange={(e) => setSenhaGestor(e.target.value)}
                        placeholder="Senha de acesso"
                        className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalAberto(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer"
                  >
                    Criar Empresa
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};