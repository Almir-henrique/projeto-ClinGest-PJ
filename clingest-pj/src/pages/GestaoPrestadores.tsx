import React, { useEffect, useState } from 'react';
import { Users, Trash2, Edit3, ShieldCheck, Plus } from 'lucide-react';
import { api } from '../services/api';
import type { PrestadorPJ, TipoRemuneracao } from '../types/prestador';
import { useToast } from '../context/ToastContext';

export const GestaoPrestadores: React.FC = () => {
  const [prestadores, setPrestadores] = useState<PrestadorPJ[]>([]);
  const [loading, setLoading] = useState(true);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [servico, setServico] = useState('');
  const [remuneracao, setRemuneracao] = useState<TipoRemuneracao>('POR_HORA');
  const [valorBase, setValorBase] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const { showToast } = useToast();

  const carregarPrestadores = async () => {
    try {
      const data = await api.getPrestadores();
      setPrestadores(data);
    } catch {
      showToast('Erro ao carregar prestadores', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPrestadores();
  }, []);

  const limparFormulario = () => {
    setEditandoId(null);
    setNome('');
    setRazaoSocial('');
    setCnpj('');
    setEmail('');
    setServico('');
    setRemuneracao('POR_HORA');
    setValorBase('');
    setUsuario('');
    setSenha('');
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editandoId) {
        const prestadorExistente = prestadores.find((p) => p.id === editandoId);
        if (!prestadorExistente) return;

        const prestadorAtualizado: PrestadorPJ = {
          ...prestadorExistente,
          nome,
          razaoSocial,
          cnpj,
          email,
          servico,
          remuneracao,
          valorBase: Number(valorBase) || 0,
          usuario,
          senha: senha || prestadorExistente.senha || '123'
        };

        const atualizados = await api.atualizarPrestador(prestadorAtualizado);
        setPrestadores(atualizados);
        showToast('Dados cadastrais atualizados com sucesso', 'success');
      } else {
        const atualizados = await api.salvarPrestador({
          nome,
          razaoSocial,
          cnpj,
          email,
          servico,
          remuneracao,
          valorBase: Number(valorBase) || 0,
          contratoStatus: 'VIGENTE',
          situacao: 'ATIVO',
          usuario,
          senha: senha || '123'
        });
        setPrestadores(atualizados);
        showToast('Prestador cadastrado com sucesso', 'success');
      }
      limparFormulario();
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, 'error');
      } else {
        showToast('Erro ao salvar prestador', 'error');
      }
    }
  };

  const handleEditar = (p: PrestadorPJ) => {
    setEditandoId(p.id);
    setNome(p.nome);
    setRazaoSocial(p.razaoSocial);
    setCnpj(p.cnpj);
    setEmail(p.email);
    setServico(p.servico);
    setRemuneracao(p.remuneracao);
    setValorBase(String(p.valorBase));
    setUsuario(p.usuario || '');
    setSenha('');
  };

  const handleExcluir = async (id: string) => {
    try {
      const atualizados = await api.excluirPrestador(id);
      setPrestadores(atualizados);
      showToast('Prestador removido com sucesso', 'success');
    } catch {
      showToast('Erro ao remover prestador', 'error');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-brand-muted">Carregando prestadores...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Gestão de Prestadores PJ</h1>
          <p className="text-brand-muted text-sm mt-0.5">
            Cadastro, alteração de dados cadastrais, credenciais e modelos de remuneração.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit">
          <h2 className="text-base font-bold text-brand-navy mb-4 flex items-center gap-2">
            <Users size={18} className="text-brand-teal" />
            {editandoId ? 'Editar Prestador PJ' : 'Novo Prestador PJ'}
          </h2>
          <form onSubmit={handleSalvar} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Nome Completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Dra. Mariana"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Razão Social</label>
              <input
                type="text"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                placeholder="Ex: Clínica S/S"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">CNPJ</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">E-mail Profissional</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@clinica.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Serviço / Especialidade</label>
              <input
                type="text"
                value={servico}
                onChange={(e) => setServico(e.target.value)}
                placeholder="Ex: Odontologia"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Modelo de Remuneração</label>
              <select
                value={remuneracao}
                onChange={(e) => setRemuneracao(e.target.value as TipoRemuneracao)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
              >
                <option value="POR_HORA">Por Hora / Plantão</option>
                <option value="FIXO">Fixo Mensal</option>
                <option value="MISTO">Misto</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Valor Base (R$ / Hora)</label>
              <input
                type="number"
                step="0.01"
                value={valorBase}
                onChange={(e) => setValorBase(e.target.value)}
                placeholder="75.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Usuário de Acesso</label>
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="usuario"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-brand-muted mb-1">Senha</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder={editandoId ? 'Manter atual se vazio' : 'Senha'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-teal"
                  {...(!editandoId ? { required: true } : {})}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-brand-teal hover:bg-teal-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                {editandoId ? 'Salvar Alterações' : 'Cadastrar Prestador'}
              </button>
              {editandoId && (
                <button
                  type="button"
                  onClick={limparFormulario}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-brand-navy rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-brand-navy mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            Lista de Prestadores Cadastrados
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-brand-muted">
                  <th className="py-3 px-4 font-semibold">Prestador / CNPJ</th>
                  <th className="py-3 px-4 font-semibold">Serviço</th>
                  <th className="py-3 px-4 font-semibold">Remuneração</th>
                  <th className="py-3 px-4 font-semibold">Valor Base</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {prestadores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-brand-muted">
                      Nenhum prestador cadastrado.
                    </td>
                  </tr>
                ) : (
                  prestadores.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-brand-navy block">{p.nome}</span>
                        <span className="text-xs text-brand-muted">{p.cnpj}</span>
                      </td>
                      <td className="py-3 px-4 text-brand-muted">{p.servico}</td>
                      <td className="py-3 px-4 text-brand-muted">{p.remuneracao.replace('_', ' ')}</td>
                      <td className="py-3 px-4 font-semibold text-brand-navy">
                        {p.valorBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleEditar(p)}
                          className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          title="Editar cadastro"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleExcluir(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Excluir prestador"
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
    </div>
  );
};