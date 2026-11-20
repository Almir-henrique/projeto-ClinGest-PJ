import { useMemo, useState, type FC, type FormEvent } from 'react';
import {
  TrendingUp,
  Wallet,
  CheckCircle2,
  FileText,
  Download,
  Plus,
  Briefcase,
  LogOut
} from 'lucide-react';
import type { ModalidadeContrato } from '../types/contrato';
import type { StatusTarefa, TarefaPJ } from '../types/tarefa';
import type { UsuarioSistema } from '../types/usuario';
import { api } from '../services/api';

interface PortalPrestadorProps {
  usuario: UsuarioSistema;
  onLogout: () => void;
}

export const PortalPrestador: FC<PortalPrestadorProps> = ({
  usuario,
  onLogout
}) => {
  const prestador = useMemo(
    () => api.getPrestadorPorId(usuario.id),
    [usuario.id]
  );

  const [tarefas, setTarefas] = useState<TarefaPJ[]>(() =>
    api.getTarefasPorPrestador(usuario.id)
  );
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | StatusTarefa>('TODOS');

  const [modalAberto, setModalAberto] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [prazo, setPrazo] = useState(new Date().toISOString().split('T')[0]);
  const [quantidade, setQuantidade] = useState(1);

  const metricas = useMemo(() => {
    const aReceber = tarefas
      .filter((t) => t.status !== 'PAGO')
      .reduce((acc, t) => acc + t.valorEntrega, 0);

    const jaRecebido = tarefas
      .filter((t) => t.status === 'PAGO')
      .reduce((acc, t) => acc + t.valorEntrega, 0);

    const totalGeral = aReceber + jaRecebido;
    const mesesAtivos = new Set(tarefas.map((t) => t.prazo.slice(0, 7)));
    const divisor = mesesAtivos.size > 0 ? mesesAtivos.size : 1;
    const mediaGanhos = totalGeral / divisor;

    return { aReceber, jaRecebido, mediaGanhos };
  }, [tarefas]);

  const tarefasFiltradas = useMemo(() => {
    if (filtroStatus === 'TODOS') return tarefas;
    return tarefas.filter((t) => t.status === filtroStatus);
  }, [tarefas, filtroStatus]);

  const handleRegistrarEntrega = (e: FormEvent) => {
    e.preventDefault();
    if (!prestador || !titulo.trim()) return;

    api.salvarTarefa({
      empresaId: prestador.empresaId,
      prestadorId: prestador.id,
      prestadorNome: prestador.nome,
      titulo: titulo.trim(),
      horasTrabalhadas: Number(quantidade),
      valorUnitario: prestador.valorBase,
      prazo
    });

    setTarefas(api.getTarefasPorPrestador(prestador.id));
    setTitulo('');
    setQuantidade(1);
    setModalAberto(false);
  };

  const exportarCSV = () => {
    const cabecalho = 'Data,Entrega,Quantidade,ValorUnitario,ValorTotal,Status\n';
    const linhas = tarefasFiltradas
      .map(
        (t) =>
          `"${t.prazo}","${t.titulo}","${t.horasTrabalhadas}","${t.valorUnitario.toFixed(
            2
          )}","${t.valorEntrega.toFixed(2)}","${t.status}"`
      )
      .join('\n');

    const blob = new Blob([cabecalho + linhas], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_entregas_pj_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatarMoeda = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const labelModalidade = (mod?: ModalidadeContrato) => {
    if (mod === 'POR_HORA') return 'Por Hora';
    if (mod === 'PLANTAO') return 'Por Plantão';
    return 'Fixo Mensal';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 text-lg">Clingest PJ</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Briefcase className="w-3.5 h-3.5" />
              Portal PJ
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
              Meu Painel PJ
            </h1>
            <p className="text-sm text-slate-500">
              Média de ganhos, valores a receber e relatório de entregas do contrato.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalAberto(true)}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Registrar Entrega
          </button>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Média de Ganhos</span>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {formatarMoeda(metricas.mediaGanhos)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Média mensal apurada no contrato
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>O que Vai Receber</span>
              <Wallet className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {formatarMoeda(metricas.aReceber)}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Entregas pendentes ou aguardando repasse
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Total Já Recebido</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {formatarMoeda(metricas.jaRecebido)}
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              Valores quitados pela clínica
            </p>
          </div>
        </section>

        {prestador && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Contrato Vigente
              </p>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                {usuario.empresaNome} • {prestador.servico}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div>
                <p className="text-xs text-slate-500">Modalidade</p>
                <p className="font-semibold text-slate-800">
                  {labelModalidade(prestador.remuneracao)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Valor Contratado</p>
                <p className="font-bold text-emerald-700">
                  {formatarMoeda(prestador.valorBase)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">CNPJ</p>
                <p className="font-mono text-xs text-slate-700">
                  {prestador.cnpj}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Relatório de Entregas do Contrato ({tarefasFiltradas.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Produção calculada automaticamente conforme sua tarifa contratual.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filtroStatus}
                onChange={(e) =>
                  setFiltroStatus(e.target.value as 'TODOS' | StatusTarefa)
                }
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white font-medium text-slate-700"
              >
                <option value="TODOS">Todos os status</option>
                <option value="PENDENTE">Pendentes</option>
                <option value="APROVADO">Aprovados</option>
                <option value="PAGO">Pagos</option>
              </select>

              <button
                type="button"
                onClick={exportarCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar CSV
              </button>
            </div>
          </div>

          {tarefasFiltradas.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-400">
              Nenhuma entrega registrada para o filtro selecionado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Entrega Realizada</th>
                    <th className="py-3 px-4">Qtd</th>
                    <th className="py-3 px-4">Tarifa</th>
                    <th className="py-3 px-4">Valor Total</th>
                    <th className="py-3 px-4">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tarefasFiltradas.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {t.prazo}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 text-xs">
                        {t.titulo}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        {t.horasTrabalhadas}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {formatarMoeda(t.valorUnitario)}
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
                          {t.status === 'PAGO'
                            ? `PAGO (${t.dataPagamento})`
                            : t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {modalAberto && prestador && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-slate-900">
                Registrar Entrega do Contrato
              </h2>

              <form onSubmit={handleRegistrarEntrega} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descrição da Entrega *
                  </label>
                  <input
                    type="text"
                    required
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Plantão Diurno Clínica Médica"
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
                      value={prazo}
                      onChange={(e) => setPrazo(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Quantidade ({labelModalidade(prestador.remuneracao)}) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      step="0.5"
                      required
                      value={quantidade}
                      onChange={(e) => setQuantidade(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Valor total calculado:</span>
                  <span className="text-sm font-bold text-emerald-700">
                    {formatarMoeda(quantidade * prestador.valorBase)}
                  </span>
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
                    className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer"
                  >
                    Confirmar Entrega
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