import type { UsuarioSistema } from '../types/usuario';
import type { PrestadorPJ } from '../types/prestador';
import type { ClientePJ, ContratoPJ, EmpresaTenant } from '../types/contrato';
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
  PAGAMENTOS: '@clingest_pagamentos',
  EMPRESAS_TENANTS: '@clingest_empresas_tenants',
  EMPRESAS_MASTER: 'clingest_empresas_saas'
};

const usuariosIniciais: UsuarioSistema[] = [
  {
    id: 'u1',
    nome: 'Henrique Master',
    email: 'henrique@clingest.com',
    usuario: 'Henrique_dev',
    senha: '123',
    perfil: 'MASTER',
    ativo: true,
    criadoEm: '2026-10-01'
  },
  {
    id: 'u2',
    empresaId: 'emp1',
    empresaNome: 'Hospital Sao Lucas',
    nome: 'Gestor Operacional',
    email: 'gestor@clingest.com',
    usuario: 'gestor',
    senha: '123',
    perfil: 'GESTOR',
    ativo: true,
    criadoEm: '2026-10-01'
  },
  {
    id: 'u3',
    empresaId: 'emp1',
    empresaNome: 'Hospital Sao Lucas',
    nome: 'Mariana Costa',
    email: 'mariana.costa@clinica.com',
    usuario: 'mariana.costa',
    senha: '123',
    perfil: 'PRESTADOR',
    prestadorId: 'p1',
    ativo: true,
    criadoEm: '2026-10-01'
  }
];

const prestadoresIniciais: PrestadorPJ[] = [
  {
    id: 'p1',
    empresaId: 'emp1',
    nome: 'Mariana Costa',
    razaoSocial: 'Costa Saude S/S',
    cnpj: '12.345.678/0001-90',
    email: 'mariana.costa@clinica.com',
    servico: 'Enfermagem UTI',
    remuneracao: 'POR_HORA',
    valorBase: 75.0,
    contratoStatus: 'VIGENTE',
    situacao: 'ATIVO',
    usuario: 'mariana.costa',
    senha: '123',
    criadoEm: '2026-10-01'
  }
];

const clientesIniciais: ClientePJ[] = [
  {
    id: 'cl1',
    nomeFantasia: 'Hospital Sao Lucas',
    razaoSocial: 'Sao Lucas Servicos Medicos Ltda',
    cnpj: '98.765.432/0001-12'
  }
];

const contratosIniciais: ContratoPJ[] = [
  {
    id: 'ct1',
    prestadorId: 'p1',
    clienteId: 'cl1',
    numeroContrato: 'CTR-2026/001',
    valorHora: 75.0,
    dataInicio: '2026-01-01',
    dataTermino: '2027-01-01',
    status: 'VIGENTE'
  }
];

const atendimentosIniciais: AtendimentoPJ[] = [
  {
    id: 'at1',
    prestadorId: 'p1',
    clienteId: 'cl1',
    pacienteNome: 'Carlos Alberto',
    dataAtendimento: '2026-10-25',
    horasTrabalhadas: 8,
    valorHoraAplicado: 75.0,
    valorTotal: 600.0,
    status: 'APROVADO'
  }
];

const faturamentoIniciais: FaturamentoPJ[] = [
  {
    id: 'fat1',
    prestadorId: 'p1',
    prestadorNome: 'Mariana Costa',
    competencia: '10/2026',
    totalHoras: 8,
    valorBruto: 600.0,
    impostosRetidos: 36.0,
    valorLiquido: 564.0,
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
    valorLiquido: 564.0,
    dataPagamento: '2026-10-30',
    status: 'QUITADO',
    comprovanteCodigo: 'PIX-998823719283'
  }
];

const empresasIniciais: EmpresaTenant[] = [
  {
    id: 'emp1',
    nomeFantasia: 'Hospital Sao Lucas',
    razaoSocial: 'Sao Lucas Servicos Medicos Ltda',
    cnpj: '98.765.432/0001-12',
    limitePrestadores: 15,
    valorMensalidade: 1500.0,
    status: 'ATIVO',
    criadoEm: '2026-10-01'
  }
];

function getStorage<T>(key: string, initial: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initial;
  }
}

function setStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function garantirEmpresaSeedNoMaster(): void {
  try {
    const rawMaster = localStorage.getItem(STORAGE_KEYS.EMPRESAS_MASTER);
    if (!rawMaster) return;

    const listaMaster = JSON.parse(rawMaster);
    if (!Array.isArray(listaMaster)) return;

    const jaExiste = listaMaster.some(
      (e: { id?: string; cnpj?: string }) =>
        e.id === 'emp1' || e.cnpj === '98.765.432/0001-12'
    );

    if (!jaExiste) {
      listaMaster.push({
        id: 'emp1',
        nomeFantasia: 'Hospital Sao Lucas',
        razaoSocial: 'Sao Lucas Servicos Medicos Ltda',
        cnpj: '98.765.432/0001-12',
        emailContato: 'gestor@clingest.com',
        telefone: '(81) 3333-4444',
        plano: 'PROFISSIONAL',
        status: 'ATIVA',
        licencasContratadas: 15,
        valorMensalBase: 1490.0,
        politicaExcedentes: 'COBRAR',
        valorPorExcedente: 49.9,
        dataCadastro: '2026-10-01',
        proximoVencimento: '2026-12-01'
      });
      localStorage.setItem(
        STORAGE_KEYS.EMPRESAS_MASTER,
        JSON.stringify(listaMaster)
      );
    }
  } catch {
    // Ignora falha de leitura caso o Master ainda não tenha sido inicializado
  }
}

garantirEmpresaSeedNoMaster();

export const dbService = {
  getUsuarios: (): UsuarioSistema[] =>
    getStorage(STORAGE_KEYS.USUARIOS, usuariosIniciais),

  getPrestadores: (): PrestadorPJ[] =>
    getStorage(STORAGE_KEYS.PRESTADORES, prestadoresIniciais),

  getPrestadoresPorEmpresa: (empresaId?: string): PrestadorPJ[] => {
    const lista = dbService.getPrestadores();
    return empresaId ? lista.filter((p) => p.empresaId === empresaId) : lista;
  },

  getClientes: (): ClientePJ[] =>
    getStorage(STORAGE_KEYS.CLIENTES, clientesIniciais),

  getContratos: (): ContratoPJ[] =>
    getStorage(STORAGE_KEYS.CONTRATOS, contratosIniciais),

  getAtendimentos: (): AtendimentoPJ[] =>
    getStorage(STORAGE_KEYS.ATENDIMENTOS, atendimentosIniciais),

  getAtendimentosPorEmpresa: (empresaId?: string): AtendimentoPJ[] => {
    const lista = dbService.getAtendimentos();
    if (!empresaId) return lista;
    const idsEquipe = new Set(
      dbService.getPrestadoresPorEmpresa(empresaId).map((p) => p.id)
    );
    return lista.filter((a) => idsEquipe.has(a.prestadorId));
  },

  salvarAtendimento: (
    novo: Omit<AtendimentoPJ, 'id' | 'valorTotal' | 'status'>
  ): AtendimentoPJ[] => {
    const lista = dbService.getAtendimentos();
    const contratos = dbService.getContratos();
    const prestadores = dbService.getPrestadores();

    const contratoVigente = contratos.find(
      (c) => c.prestadorId === novo.prestadorId && c.status === 'VIGENTE'
    );
    const prestador = prestadores.find((p) => p.id === novo.prestadorId);

    const valorHora = contratoVigente
      ? contratoVigente.valorHora
      : prestador?.valorBase || 0;

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

  atualizarStatusAtendimento: (
    id: string,
    status: StatusAtendimento
  ): AtendimentoPJ[] => {
    const lista = dbService.getAtendimentos();
    const atualizados = lista.map((a) => (a.id === id ? { ...a, status } : a));
    setStorage(STORAGE_KEYS.ATENDIMENTOS, atualizados);
    return atualizados;
  }
};

export const dbServiceFaturamento = {
  getFaturamentos: (): FaturamentoPJ[] =>
    getStorage(STORAGE_KEYS.FATURAMENTO, faturamentoIniciais),

  getFaturamentosPorEmpresa: (empresaId?: string): FaturamentoPJ[] => {
    const lista = dbServiceFaturamento.getFaturamentos();
    if (!empresaId) return lista;
    const idsEquipe = new Set(
      dbService.getPrestadoresPorEmpresa(empresaId).map((p) => p.id)
    );
    return lista.filter((f) => idsEquipe.has(f.prestadorId));
  },

  gerarFechamentoMensal: (
    prestadorId: string,
    competencia: string
  ): FaturamentoPJ[] => {
    const atendimentos = dbService.getAtendimentos();
    const prestadores = dbService.getPrestadores();
    const prestador = prestadores.find((p) => p.id === prestadorId);

    const todosAprovados = atendimentos.filter(
      (a) => a.prestadorId === prestadorId && a.status === 'APROVADO'
    );

    // Tenta filtrar pela competência informada (MM/AAAA -> AAAA-MM); caso não haja naquele mês, consolida os aprovados disponíveis
    const partes = competencia.split('/');
    const prefixoData =
      partes.length === 2 ? `${partes[1]}-${partes[0].padStart(2, '0')}` : '';

    const aprovadosNoMes = prefixoData
      ? todosAprovados.filter((a) => a.dataAtendimento.startsWith(prefixoData))
      : [];

    const baseCalculo =
      aprovadosNoMes.length > 0 ? aprovadosNoMes : todosAprovados;

    const totalHoras = baseCalculo.reduce(
      (acc, curr) => acc + curr.horasTrabalhadas,
      0
    );
    const valorBruto = baseCalculo.reduce(
      (acc, curr) =>
        acc +
        (curr.valorTotal > 0
          ? curr.valorTotal
          : curr.horasTrabalhadas * (prestador?.valorBase || 0)),
      0
    );

    const impostosRetidos = Number((valorBruto * 0.06).toFixed(2));
    const valorLiquido = Number((valorBruto - impostosRetidos).toFixed(2));

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

    // Gera automaticamente ordem de pagamento pendente correspondente ao fechamento
    if (valorLiquido > 0) {
      const pagamentosAtuais = dbServicePagamentos.getPagamentos();
      const novoPagamento: PagamentoPJ = {
        id: `pag-${Date.now()}`,
        prestadorId,
        prestadorNome: prestador ? prestador.nome : 'Prestador PJ',
        competencia,
        valorLiquido,
        dataPagamento: '',
        status: 'PENDENTE',
        comprovanteCodigo: 'AGUARDANDO-PIX'
      };
      setStorage(STORAGE_KEYS.PAGAMENTOS, [novoPagamento, ...pagamentosAtuais]);
    }

    return atualizados;
  }
};

export const dbServicePagamentos = {
  getPagamentos: (): PagamentoPJ[] =>
    getStorage(STORAGE_KEYS.PAGAMENTOS, pagamentosIniciais),

  getPagamentosPorEmpresa: (empresaId?: string): PagamentoPJ[] => {
    const lista = dbServicePagamentos.getPagamentos();
    if (!empresaId) return lista;
    const idsEquipe = new Set(
      dbService.getPrestadoresPorEmpresa(empresaId).map((p) => p.id)
    );
    return lista.filter((p) => idsEquipe.has(p.prestadorId));
  },

  quitarPagamento: (
    id: string,
    codigoComprovante: string
  ): PagamentoPJ[] => {
    const lista = dbServicePagamentos.getPagamentos();
    const atualizados = lista.map((p) =>
      p.id === id
        ? {
            ...p,
            status: 'QUITADO' as const,
            dataPagamento: new Date().toISOString().split('T')[0],
            comprovanteCodigo: codigoComprovante
          }
        : p
    );
    setStorage(STORAGE_KEYS.PAGAMENTOS, atualizados);
    return atualizados;
  }
};

export const dbServiceEmpresas = {
  getEmpresas: (): EmpresaTenant[] =>
    getStorage(STORAGE_KEYS.EMPRESAS_TENANTS, empresasIniciais),

  salvarEmpresa: (
    nova: Omit<EmpresaTenant, 'id' | 'criadoEm'>
  ): EmpresaTenant[] => {
    const lista = dbServiceEmpresas.getEmpresas();
    const item: EmpresaTenant = {
      id: String(Date.now()),
      ...nova,
      criadoEm: new Date().toISOString().split('T')[0]
    };
    const atualizados = [item, ...lista];
    setStorage(STORAGE_KEYS.EMPRESAS_TENANTS, atualizados);
    return atualizados;
  },

  atualizarStatusEmpresa: (
    id: string,
    status: 'ATIVO' | 'SUSPENSO'
  ): EmpresaTenant[] => {
    const lista = dbServiceEmpresas.getEmpresas();
    const atualizados = lista.map((e) => (e.id === id ? { ...e, status } : e));
    setStorage(STORAGE_KEYS.EMPRESAS_TENANTS, atualizados);
    return atualizados;
  }
};