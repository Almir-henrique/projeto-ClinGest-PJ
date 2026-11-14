import type { PrestadorPJ } from '../types/prestador';
import type { DocumentoCompliance } from '../types/compliance';
import type { FaturamentoPJ, StatusFaturamento } from '../types/faturamento';
import type { TarefaPJ, StatusTarefa } from '../types/tarefa';

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
  TAREFAS: '@clingest_tarefas'
};

export const api = {
  getPrestadores: async (): Promise<PrestadorPJ[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.PRESTADORES);
    if (!data) {
      const inicial: PrestadorPJ[] = [
        {
          id: '1',
          nome: 'Dra. Mariana Costa',
          razaoSocial: 'Costa Odontologia S/S',
          cnpj: '12.345.678/0001-90',
          email: 'mariana.costa@email.com',
          servico: 'Odontologia Clínica',
          remuneracao: 'POR_HORA',
          valorBase: 75.00,
          contratoStatus: 'VIGENTE',
          situacao: 'ATIVO',
          usuario: 'mariana.costa',
          senha: '123',
          criadoEm: '2026-01-10'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.PRESTADORES, JSON.stringify(inicial));
      return inicial;
    }
    return JSON.parse(data);
  },

  salvarPrestador: async (prestadorData: Omit<PrestadorPJ, 'id' | 'criadoEm'>): Promise<PrestadorPJ[]> => {
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

  atualizarPrestador: async (prestadorAtualizado: PrestadorPJ): Promise<PrestadorPJ[]> => {
    const prestadores = await api.getPrestadores();
    const atualizados = prestadores.map(p => p.id === prestadorAtualizado.id ? prestadorAtualizado : p);
    localStorage.setItem(STORAGE_KEYS.PRESTADORES, JSON.stringify(atualizados));
    return atualizados;
  },

  excluirPrestador: async (id: string): Promise<PrestadorPJ[]> => {
    const prestadores = await api.getPrestadores();
    const atualizados = prestadores.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRESTADORES, JSON.stringify(atualizados));
    return atualizados;
  },

  getCompliance: async (): Promise<DocumentoCompliance[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.COMPLIANCE);
    if (!data) {
      const inicial: DocumentoCompliance[] = [
        {
          id: '1',
          prestadorId: '1',
          prestadorNome: 'Dra. Mariana Costa',
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

  salvarCompliance: async (docData: Omit<DocumentoCompliance, 'id'>): Promise<DocumentoCompliance[]> => {
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
    const atualizados = lista.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.COMPLIANCE, JSON.stringify(atualizados));
    return atualizados;
  },

  getContratos: async (): Promise<ContratoPJ[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.CONTRATOS);
    if (!data) {
      const inicial: ContratoPJ[] = [
        {
          id: '1',
          prestadorId: '1',
          prestadorNome: 'Dra. Mariana Costa',
          numeroContrato: 'CT-2026/001',
          dataInicio: '2026-01-01',
          dataTermino: '2027-01-01',
          valorMensal: 8500.00,
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
          id: '1',
          prestadorId: '1',
          prestadorNome: 'Dra. Mariana Costa',
          competencia: '10/2026',
          valorBruto: 8500.00,
          impostosRetidos: 510.00,
          valorLiquido: 7990.00,
          status: 'APROVADO',
          dataEmissao: '2026-10-10'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.FATURAMENTO, JSON.stringify(inicial));
      return inicial;
    }
    return JSON.parse(data);
  },

  salvarFaturamento: async (fatData: Omit<FaturamentoPJ, 'id'>): Promise<FaturamentoPJ[]> => {
    const lista = await api.getFaturamento();
    const novo: FaturamentoPJ = {
      ...fatData,
      id: Math.random().toString(36).substr(2, 9)
    };
    const atualizados = [novo, ...lista];
    localStorage.setItem(STORAGE_KEYS.FATURAMENTO, JSON.stringify(atualizados));
    return atualizados;
  },

  atualizarStatusFaturamento: async (id: string, status: StatusFaturamento): Promise<FaturamentoPJ[]> => {
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
          prestadorId: '1',
          prestadorNome: 'Dra. Mariana Costa',
          competencia: '10/2026',
          numeroNF: '000123',
          valor: 8500.00,
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

  salvarNotaFiscal: async (nfData: Omit<NotaFiscalPJ, 'id' | 'dataUpload' | 'status'>): Promise<NotaFiscalPJ[]> => {
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
          prestadorId: '1',
          prestadorNome: 'Dra. Mariana Costa',
          titulo: 'Plantão Odontológico - UTI',
          descricao: 'Atendimento de plantão especializado na UTI',
          pacienteNome: 'João Silva',
          horasTrabalhadas: 8,
          valorEntrega: 600.00,
          status: 'APROVADO',
          prazo: '2026-10-20'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.TAREFAS, JSON.stringify(inicial));
      return inicial;
    }
    return JSON.parse(data);
  },

  salvarTarefa: async (tarefaData: Omit<TarefaPJ, 'id'>): Promise<TarefaPJ[]> => {
    const tarefas = await api.getTarefas();
    const nova: TarefaPJ = {
      ...tarefaData,
      id: Math.random().toString(36).substr(2, 9)
    };
    const atualizadas = [nova, ...tarefas];
    localStorage.setItem(STORAGE_KEYS.TAREFAS, JSON.stringify(atualizadas));
    return atualizadas;
  },

  atualizarStatusTarefa: async (id: string, status: StatusTarefa): Promise<TarefaPJ[]> => {
    const tarefas = await api.getTarefas();
    const atualizadas = tarefas.map((t: TarefaPJ) => (t.id === id ? { ...t, status } : t));
    localStorage.setItem(STORAGE_KEYS.TAREFAS, JSON.stringify(atualizadas));
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

  registrarAuditLog: async (acao: string, usuario: string, detalhes: string): Promise<void> => {
    const logs = await api.getAuditLogs();
    const novoLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 16),
      acao,
      usuario,
      detalhes
    };
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([novoLog, ...logs]));
  },

  getChamados: async (): Promise<ChamadoPJ[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAMADOS);
    if (!data) {
      const inicial: ChamadoPJ[] = [
        {
          id: '1',
          prestadorId: '1',
          prestadorNome: 'Dra. Mariana Costa',
          assunto: 'Dúvida sobre NFS-e',
          mensagem: 'Como faço o upload da nota fiscal de prestação de serviços?',
          status: 'ABERTO',
          dataCriacao: '2026-10-24'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.CHAMADOS, JSON.stringify(inicial));
      return inicial;
    }
    return JSON.parse(data);
  },

  responderChamado: async (chamadoId: string, resposta: string): Promise<ChamadoPJ[]> => {
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