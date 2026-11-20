import { useMemo, useState, type FC, type FormEvent } from 'react';
import {
  UserPlus,
  Users,
  CheckCircle2,
  Clock,
  DollarSign,
  UserCheck,
  UserX,
  PlusCircle,
  Building2,
  LogOut
} from 'lucide-react';
import type { ModalidadeContrato } from '../types/contrato';
import type { PrestadorPJ } from '../types/prestador';
import type { TarefaPJ } from '../types/tarefa';
import type { UsuarioSistema } from '../types/usuario';
import { api, apiEmpresas } from '../services/api';

interface PainelGestorProps {
  usuario: UsuarioSistema;
  onLogout: () => void;
}

export const PainelGestor: FC<PainelGestorProps> = ({ usuario, onLogout }) => {
  const empresaId = usuario.empresaId || '';
  const empresa = useMemo(
    () => apiEmpresas.getEmpresaPorId(empresaId),
    [empresaId]
  );
  const regras = useMemo(() => api.getRegrasNegocio(), []);

  const [prestadores, setPrestadores] = useState<PrestadorPJ[]>(() =>
    api.getPrestadoresPorEmpresa(empresaId)
  );
  const [tarefas, setTarefas] = useState<TarefaPJ[]>(() =>
    api.getTarefasPorEmpresa(empresaId)
  );

  const [modalFuncionarioAberto, setModalFuncionarioAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [servico, setServico] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [remuneracao, setRemuneracao] = useState<ModalidadeContrato>('PLANTAO');
  const [valorBase, setValorBase] = useState(500);
  const [erroCadastro, setErroCadastro] = useState('');

  const [modalEntregaAberto, setModalEntregaAberto] = useState(false);
  const [prestadorSelecionadoId, setPrestadorSelecionadoId] = useState('');
  const [tituloEntrega, setTituloEntrega] = useState('');
  const [prazoEntrega, setPrazoEntrega] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [quantidadeEntrega, setQuantidadeEntrega] = useState(1);

  const metricas = useMemo(() => {
    const ativos = prestadores.filter((p) => p.situacao === 'ATIVO').length;
    const desligados = prestadores.filter((p) => p.situacao !== 'ATIVO').length;
    const aPagar = tarefas
      .filter((t) => t.status !== 'PAGO')
      .reduce((acc, t) => acc + t.valorEntrega, 0);
    const pago = tarefas
      .filter((t) => t.status === 'PAGO')
      .reduce((acc, t) => acc + t.valorEntrega, 0);

    return { ativos, desligados, aPagar, pago };
  }, [prestadores, tarefas]);

  const limiteLicencas = empresa?.limitePrestadores ?? 0;
  const licencasEsgotadas =
    regras.bloquearExcessoLicencas && metricas.ativos >= limiteLicencas;
  const licencasExcedentes = Math.max(0, metricas.ativos - limiteLicencas);

  const modalidadesPermitidas = useMemo(() => {
    const lista: { valor: ModalidadeContrato; label: string }[] = [];
    if (regras.permitirContratoPlantao) {
      lista.push({ valor: 'PLANTAO', label: 'Por Plantão' });
    }
    if (regras.permitirContratoHora) {
      lista.push({ valor: 'POR_HORA', label: 'Por Hora' });
    }
    if (regras.permitirContratoMensal) {
      lista.push({ valor: 'MENSAL', label: 'Fixo Mensal' });
    }
    return lista.length > 0
      ? lista
      : [{ valor: 'PLANTAO' as ModalidadeContrato, label: 'Por Plantão' }];
  }, [regras]);

  const abrirModalFuncionario = () => {
    setErroCadastro('');
    setNome('');
    setRazaoSocial('');
    setServico('');
    setCnpj('');
    setEmail('');
    setSenha('');
    setRemuneracao(modalidadesPermitidas[0].valor);
    setValorBase(500);
    setModalFuncionarioAberto(true);
  };

  const handleCadastrarFuncionario = (e: FormEvent) => {
    e.preventDefault();
    setErroCadastro('');

    if (licencasEsgotadas) {
      setErroCadastro(
        `Limite de ${limiteLicencas} licença(s) atingido para esta unidade.`
      );
      return;
    }

    const emailNorm = email.trim().toLowerCase();
    const duplicado = api
      .getCredenciaisConsolidadas()
      .some((c) => c.email.toLowerCase() === emailNorm);

    if (duplicado) {
      setErroCadastro('Este e-mail já está em uso no sistema.');
      return;
    }

    const atualizados = api.salvarPrestador({
      empresaId,
      nome: nome.trim(),
      razaoSocial: razaoSocial.trim() || nome.trim(),
      cnpj: cnpj.trim(),
      email: emailNorm,
      senha: senha.trim(),
      servico: servico.trim(),
      remuneracao,
      valorBase: Number(valorBase)
    });

    setPrestadores(atualizados);
    setModalFuncionarioAberto(false);
  };

  const handleMovimentarFuncionario = (prestador: PrestadorPJ) => {
    if (prestador.situacao !== 'ATIVO' && licencasEsgotadas) {
      window.alert(
        `Limite de ${limiteLicencas} licença(s) atingido. Não é possível reativar.`
      );
      return;
    }

    const atualizados = api.alternarSituacaoPrestador(prestador.id, empresaId);
    setPrestadores(atualizados);
  };

  const abrirModalEntrega = () => {
    const ativo = prestadores.find((p) => p.situacao === 'ATIVO');
    setPrestadorSelecionadoId(ativo ? ativo.id : '');
    setTituloEntrega('');
    setPrazoEntrega(new Date().toISOString().split('T')[0]);
    setQuantidadeEntrega(1);
    setModalEntregaAberto(true);
  };

  const handleRegistrarEntrega = (e: FormEvent) => {
    e.preventDefault();
    const alvo = prestadores.find((p) => p.id === prestadorSelecionadoId);
    if (!alvo || !tituloEntrega.trim()) return;

    api.salvarTarefa({
      empresaId,
      prestadorId: alvo.id,
      prestadorNome: alvo.nome,
      titulo: tituloEntrega.trim(),
      horasTrabalhadas: Number(quantidadeEntrega),
      valorUnitario: alvo.valorBase,
      prazo: prazoEntrega
    });

    setTarefas(api.getTarefasPorEmpresa(empresaId));
    setModalEntregaAberto(false);
  };

  const handleAprovar = (id: string) => {
    setTarefas(api.atualizarStatusTarefa(id, 'APROVADO', empresaId));
  };

  const handlePagar = (id: string) => {
    setTarefas(api.atualizarStatusTarefa(id, 'PAGO', empresaId));
  };

  const formatarMoeda = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const labelModalidade = (mod: ModalidadeContrato) => {
    if (mod === 'POR_HORA') return 'Hora';
    if (mod === 'PLANTAO') return 'Plantão';
    return 'Mensal';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 text-lg">Clingest PJ</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Building2 className="w-3.5 h-3.5" />
              {usuario.empresaNome || 'RH / Clínica'}
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
              Administração de RH e Pagamentos PJ
            </h1>
            <p className="text-sm text-slate-500">
              Controle exclusivo da unidade: entrada e saída de funcionários, acessos e pagamentos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {prestadores.some((p) => p.situacao === 'ATIVO') && (
              <button
                type="button"
                onClick={abrirModalEntrega}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-sm font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                Lançar Entrega
              </button>
            )}

            <button
              type="button"
              onClick={abrirModalFuncionario}
              disabled={licencasEsgotadas}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />
              Cadastrar Funcionário PJ
            </button>
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Ativos / Licenças</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {metricas.ativos}{' '}
              <span className="text-sm font-normal text-slate-400">
                / {limiteLicencas}
              </span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {licencasExcedentes > 0
                ? `+${licencasExcedentes} adicional(is) (${formatarMoeda(
                    regras.valorAdicionalLicenca
                  )}/cada)`
                : `${metricas.desligados} desligado(s) no histórico`}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Entregas da Equipe</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {tarefas.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Produções registradas na clínica
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Saldo a Pagar</span>
              <DollarSign className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {formatarMoeda(metricas.aPagar)}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Aguardando liquidação financeira
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Total Pago</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {formatarMoeda(metricas.pago)}
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              Repasses concluídos aos PJs
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Entrada e Saída de Funcionários PJ ({prestadores.length})
            </h2>
            <p className="text-xs text-slate-500">
              Cada profissional possui seu próprio login e senha para acessar o Portal PJ.
            </p>
          </div>

          {prestadores.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl space-y-1.5">
              <p className="text-sm font-semibold text-slate-700">
                Painel limpo: nenhum funcionário PJ cadastrado ainda.
              </p>
              <p className="text-xs text-slate-500">
                Clique em "Cadastrar Funcionário PJ" para adicionar sua equipe.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Profissional</th>
                    <th className="py-3 px-4">Login / Senha</th>
                    <th className="py-3 px-4">Contrato</th>
                    <th className="py-3 px-4">Entrada / Saída</th>
                    <th className="py-3 px-4">Situação</th>
                    <th className="py-3 px-4 text-right">Controle RH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prestadores.map((p) => {
                    const ativo = p.situacao === 'ATIVO';
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">{p.nome}</p>
                          <p className="text-xs text-slate-500">
                            {p.servico} • CNPJ: {p.cnpj}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <p className="text-slate-800 font-medium">{p.email}</p>
                          <p className="font-mono text-slate-500">
                            Senha: {p.senha}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                          {formatarMoeda(p.valorBase)} /{' '}
                          {labelModalidade(p.remuneracao)}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          <p>Entrada: {p.dataEntrada}</p>
                          {p.dataSaida && (
                            <p className="text-red-600">Saída: {p.dataSaida}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              ativo
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {ativo ? 'ATIVO' : 'DESLIGADO'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleMovimentarFuncionario(p)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              ativo
                                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {ativo ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                Registrar Saída
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                Reativar Entrada
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pagamentos e Entregas Contratuais ({tarefas.length})
            </h2>
            <p className="text-xs text-slate-500">
              Aprove as entregas realizadas e confirme os pagamentos dos prestadores.
            </p>
          </div>

          {tarefas.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">
              Nenhuma entrega registrada nesta clínica até o momento.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Profissional</th>
                    <th className="py-3 px-4">Entrega</th>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Qtd</th>
                    <th className="py-3 px-4">Valor Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Pagamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tarefas.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900 text-xs">
                        {t.prestadorNome}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        {t.titulo}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {t.prazo}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        {t.horasTrabalhadas}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 text-xs">
                        {formatarMoeda(t.valorEntrega)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            t.status === 'PAGO'
                              ? 'bg-emerald-100 text-emerald-700'
                              : t.status === 'APROVADO'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {t.status === 'PENDENTE' && (
                          <button
                            type="button"
                            onClick={() => handleAprovar(t.id)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold cursor-pointer"
                          >
                            Aprovar
                          </button>
                        )}
                        {t.status !== 'PAGO' ? (
                          <button
                            type="button"
                            onClick={() => handlePagar(t.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-semibold cursor-pointer"
                          >
                            Pagar
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Pago em {t.dataPagamento}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {modalFuncionarioAberto && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-slate-900">
                Cadastrar Funcionário PJ
              </h2>

              {!regras.bloquearExcessoLicencas &&
                metricas.ativos >= limiteLicencas && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    Limite base de {limiteLicencas} licença(s) atingido. Este
                    cadastro será contabilizado como adicional (
                    <strong>
                      +{formatarMoeda(regras.valorAdicionalLicenca)}/mês
                    </strong>
                    ).
                  </div>
                )}

              <form onSubmit={handleCadastrarFuncionario} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Dr. Rafael Lima"
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Empresa / Razão Social
                    </label>
                    <input
                      type="text"
                      value={razaoSocial}
                      onChange={(e) => setRazaoSocial(e.target.value)}
                      placeholder="Lima Serviços Médicos"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Especialidade *
                    </label>
                    <input
                      type="text"
                      required
                      value={servico}
                      onChange={(e) => setServico(e.target.value)}
                      placeholder="Ex: Fisioterapia"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Modalidade *
                    </label>
                    <select
                      value={remuneracao}
                      onChange={(e) =>
                        setRemuneracao(e.target.value as ModalidadeContrato)
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                    >
                      {modalidadesPermitidas.map((m) => (
                        <option key={m.valor} value={m.valor}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Valor Base (R$) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      step="0.01"
                      required
                      value={valorBase}
                      onChange={(e) => setValorBase(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <p className="text-xs font-bold text-indigo-700 uppercase">
                    Login Próprio do Funcionário
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="profissional@pj.com"
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
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Senha inicial"
                        className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {erroCadastro && (
                  <p className="text-xs font-medium text-red-600">
                    {erroCadastro}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalFuncionarioAberto(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer"
                  >
                    Salvar Funcionário
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalEntregaAberto && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-slate-900">
                Registrar Entrega PJ
              </h2>

              <form onSubmit={handleRegistrarEntrega} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Funcionário PJ *
                  </label>
                  <select
                    required
                    value={prestadorSelecionadoId}
                    onChange={(e) => setPrestadorSelecionadoId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    {prestadores
                      .filter((p) => p.situacao === 'ATIVO')
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome} ({formatarMoeda(p.valorBase)} /{' '}
                          {labelModalidade(p.remuneracao)})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    required
                    value={tituloEntrega}
                    onChange={(e) => setTituloEntrega(e.target.value)}
                    placeholder="Ex: Plantão 12h Emergência"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Data *
                    </label>
                    <input
                      type="date"
                      required
                      value={prazoEntrega}
                      onChange={(e) => setPrazoEntrega(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Quantidade *
                    </label>
                    <input
                      type="number"
                      min={1}
                      step="0.5"
                      required
                      value={quantidadeEntrega}
                      onChange={(e) =>
                        setQuantidadeEntrega(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalEntregaAberto(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer"
                  >
                    Confirmar
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