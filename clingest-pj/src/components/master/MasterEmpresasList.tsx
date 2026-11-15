import React, { useMemo, useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  X,
  AlertCircle,
  Settings2,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import type {
  EmpresaComMetricas,
  NovaEmpresaInput,
  PoliticaExcedentes,
  StatusEmpresa
} from '../../types/master';
import { masterService } from '../../services/masterService';
import { useToast } from '../../context/ToastContext';

interface MasterEmpresasListProps {
  empresas: EmpresaComMetricas[];
  onAbrirEmpresa: (empresaId: string) => void;
  onEmpresaCadastrada: () => void;
}

interface CredenciaisCriadasResumo {
  empresa: string;
  gestor: string;
  usuario: string;
  email: string;
  senha: string;
}

export const MasterEmpresasList: React.FC<MasterEmpresasListProps> = ({
  empresas,
  onAbrirEmpresa,
  onEmpresaCadastrada
}) => {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | StatusEmpresa>('TODOS');
  const [modalAberto, setModalAberto] = useState(false);
  const [erroFormulario, setErroFormulario] = useState<string | null>(null);
  const [credenciaisCriadas, setCredenciaisCriadas] = useState<CredenciaisCriadasResumo | null>(null);

  const hoje = new Date().toISOString().split('T')[0];
  const proximoAno = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    .toISOString()
    .split('T')[0];

  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [emailContato, setEmailContato] = useState('');
  const [telefoneContato, setTelefoneContato] = useState('');
  const [plano, setPlano] = useState('Growth 10');
  const [valorContratoBase, setValorContratoBase] = useState('890');
  const [licencasContratadas, setLicencasContratadas] = useState('10');
  const [politicaExcedentes, setPoliticaExcedentes] = useState<PoliticaExcedentes>('BLOQUEAR');
  const [valorPorExcedente, setValorPorExcedente] = useState('50');
  const [vigenciaInicio, setVigenciaInicio] = useState(hoje);
  const [vigenciaFim, setVigenciaFim] = useState(proximoAno);
  const [gestorNome, setGestorNome] = useState('');
  const [gestorUsuario, setGestorUsuario] = useState('');
  const [gestorEmail, setGestorEmail] = useState('');
  const [gestorSenhaInicial, setGestorSenhaInicial] = useState('');
  const [mostrarSenhaGestor, setMostrarSenhaGestor] = useState(false);

  const { showToast } = useToast();

  const formatarMoeda = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const empresasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return empresas.filter((emp) => {
      const correspondeStatus =
        filtroStatus === 'TODOS' || emp.status === filtroStatus;
      const correspondeTexto =
        !termo ||
        emp.nomeFantasia.toLowerCase().includes(termo) ||
        emp.razaoSocial.toLowerCase().includes(termo) ||
        emp.cnpj.toLowerCase().includes(termo) ||
        emp.plano.toLowerCase().includes(termo);
      return correspondeStatus && correspondeTexto;
    });
  }, [empresas, busca, filtroStatus]);

  const limparFormulario = () => {
    setRazaoSocial('');
    setNomeFantasia('');
    setCnpj('');
    setEmailContato('');
    setTelefoneContato('');
    setPlano('Growth 10');
    setValorContratoBase('890');
    setLicencasContratadas('10');
    setPoliticaExcedentes('BLOQUEAR');
    setValorPorExcedente('50');
    setVigenciaInicio(hoje);
    setVigenciaFim(proximoAno);
    setGestorNome('');
    setGestorUsuario('');
    setGestorEmail('');
    setGestorSenhaInicial('');
    setMostrarSenhaGestor(false);
    setErroFormulario(null);
  };

  const handleAbrirModal = () => {
    limparFormulario();
    setModalAberto(true);
  };

  const handleSalvarEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    setErroFormulario(null);

    if (Number(licencasContratadas) < 1) {
      setErroFormulario('A quantidade de licencas contratadas deve ser no minimo 1.');
      return;
    }

    if (Number(valorContratoBase) < 0) {
      setErroFormulario('O valor do contrato nao pode ser negativo.');
      return;
    }

    if (politicaExcedentes === 'COBRAR' && Number(valorPorExcedente) <= 0) {
      setErroFormulario('Informe um valor mensal valido por profissional excedente.');
      return;
    }

    if (!gestorUsuario.trim() || gestorUsuario.trim().length < 3) {
      setErroFormulario('Informe um usuario de acesso com pelo menos 3 caracteres.');
      return;
    }

    if (!gestorSenhaInicial.trim() || gestorSenhaInicial.trim().length < 4) {
      setErroFormulario('Informe uma senha inicial com pelo menos 4 caracteres.');
      return;
    }

    const payload: NovaEmpresaInput = {
      razaoSocial,
      nomeFantasia,
      cnpj,
      emailContato,
      telefoneContato,
      plano,
      valorContratoBase: Number(valorContratoBase),
      licencasContratadas: Number(licencasContratadas),
      politicaExcedentes,
      valorPorExcedente: politicaExcedentes === 'COBRAR' ? Number(valorPorExcedente) : 0,
      vigenciaInicio,
      vigenciaFim,
      gestorNome,
      gestorUsuario: gestorUsuario.trim(),
      gestorEmail,
      gestorSenhaInicial: gestorSenhaInicial.trim()
    };

    try {
      const empresaCriada = masterService.cadastrarEmpresa(payload);
      setCredenciaisCriadas({
        empresa: empresaCriada.nomeFantasia,
        gestor: gestorNome.trim(),
        usuario: empresaCriada.credenciaisGestor.usuario,
        email: empresaCriada.credenciaisGestor.email,
        senha: empresaCriada.credenciaisGestor.senha
      });
      onEmpresaCadastrada();
      setModalAberto(false);
      limparFormulario();
      showToast('Empresa e credenciais de acesso cadastradas com sucesso!', 'success');
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : 'Nao foi possivel cadastrar a empresa.';
      setErroFormulario(mensagem);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Empresas Contratantes</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Gerencie clinicas e empresas clientes, limites de licencas PJ e credenciais de acesso ao painel proprio.
          </p>
        </div>

        <button
          onClick={handleAbrirModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nova Empresa
        </button>
      </div>

      {credenciaisCriadas && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-emerald-950">
              <p className="font-bold text-sm text-emerald-900">
                Acesso liberado para {credenciaisCriadas.empresa}
              </p>
              <p>
                <span className="font-semibold">Gestor:</span> {credenciaisCriadas.gestor} |{' '}
                <span className="font-semibold">Usuario:</span>{' '}
                <code className="px-1.5 py-0.5 bg-white border border-emerald-200 rounded font-mono font-bold">
                  {credenciaisCriadas.usuario}
                </code>{' '}
                | <span className="font-semibold">Senha:</span>{' '}
                <code className="px-1.5 py-0.5 bg-white border border-emerald-200 rounded font-mono font-bold">
                  {credenciaisCriadas.senha}
                </code>
              </p>
            </div>
          </div>
          <button
            onClick={() => setCredenciaisCriadas(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 self-end sm:self-center"
            title="Fechar aviso"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome fantasia, razao social, CNPJ ou plano..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['TODOS', 'ATIVA', 'SUSPENSA'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filtroStatus === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'TODOS' ? 'Todas' : status === 'ATIVA' ? 'Ativas' : 'Suspensas'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3.5 px-6 font-semibold">Empresa</th>
                <th className="py-3.5 px-6 font-semibold">CNPJ</th>
                <th className="py-3.5 px-6 font-semibold">Licencas</th>
                <th className="py-3.5 px-6 font-semibold">Plano</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold">Valor do Contrato</th>
                <th className="py-3.5 px-6 font-semibold text-right">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {empresasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 px-6 text-center text-slate-500">
                    Nenhuma empresa encontrada para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                empresasFiltradas.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{emp.nomeFantasia}</div>
                      <div className="text-xs text-slate-500">{emp.razaoSocial}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono text-xs">{emp.cnpj}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {emp.metricas.licencasUtilizadas}/{emp.metricas.licencasContratadas}
                        </span>
                        {emp.metricas.licencasExcedentes > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            +{emp.metricas.licencasExcedentes} exced.
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-700">{emp.plano}</td>
                    <td className="py-4 px-6">
                      {emp.status === 'ATIVA' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          Suspenso
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">
                        {formatarMoeda(emp.metricas.valorTotalMensal)}
                      </div>
                      {emp.metricas.cobrancaAdicionalMensal > 0 && (
                        <div className="text-xs text-slate-500">
                          Base {formatarMoeda(emp.valorContratoBase)} + exced.
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onAbrirEmpresa(emp.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Settings2 size={14} />
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full my-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Building2 size={18} className="text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Cadastrar Nova Empresa Contratante
                </h3>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvarEmpresa} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {erroFormulario && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-xs text-red-700 font-medium">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{erroFormulario}</span>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                  1. Dados Cadastrais da Empresa
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
                      placeholder="Ex: Clinica Medica Exemplo LTDA"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                      required
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
                      placeholder="Ex: Clinica Exemplo"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      E-mail Comercial
                    </label>
                    <input
                      type="email"
                      value={emailContato}
                      onChange={(e) => setEmailContato(e.target.value)}
                      placeholder="contato@empresa.com.br"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={telefoneContato}
                      onChange={(e) => setTelefoneContato(e.target.value)}
                      placeholder="(81) 3000-0000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                  2. Contrato Comercial e Politica de Licencas
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
                      placeholder="Ex: Growth 10"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Valor Mensal Base (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={valorContratoBase}
                      onChange={(e) => setValorContratoBase(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                      required
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
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Politica de Profissionais Excedentes
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
                        Valor Mensal por Excedente (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        value={valorPorExcedente}
                        onChange={(e) => setValorPorExcedente(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                        required
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
                      required
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
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <KeyRound size={14} className="text-indigo-600" />
                    3. Credenciais de Acesso da Empresa (Gestor)
                  </h4>
                  <span className="text-xs text-slate-400">
                    Gestores nao consomem licencas PJ
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome Completo do Gestor
                    </label>
                    <input
                      type="text"
                      value={gestorNome}
                      onChange={(e) => setGestorNome(e.target.value)}
                      placeholder="Ex: Dra. Beatriz Moura"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      E-mail do Gestor
                    </label>
                    <input
                      type="email"
                      value={gestorEmail}
                      onChange={(e) => setGestorEmail(e.target.value)}
                      placeholder="beatriz@empresa.com.br"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Usuario de Login da Empresa
                    </label>
                    <input
                      type="text"
                      value={gestorUsuario}
                      onChange={(e) => setGestorUsuario(e.target.value)}
                      placeholder="Ex: clinica.exemplo"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Senha de Acesso
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarSenhaGestor ? 'text' : 'password'}
                        value={gestorSenhaInicial}
                        onChange={(e) => setGestorSenhaInicial(e.target.value)}
                        placeholder="Minimo 4 caracteres"
                        className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenhaGestor(!mostrarSenhaGestor)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        title={mostrarSenhaGestor ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {mostrarSenhaGestor ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  Salvar Empresa e Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};