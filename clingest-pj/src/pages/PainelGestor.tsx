import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import type { PrestadorPJ } from '../types/prestador';
import type { TarefaPJ } from '../types/tarefa';

export const PainelGestor: React.FC = () => {
  const [prestadores, setPrestadores] = useState<PrestadorPJ[]>([]);
  const [tarefas, setTarefas] = useState<TarefaPJ[]>([]);
  const [modalAberto, setModalAberto] = useState(false);

  // Estados do formulário de cadastro de funcionário/prestador pela clínica
  const [nome, setNome] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [servico, setServico] = useState('');
  const [valorBase, setValorBase] = useState(75.00);
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  // Limite simulado do plano da empresa (ex: 10 profissionais contratados no Master)
  const limitePlanoEmpresa = 10;

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const listaPrestadores = await api.getPrestadores();
    const listaTarefas = await api.getTarefas();
    setPrestadores(listaPrestadores);
    setTarefas(listaTarefas);
  };

  const handleCadastrarFuncionario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prestadores.length >= limitePlanoEmpresa) {
      alert('Limite de funcionários atingido para o seu plano atual! Entre em contato com o suporte Master para realizar um upgrade.');
      return;
    }

    if (!nome || !cnpj || !usuario || !senha) return;

    await api.salvarPrestador({
      nome,
      razaoSocial,
      cnpj,
      email,
      servico,
      remuneracao: 'POR_HORA',
      valorBase,
      contratoStatus: 'VIGENTE',
      situacao: 'ATIVO',
      usuario,
      senha
    });

    // Limpa o formulário
    setNome('');
    setRazaoSocial('');
    setCnpj('');
    setEmail('');
    setServico('');
    setValorBase(75.00);
    setUsuario('');
    setSenha('');
    setModalAberto(false);
    carregarDados();
  };

  const totalCadastrados = prestadores.length;
  const limiteAtingido = totalCadastrados >= limitePlanoEmpresa;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-7 h-7 text-indigo-600" /> Painel da Clínica / Gestão de Equipe
          </h1>
          <p className="text-sm text-slate-500">Controle interno de prestadores, credenciais de acesso e aprovação de plantões</p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition shadow-sm font-medium text-sm ${
            limiteAtingido 
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <Plus className="w-5 h-5" /> Novo Funcionário / Prestador
        </button>
      </div>

      {/* Alerta de Consumo de Licenças do Plano */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between ${
        limiteAtingido ? 'bg-red-50 border-red-200 text-red-800' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          {limiteAtingido ? <AlertTriangle className="w-6 h-6 text-red-600" /> : <Users className="w-6 h-6 text-indigo-600" />}
          <div>
            <h4 className="font-bold text-sm">Ocupação do Plano Contratado</h4>
            <p className="text-xs opacity-80">
              Você está utilizando {totalCadastrados} de {limitePlanoEmpresa} licenças de profissionais disponíveis.
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-lg font-bold ${limiteAtingido ? 'text-red-600' : 'text-indigo-600'}`}>
            {totalCadastrados} / {limitePlanoEmpresa}
          </span>
          <span className="block text-[10px] uppercase font-semibold text-slate-400">Profissionais Ativos</span>
        </div>
      </div>

      {/* Lista de Profissionais da Clínica */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 font-semibold text-slate-800">
          Profissionais e Credenciais Vinculadas
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-semibold">Profissional / Especialidade</th>
                <th className="p-4 font-semibold">CNPJ / Razão Social</th>
                <th className="p-4 font-semibold">Credencial (Login)</th>
                <th className="p-4 font-semibold">Valor Base Hora</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {prestadores.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-medium text-slate-800">
                    {p.nome}
                    <span className="block text-xs text-slate-400 font-normal">{p.servico}</span>
                  </td>
                  <td className="p-4 text-slate-600">
                    {p.cnpj}
                    <span className="block text-xs text-slate-400 font-normal">{p.razaoSocial}</span>
                  </td>
                  <td className="p-4 font-mono text-xs text-indigo-600 font-semibold">
                    {p.usuario || 'N/A'}
                  </td>
                  <td className="p-4 text-emerald-600 font-bold">
                    R$ {p.valorBase.toFixed(2)}/h
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 inline-block">
                      {p.situacao}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apontamentos / Horas Enviadas para Aprovação */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 font-semibold text-slate-800 flex justify-between items-center">
          <span>Aprovação de Atendimentos e Horas da Equipe</span>
          <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium">
            Pendente de Validação
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
                <th className="p-4 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {tarefas.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-medium text-slate-800">{t.prestadorNome}</td>
                  <td className="p-4 text-slate-600">{t.pacienteNome || 'Não especificado'}</td>
                  <td className="p-4 font-semibold text-slate-800">
                    {t.horasTrabalhadas}h <span className="text-xs text-emerald-600 font-normal">(R$ {t.valorEntrega.toFixed(2)})</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      t.status === 'APROVADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro de Funcionário / Prestador */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-800">Cadastrar Novo Profissional (Funcionário PJ)</h2>
              <button 
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCadastrarFuncionario} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: Dra. Juliana Souza"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Razão Social</label>
                  <input
                    type="text"
                    required
                    value={razaoSocial}
                    onChange={e => setRazaoSocial(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: Souza Saude S/S"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">CNPJ</label>
                  <input
                    type="text"
                    required
                    value={cnpj}
                    onChange={e => setCnpj(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="email@clinica.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Especialidade / Serviço</label>
                  <input
                    type="text"
                    required
                    value={servico}
                    onChange={e => setServico(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ex: Enfermagem UTI"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Valor da Hora Base (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={valorBase}
                  onChange={e => setValorBase(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs font-bold text-slate-700 mb-2">Credenciais de Acesso do Funcionário</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nome de Usuário (Login)</label>
                    <input
                      type="text"
                      required
                      value={usuario}
                      onChange={e => setUsuario(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                      placeholder="juliana.souza"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Senha Provisória</label>
                    <input
                      type="password"
                      required
                      value={senha}
                      onChange={e => setSenha(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="••••••••"
                    />
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