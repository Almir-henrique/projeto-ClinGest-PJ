import type { UsuarioSistema } from '../types/usuario';
import type { PrestadorPJ } from '../types/prestador';
import type { ClientePJ, ContratoPJ } from '../types/contrato';
import type { AtendimentoPJ, StatusAtendimento } from '../types/atendimento';
import type { FaturamentoPJ } from '../types/faturamento';
import type { PagamentoPJ } from '../types/pagamento';

const STORAGE_KEYS = {
  USUARIOS: '@clingest_usuarios',
  PRESTADORES: '@clingest_prestadores',
  CLIENTES: '@clingest_clientes',
  CONTRATOS: '@clingest_contratos',
  ATENDIMENTOS: '@clingest_atendimentos',
  FATURAMENTO: '@clingest_faturamento',
  PAGAMENTOS: '@clingest_pagamentos'
};

const usuariosIniciais: UsuarioSistema[] = [
  { id: 'u1', nome: 'Henrique Master', email: 'henrique@clingest.com', usuario: 'Henrique_dev', perfil: 'MASTER', ativo: true, criadoEm: '2026-10-01' },
  { id: 'u2', nome: 'Gestor Operacional', email: 'gestor@clingest.com', usuario: 'gestor', perfil: 'GESTOR', ativo: true, criadoEm: '2026-10-01' },
  { id: 'u3', nome: 'Mariana Costa', email: 'mariana.costa@clinica.com', usuario: 'mariana.costa', perfil: 'PRESTADOR', prestadorId: 'p1', ativo: true, criadoEm: '2026-10-01' }
];

const prestadoresIniciais: PrestadorPJ[] = [
  { 
    id: 'p1', 
    nome: 'Mariana Costa', 
    razaoSocial: 'Costa Saude S/S', 
    cnpj: '12.345.678/0001-90', 
    email: 'mariana.costa@clinica.com', 
    servico: 'Enfermagem UTI', 
    remuneracao: 'POR_HORA',
    valorBase: 75.00,
    contratoStatus: 'VIGENTE',
    situacao: 'ATIVO', 
    criadoEm: '2026-10-01' 
  }
];

const clientesIniciais: ClientePJ[] = [
  { id: 'cl1', nomeFantasia: 'Hospital Sao Lucas', razaoSocial: 'Sao Lucas Servicos Medicos Ltda', cnpj: '98.765.432/0001-12' }
];

const contratosIniciais: ContratoPJ[] = [
  { id: 'ct1', prestadorId: 'p1', clienteId: 'cl1', numeroContrato: 'CTR-2026/001', valorHora: 50.00, dataInicio: '2026-01-01', dataTermino: '2027-01-01', status: 'VIGENTE' }
];

const atendimentosIniciais: AtendimentoPJ[] = [
  { id: 'at1', prestadorId: 'p1', clienteId: 'cl1', pacienteNome: 'Carlos Alberto', dataAtendimento: '2026-10-25', horasTrabalhadas: 8, valorHoraAplicado: 50.00, valorTotal: 400.00, status: 'APROVADO' }
];

const faturamentoIniciais: FaturamentoPJ[] = [
  {
    id: 'fat1',
    prestadorId: 'p1',
    prestadorNome: 'Mariana Costa',
    competencia: '10/2026',
    totalHoras: 8,
    valorBruto: 400.00,
    impostosRetidos: 24.00,
    valorLiquido: 376.00,
    status: 'HOMOLOGADO',
    dataEmissao: '2026-10-28'
  }
];

const pagamentosIniciais: PagamentoPJ[] = [
  {
    id: 'pag1',
    prestadorId: 'p1',
    prestadorNome: 'Mariana Costa',
    competencia: '10/2026',
    valorLiquido: 376.00,
    dataPagamento: '2026-10-30',
    status: 'QUITADO',
    comprovanteCodigo: 'PIX-998823719283'
  }
];

function getStorage<T>(key: string, initial: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try { return JSON.parse(data); } catch { return initial; }
}

function setStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const dbService = {
  getUsuarios: (): UsuarioSistema[] => getStorage(STORAGE_KEYS.USUARIOS, usuariosIniciais),
  getPrestadores: (): PrestadorPJ[] => getStorage(STORAGE_KEYS.PRESTADORES, prestadoresIniciais),
  getClientes: (): ClientePJ[] => getStorage(STORAGE_KEYS.CLIENTES, clientesIniciais),
  getContratos: (): ContratoPJ[] => getStorage(STORAGE_KEYS.CONTRATOS, contratosIniciais),
  getAtendimentos: (): AtendimentoPJ[] => getStorage(STORAGE_KEYS.ATENDIMENTOS, atendimentosIniciais),

  salvarAtendimento: (novo: Omit<AtendimentoPJ, 'id' | 'valorTotal' | 'status'>): AtendimentoPJ[] => {
    const lista = dbService.getAtendimentos();
    const contratos = dbService.getContratos();
    
    const contratoVigente = contratos.find(c => c.prestadorId === novo.prestadorId && c.status === 'VIGENTE');
    const valorHora = contratoVigente ? contratoVigente.valorHora : 0;
    
    const item: AtendimentoPJ = {
      id: String(Date.now()),
      ...novo,
      valorHoraAplicado: valorHora,
      valorTotal: novo.horasTrabalhadas * valorHora,
      status: 'PENDENTE'
    };

    const atualizados = [item, ...lista];
    setStorage(STORAGE_KEYS.ATENDIMENTOS, atualizados);
    return atualizados;
  },

  atualizarStatusAtendimento: (id: string, status: StatusAtendimento): AtendimentoPJ[] => {
    const lista = dbService.getAtendimentos();
    const atualizados = lista.map(a => a.id === id ? { ...a, status } : a);
    setStorage(STORAGE_KEYS.ATENDIMENTOS, atualizados);
    return atualizados;
  }
};

export const dbServiceFaturamento = {
  getFaturamentos: (): FaturamentoPJ[] => getStorage(STORAGE_KEYS.FATURAMENTO, faturamentoIniciais),

  gerarFechamentoMensal: (prestadorId: string, competencia: string): FaturamentoPJ[] => {
    const atendimentos = dbService.getAtendimentos();
    const prestadores = dbService.getPrestadores();
    const prestador = prestadores.find(p => p.id === prestadorId);
    
    const aprovados = atendimentos.filter(a => a.prestadorId === prestadorId && a.status === 'APROVADO');
    const totalHoras = aprovados.reduce((acc, curr) => acc + curr.horasTrabalhadas, 0);
    const valorBruto = aprovados.reduce((acc, curr) => acc + curr.valorTotal, 0);
    
    const impostosRetidos = valorBruto * 0.06;
    const valorLiquido = valorBruto - impostosRetidos;

    const lista = dbServiceFaturamento.getFaturamentos();
    const novoFechamento: FaturamentoPJ = {
      id: String(Date.now()),
      prestadorId,
      prestadorNome: prestador ? prestador.nome : 'Prestador PJ',
      competencia,
      totalHoras,
      valorBruto,
      impostosRetidos,
      valorLiquido,
      status: 'ABERTO',
      dataEmissao: new Date().toISOString().split('T')[0]
    };

    const atualizados = [novoFechamento, ...lista];
    setStorage(STORAGE_KEYS.FATURAMENTO, atualizados);
    return atualizados;
  }
};

export const dbServicePagamentos = {
  getPagamentos: (): PagamentoPJ[] => getStorage(STORAGE_KEYS.PAGAMENTOS, pagamentosIniciais),

  quitarPagamento: (id: string, codigoComprovante: string): PagamentoPJ[] => {
    const lista = dbServicePagamentos.getPagamentos();
    const atualizados = lista.map(p => p.id === id ? {
      ...p,
      status: 'QUITADO' as const,
      dataPagamento: new Date().toISOString().split('T')[0],
      comprovanteCodigo: codigoComprovante
    } : p);
    setStorage(STORAGE_KEYS.PAGAMENTOS, atualizados);
    return atualizados;
  }
};