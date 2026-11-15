import type { PrestadorPJ } from '../types/prestador';
import type { DocumentoCompliance } from '../types/compliance';
import type { FaturamentoPJ, StatusFaturamento } from '../types/faturamento';
import type { TarefaPJ, StatusTarefa } from '../types/tarefa';
import type { EmpresaTenant } from '../types/contrato';
import type { AtendimentoPJ } from '../types/atendimento';
import type { UsuarioSistema } from '../types/usuario';

export interface ContratoPJ {
  id: string;
  prestadorId: string;
  prestadorNome: string;
  numeroContrato: string;
  dataInicio: string;
  dataTermino: string;
  valorMensal: number;
  status: 'VIGENTE' | 'VENCENDO' | 'RESCINDIDO';
}

export interface NotaFiscalPJ {
  id: string;
  prestadorId: string;
  prestadorNome: string;
  competencia: string;
  numeroNF: string;
  valor: number;
  arquivoNome: string;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADA' | 'HOMOLOGADO';
  dataUpload: string;
  urlArquivo?: string;
}

export interface AuditLog {
  id: string;
  dataHora: string;
  acao: string;
  usuario: string;
  detalhes: string;
}

export interface ChamadoPJ {
  id: string;
  prestadorId: string;
  prestadorNome: string;
  assunto: string;
  mensagem: string;
  status: 'ABERTO' | 'RESPONDIDO';
  respostaAdmin?: string;
  dataCriacao: string;
}

const STORAGE_KEYS = {
  PRESTADORES: '@clingest_prestadores',
  COMPLIANCE: '@clingest_compliance',
  CONTRATOS: '@clingest_contratos',
  NOTAS_FISCAIS: '@clingest_nfs',
  AUDIT_LOGS: '@clingest_audit',
  CHAMADOS: '@clingest_chamados',
  FATURAMENTO: '@clingest_faturamento',
  TAREFAS: '@clingest_tarefas',
  ATENDIMENTOS: '@clingest_atendimentos',
  USUARIOS: '@clingest_usuarios',
  USUARIOS_MASTER: 'clingest_usuarios_admin',
  EMPRESAS_TENANTS: '@clingest_empresas_tenants'
};

function sincronizarTarefaComAtendimento(tarefa: TarefaPJ): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATENDIMENTOS);
    const atendimentos: AtendimentoPJ[] = raw ? JSON.parse(raw) : [];

    const horas = tarefa.horasTrabalhadas ?? 0;
    const valorHora =
      horas > 0 ? Number((tarefa.valorEntrega / horas).toFixed(2)) : 0;

    const statusAtendimento =
      tarefa.status === 'APROVADO'
        ? 'APROVADO'
        : tarefa.status === 'REJEITADO'
        ? 'REJEITADO'
        : 'PENDENTE';

    const atendimentoEquivalente: AtendimentoPJ = {
      id: `tar-${tarefa.id}`,
      prestadorId: tarefa.prestadorId,
      clienteId: 'cl1',
      pacienteNome: tarefa.pacienteNome || tarefa.titulo,
      dataAtendimento: tarefa.prazo || new Date().toISOString().split('T')[0],
      horasTrabalhadas: horas,
      valorHoraAplicado: valorHora,
      valorTotal: tarefa.valorEntrega,
      status: statusAtendimento
    };

    const existe = atendimentos.some((a) => a.id === atendimentoEquivalente.id);
    const atualizados = existe
      ? atendimentos.map((a) =>
          a.id === atendimentoEquivalente.id ? atendimentoEquivalente : a
        )
      : [atendimentoEquivalente, ...atendimentos];

    localStorage.setItem(STORAGE_KEYS.ATENDIMENTOS, JSON.stringify(atualizados));
  } catch {
    // Ignora falha de leitura no storage secundário
  }
}

export const apiEmpresas = {
  getEmpresas: async (): Promise<EmpresaTenant[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.EMPRESAS_TENANTS);
    if (!data) {
      const inicial: EmpresaTenant[] = [
        {
          id: 'emp1',
          nomeFantasia: 'Hospital Sao Lucas',
          razaoSocial: 'Sao Lucas Servicos Medicos Ltda',
          cnpj: '98.765.432/0001-12',
          limitePrestadores: 15,
          valorMensalidade: 1490.0,
          status: 'ATIVO',
          criadoEm: '2026-10-01'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.EMPRESAS_TENANTS, JSON.stringify(inicial));
      return inicial;
    }
    return JSON.parse(data);
  },

  salvarEmpresa: async (
    dados: Omit<EmpresaTenant, 'id' | 'criadoEm'>
  ): Promise<EmpresaTenant[]> => {
    const empresas = await apiEmpresas.getEmpresas();
    const nova: EmpresaTenant = {
      ...dados,
      id: Math.random().toString(36).substr(2, 9),
      criadoEm: new Date().toISOString().split('T')[0]
    };
    const atualizadas = [nova, ...empresas];
    localStorage.setItem(STORAGE_KEYS.EMPRESAS_TENANTS, JSON.stringify(atualizadas));
    return atualizadas;
  },

  atualizarStatusEmpresa: async (
    id: string,
    status: 'ATIVO' | 'SUSPENSO'
  ): Promise<EmpresaTenant[]> => {
    const empresas = await apiEmpresas.getEmpresas();
    const atualizadas = empresas.map((emp) =>
      emp.id === id ? { ...emp, status } : emp
    );
    localStorage.setItem(STORAGE_KEYS.EMPRESAS_TENANTS, JSON.stringify(atualizadas));
    return atualizadas;
  }
};

export const api = {
  getPrestadores: async (): Promise<PrestadorPJ[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.PRESTADORES);
    if (!data) {
      const inicial: PrestadorPJ[] = [
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
      localStorage.setItem(STORAGE_KEYS.PRESTADORES, JSON.stringify(inicial));
      return inicial;
    }

    const lista: PrestadorPJ[] = JSON.parse(data);
    let ajustado = false;
    const normalizados = lista.map((p) => {
      if (!p.empresaId && (p.id === 'p1' || p.id === '1')) {
        ajustado = true;
        return { ...p, empresaId: 'emp1' };
      }
      return p;
    });

    if (ajustado) {
      localStorage.setItem(STORAGE_KEYS.PRESTADORES, JSON.stringify(normalizados));
    }

    return normalizados;
  },

  getPrestadoresPorEmpresa: async (empresaId?: string): Promise<PrestadorPJ[]> => {
    const todos = await api.getPrestadores();
    return empresaId ? todos.filter((p) => p.empresaId === empresaId) : todos;
  },

  salvarPrestador: async (
    prestadorData: Omit<PrestadorPJ, 'id' | 'criadoEm'>
  ): Promise<PrestadorPJ[]> => {
    const prestadores = await api.getPrestadores();
    const novo: PrestadorPJ = {
      ...prestadorData,
      id: Math.random().toString(36).substr(2, 9),
      criadoEm: new Date().toISOString().split('T')[0]
    };
    const atualizados = [novo, ...prestadores];
    localStorage.setItem(STORAGE_KEYS.PRESTADORES, JSON.stringify(atualizados));
    return atualizados;
  },

  atualizarPrestador: async (
    prestadorAtualizado: PrestadorPJ
  ): Promise<PrestadorPJ[]> => {
    const prestadores = await api.getPrestadores();
    const atualizados = prestadores.map((p) =>
      p.id === prestadorAtualizado.id ? prestadorAtualizado : p
    );
    localStorage.setItem(STORAGE_KEYS.PRESTADORES, JSON.stringify(atualizados));
    return atualizados;
  },

  excluirPrestador: async (id: string): Promise<PrestadorPJ[]> => {
    const prestadores = await api.getPrestadores();
    const alvo = prestadores.find((p) => p.id === id);
    const atualizados = prestadores.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRESTADORES, JSON.stringify(atualizados));

    try {
      const usuariosSistema: Array<UsuarioSistema & { prestadorId?: string }> =
        JSON.parse(localStorage.getItem(STORAGE_KEYS.USUARIOS) || '[]');
      localStorage.setItem(
        STORAGE_KEYS.USUARIOS,
        JSON.stringify(
          usuariosSistema.filter(
            (u) =>
              u.prestadorId !== id &&
              u.id !== id &&
              (!alvo || u.email.toLowerCase() !== alvo.email.toLowerCase())
          )
        )
      );

      const usuariosMaster = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USUARIOS_MASTER) || '[]'
      );
      localStorage.setItem(
        STORAGE_KEYS.USUARIOS_MASTER,
        JSON.stringify(
          usuariosMaster.filter(
            (u: { id?: string; email?: string }) =>
              u.id !== id &&
              (!alvo || u.email?.toLowerCase() !== alvo.email.toLowerCase())
          )
        )
      );
    } catch {
      // Ignora erro se as chaves ainda não existirem
    }

    return atualizados;
  },

  getCompliance: async (): Promise<DocumentoCompliance[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.COMPLIANCE);
    if (!data) {
      const inicial: DocumentoCompliance[] = [
        {
          id: '1',
          prestadorId: 'p1',
          prestadorNome: 'Mariana Costa',
          tipoDocumento: 'CND Federal e Trabalhista',
          dataValidade: '2027-05-15',
          status: 'VALIDO'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.COMPLIANCE, JSON.stringify(inicial));
      return inicial;
    }
    return JSON.parse(data);
  },

  salvarCompliance: async (
    docData: Omit<DocumentoCompliance, 'id'>
  ): Promise<DocumentoCompliance[]> => {
    const lista = await api.getCompliance();
    const novo: DocumentoCompliance = {
      ...docData,
      id: Math.random().toString(36).substr(2, 9)
    };
    const atualizados = [novo, ...lista];
    localStorage.setItem(STORAGE_KEYS.COMPLIANCE, JSON.stringify(atualizados));
    return atualizados;
  },

  excluirCompliance: async (id: string): Promise<DocumentoCompliance[]> => {
    const lista = await api.getCompliance();
    const atualizados = lista.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.COMPLIANCE, JSON.stringify(atualizados));
    return atualizados;
  },

  getContratos: async (): Promise<ContratoPJ[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.CONTRATOS);
    if (!data) {
      const inicial: ContratoPJ[] = [
        {
          id: '1',
          prestadorId: 'p1',
          prestadorNome: 'Mariana Costa',
          numeroContrato: 'CT-2026/001',
          dataInicio: '2026-01-01',
          dataTermino: '2027-01-01',
          valorMensal: 8500.0,
          status: 'VIGENTE'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.CONTRATOS, JSON.stringify(inicial));
      return inicial;
    }
    return JSON.parse(data);
  },

  getFaturamento: async (): Promise<FaturamentoPJ[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.FATURAMENTO);
    if (!data) {
      const inicial: FaturamentoPJ[] = [
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
      localStorage.setItem(STORAGE_KEYS.FATURAMENTO, JSON.stringify(inicial));
      return inicial;
    }
    return JSON.parse(data);
  },

  salvarFaturamento: async (
    fatData: Omit<FaturamentoPJ, 'id'>
  ): Promise<FaturamentoPJ[]> => {
    const lista = await api.getFaturamento();
    const novo: FaturamentoPJ = {
      ...fatData,
      id: Math.random().toString(36).substr(2, 9)
    };
    const atualizados = [novo, ...lista];
    localStorage.setItem(STORAGE_KEYS.FATURAMENTO, JSON.stringify(atualizados));
    return atualizados;
  },

  atualizarStatusFaturamento: async (
    id: string,
    status: StatusFaturamento
  ): Promise<FaturamentoPJ[]> => {
    const lista = await api.getFaturamento();
    const atualizados = lista.map((item: FaturamentoPJ) => {
      if (item.id === id) {
        return { ...item, status };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEYS.FATURAMENTO, JSON.stringify(atualizados));
    return atualizados;
  },

  excluirFaturamento: async (id: string): Promise<FaturamentoPJ[]> => {
    const lista = await api.getFaturamento();
    const atualizados = lista.filter((item: FaturamentoPJ) => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.FATURAMENTO, JSON.stringify(atualizados));
    return atualizados;
  },

  getNotasFiscais: async (): Promise<NotaFiscalPJ[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTAS_FISCAIS);
    if (!data) {
      const inicial: NotaFiscalPJ[] = [
        {
          id: '1',
          prestadorId: 'p1',
          prestadorNome: 'Mariana Costa',
          competencia: '10/2026',
          numeroNF: '000123',
          valor: 600.0,
          arquivoNome: 'nf-10-2026.pdf',
          status: 'HOMOLOGADO',
          dataUpload: '2026-10-11'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.NOTAS_FISCAIS, JSON.stringify(inicial));
      return inicial;
    }
    return JSON.parse(data);
  },

  salvarNotaFiscal: async (
    nfData: Omit<NotaFiscalPJ, 'id' | 'dataUpload' | 'status'>
  ): Promise<NotaFiscalPJ[]> => {
    const notas = await api.getNotasFiscais();
    const nova: NotaFiscalPJ = {
      ...nfData,
      id: Math.random().toString(36).substr(2, 9),
      dataUpload: new Date().toISOString().split('T')[0],
      status: 'PENDENTE'
    };
    const atualizadas = [nova, ...notas];
    localStorage.setItem(STORAGE_KEYS.NOTAS_FISCAIS, JSON.stringify(atualizadas));
    return atualizadas;
  },

  getTarefas: async (): Promise<TarefaPJ[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.TAREFAS);
    if (!data) {
      const inicial: TarefaPJ[] = [
        {
          id: '1',
          prestadorId: 'p1',
          prestadorNome: 'Mariana Costa',
          titulo: 'Plantao Enfermagem - UTI',
          descricao: 'Atendimento de plantao especializado na UTI',
          pacienteNome: 'Joao Silva',
          horasTrabalhadas: 8,
          valorEntrega: 600.0,
          status: 'APROVADO',
          prazo: '2026-10-20'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.TAREFAS, JSON.stringify(inicial));
      return inicial;
    }
    return JSON.parse(data);
  },

  getTarefasPorEmpresa: async (empresaId?: string): Promise<TarefaPJ[]> => {
    const todas = await api.getTarefas();
    if (!empresaId) return todas;
    const equipe = await api.getPrestadoresPorEmpresa(empresaId);
    const idsEquipe = new Set(equipe.map((p) => p.id));
    return todas.filter((t) => idsEquipe.has(t.prestadorId));
  },

  salvarTarefa: async (tarefaData: Omit<TarefaPJ, 'id'>): Promise<TarefaPJ[]> => {
    const tarefas = await api.getTarefas();
    const nova: TarefaPJ = {
      ...tarefaData,
      id: Math.random().toString(36).substr(2, 9)
    };
    const atualizadas = [nova, ...tarefas];
    localStorage.setItem(STORAGE_KEYS.TAREFAS, JSON.stringify(atualizadas));
    sincronizarTarefaComAtendimento(nova);
    return atualizadas;
  },

  atualizarStatusTarefa: async (
    id: string,
    status: StatusTarefa
  ): Promise<TarefaPJ[]> => {
    const tarefas = await api.getTarefas();
    let tarefaAtualizada: TarefaPJ | undefined;

    const atualizadas = tarefas.map((t: TarefaPJ) => {
      if (t.id === id) {
        tarefaAtualizada = { ...t, status };
        return tarefaAtualizada;
      }
      return t;
    });

    localStorage.setItem(STORAGE_KEYS.TAREFAS, JSON.stringify(atualizadas));
    if (tarefaAtualizada) {
      sincronizarTarefaComAtendimento(tarefaAtualizada);
    }
    return atualizadas;
  },

  excluirTarefa: async (id: string): Promise<TarefaPJ[]> => {
    const tarefas = await api.getTarefas();
    const atualizadas = tarefas.filter((t: TarefaPJ) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TAREFAS, JSON.stringify(atualizadas));
    return atualizadas;
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!data) {
      const inicial: AuditLog[] = [
        {
          id: '1',
          dataHora: '2026-10-24 14:30',
          acao: 'LOGIN_SISTEMA',
          usuario: 'Henrique_dev',
          detalhes: 'Acesso ao painel master realizado com sucesso.'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(inicial));
      return inicial;
    }
    return JSON.parse(data);
  },

  registrarAuditLog: async (
    acao: string,
    usuario: string,
    detalhes: string
  ): Promise<void> => {
    const logs = await api.getAuditLogs();
    const novoLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 16),
      acao,
      usuario,
      detalhes
    };
    localStorage.setItem(
      STORAGE_KEYS.AUDIT_LOGS,
      JSON.stringify([novoLog, ...logs])
    );
  },

  getChamados: async (): Promise<ChamadoPJ[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAMADOS);
    if (!data) {
      const inicial: ChamadoPJ[] = [
        {
          id: '1',
          prestadorId: 'p1',
          prestadorNome: 'Mariana Costa',
          assunto: 'Duvida sobre NFS-e',
          mensagem: 'Como faco o upload da nota fiscal de prestacao de servicos?',
          status: 'ABERTO',
          dataCriacao: '2026-10-24'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.CHAMADOS, JSON.stringify(inicial));
      return inicial;
    }
    return JSON.parse(data);
  },

  responderChamado: async (
    chamadoId: string,
    resposta: string
  ): Promise<ChamadoPJ[]> => {
    const chamados = await api.getChamados();
    const atualizados = chamados.map((ch: ChamadoPJ) => {
      if (ch.id === chamadoId) {
        return {
          ...ch,
          status: 'RESPONDIDO' as const,
          respostaAdmin: resposta
        };
      }
      return ch;
    });
    localStorage.setItem(STORAGE_KEYS.CHAMADOS, JSON.stringify(atualizados));
    return atualizados;
  }
};