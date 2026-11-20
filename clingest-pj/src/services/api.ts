import type { EmpresaTenant, RegraNegocioSaaS } from '../types/contrato';
import type { PrestadorPJ } from '../types/prestador';
import type { StatusTarefa, TarefaPJ } from '../types/tarefa';
import type {
  CredencialMasterView,
  RegistroMovimentacaoAcesso,
  UsuarioSistema
} from '../types/usuario';

const STORAGE_KEYS = {
  EMPRESAS: '@clingest_core_empresas',
  PRESTADORES: '@clingest_core_prestadores',
  TAREFAS: '@clingest_core_tarefas',
  REGRAS: '@clingest_core_regras',
  ACESSOS: '@clingest_core_acessos',
  SESSAO: '@clingest_core_sessao'
};

const MASTER_PADRAO = {
  id: 'master-root',
  nome: 'Henrique Master',
  email: 'henrique@clingest.com',
  senha: '123456',
  perfil: 'MASTER' as const,
  empresaId: 'global',
  empresaNome: 'Clingest SaaS'
};

const REGRAS_PADRAO: RegraNegocioSaaS = {
  bloquearExcessoLicencas: true,
  valorAdicionalLicenca: 0,
  exigirAprovacaoEntrega: true,
  permitirContratoHora: true,
  permitirContratoPlantao: true,
  permitirContratoMensal: true,
  limitePadraoLicencas: 10,
  mensalidadePadrao: 1490
};

function gerarId(prefixo: string): string {
  return `${prefixo}-${Math.random().toString(36).substring(2, 10)}`;
}

function hojeISO(): string {
  return new Date().toISOString().split('T')[0];
}

function agoraFormatado(): string {
  const agora = new Date();
  return `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
}

function garantirDadosIniciais(): void {
  if (!localStorage.getItem(STORAGE_KEYS.REGRAS)) {
    localStorage.setItem(STORAGE_KEYS.REGRAS, JSON.stringify(REGRAS_PADRAO));
  }

  if (!localStorage.getItem(STORAGE_KEYS.EMPRESAS)) {
    const empresasIniciais: EmpresaTenant[] = [
      {
        id: 'emp-1',
        nomeFantasia: 'Hospital São Lucas',
        razaoSocial: 'São Lucas Serviços Médicos Ltda',
        cnpj: '98.765.432/0001-12',
        limitePrestadores: 10,
        valorMensalidade: 1490,
        status: 'ATIVO',
        responsavelNome: 'Dr. Carlos Mendes',
        responsavelEmail: 'gestor@saolucas.com.br',
        senhaGestor: '123456',
        criadoEm: '2026-10-01'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.EMPRESAS, JSON.stringify(empresasIniciais));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PRESTADORES)) {
    const prestadoresIniciais: PrestadorPJ[] = [
      {
        id: 'pj-1',
        empresaId: 'emp-1',
        nome: 'Mariana Costa',
        razaoSocial: 'Costa Saúde S/S',
        cnpj: '12.345.678/0001-90',
        email: 'mariana.costa@clinica.com',
        senha: '123',
        servico: 'Enfermagem UTI',
        remuneracao: 'PLANTAO',
        valorBase: 650,
        contratoStatus: 'VIGENTE',
        situacao: 'ATIVO',
        dataEntrada: '2026-10-02',
        criadoEm: '2026-10-02'
      }
    ];
    localStorage.setItem(
      STORAGE_KEYS.PRESTADORES,
      JSON.stringify(prestadoresIniciais)
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.TAREFAS)) {
    const tarefasIniciais: TarefaPJ[] = [
      {
        id: 'tar-1',
        empresaId: 'emp-1',
        prestadorId: 'pj-1',
        prestadorNome: 'Mariana Costa',
        titulo: 'Plantão Noturno UTI - Ala A',
        horasTrabalhadas: 2,
        valorUnitario: 650,
        valorEntrega: 1300,
        status: 'PAGO',
        prazo: '2026-11-10',
        dataPagamento: '2026-11-15'
      },
      {
        id: 'tar-2',
        empresaId: 'emp-1',
        prestadorId: 'pj-1',
        prestadorNome: 'Mariana Costa',
        titulo: 'Plantão Diurno UTI - Ala B',
        horasTrabalhadas: 1,
        valorUnitario: 650,
        valorEntrega: 650,
        status: 'APROVADO',
        prazo: '2026-11-18'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.TAREFAS, JSON.stringify(tarefasIniciais));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ACESSOS)) {
    localStorage.setItem(STORAGE_KEYS.ACESSOS, JSON.stringify([]));
  }
}

garantirDadosIniciais();

export const apiEmpresas = {
  getEmpresas: (): EmpresaTenant[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPRESAS);
    return raw ? JSON.parse(raw) : [];
  },

  getEmpresaPorId: (id: string): EmpresaTenant | undefined => {
    return apiEmpresas.getEmpresas().find((e) => e.id === id);
  },

  salvarEmpresa: (
    dados: Omit<EmpresaTenant, 'id' | 'criadoEm' | 'status'>
  ): EmpresaTenant[] => {
    const lista = apiEmpresas.getEmpresas();
    const nova: EmpresaTenant = {
      ...dados,
      id: gerarId('emp'),
      status: 'ATIVO',
      criadoEm: hojeISO()
    };
    const atualizadas = [nova, ...lista];
    localStorage.setItem(STORAGE_KEYS.EMPRESAS, JSON.stringify(atualizadas));
    return atualizadas;
  },

  alternarStatusContrato: (id: string): EmpresaTenant[] => {
    const atualizadas = apiEmpresas.getEmpresas().map((emp) =>
      emp.id === id
        ? {
            ...emp,
            status: emp.status === 'ATIVO' ? ('SUSPENSO' as const) : ('ATIVO' as const)
          }
        : emp
    );
    localStorage.setItem(STORAGE_KEYS.EMPRESAS, JSON.stringify(atualizadas));
    return atualizadas;
  }
};

export const api = {
  getRegrasNegocio: (): RegraNegocioSaaS => {
    const raw = localStorage.getItem(STORAGE_KEYS.REGRAS);
    return raw ? { ...REGRAS_PADRAO, ...JSON.parse(raw) } : REGRAS_PADRAO;
  },

  salvarRegrasNegocio: (regras: RegraNegocioSaaS): RegraNegocioSaaS => {
    localStorage.setItem(STORAGE_KEYS.REGRAS, JSON.stringify(regras));
    return regras;
  },

  getPrestadores: (): PrestadorPJ[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESTADORES);
    return raw ? JSON.parse(raw) : [];
  },

  getPrestadoresPorEmpresa: (empresaId: string): PrestadorPJ[] => {
    return api.getPrestadores().filter((p) => p.empresaId === empresaId);
  },

  getPrestadorPorId: (id: string): PrestadorPJ | undefined => {
    return api.getPrestadores().find((p) => p.id === id);
  },

  salvarPrestador: (
    dados: Omit<
      PrestadorPJ,
      'id' | 'contratoStatus' | 'situacao' | 'dataEntrada' | 'dataSaida' | 'criadoEm'
    >
  ): PrestadorPJ[] => {
    const todos = api.getPrestadores();
    const dataAtual = hojeISO();
    const novo: PrestadorPJ = {
      ...dados,
      id: gerarId('pj'),
      contratoStatus: 'VIGENTE',
      situacao: 'ATIVO',
      dataEntrada: dataAtual,
      criadoEm: dataAtual
    };
    const atualizados = [novo, ...todos];
    localStorage.setItem(STORAGE_KEYS.PRESTADORES, JSON.stringify(atualizados));
    return atualizados.filter((p) => p.empresaId === dados.empresaId);
  },

  alternarSituacaoPrestador: (id: string, empresaId: string): PrestadorPJ[] => {
    const todos = api.getPrestadores().map((p) => {
      if (p.id !== id) return p;
      const ativando = p.situacao !== 'ATIVO';
      return {
        ...p,
        situacao: ativando ? ('ATIVO' as const) : ('INATIVO' as const),
        contratoStatus: ativando ? ('VIGENTE' as const) : ('ENCERRADO' as const),
        dataSaida: ativando ? undefined : hojeISO()
      };
    });
    localStorage.setItem(STORAGE_KEYS.PRESTADORES, JSON.stringify(todos));
    return todos.filter((p) => p.empresaId === empresaId);
  },

  getTarefas: (): TarefaPJ[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.TAREFAS);
    return raw ? JSON.parse(raw) : [];
  },

  getTarefasPorEmpresa: (empresaId: string): TarefaPJ[] => {
    return api.getTarefas().filter((t) => t.empresaId === empresaId);
  },

  getTarefasPorPrestador: (prestadorId: string): TarefaPJ[] => {
    return api.getTarefas().filter((t) => t.prestadorId === prestadorId);
  },

  salvarTarefa: (
    dados: Omit<TarefaPJ, 'id' | 'valorEntrega' | 'status'>
  ): TarefaPJ[] => {
    const regras = api.getRegrasNegocio();
    const todas = api.getTarefas();
    const statusInicial: StatusTarefa = regras.exigirAprovacaoEntrega
      ? 'PENDENTE'
      : 'APROVADO';

    const nova: TarefaPJ = {
      ...dados,
      id: gerarId('tar'),
      valorEntrega: Number((dados.horasTrabalhadas * dados.valorUnitario).toFixed(2)),
      status: statusInicial
    };

    const atualizadas = [nova, ...todas];
    localStorage.setItem(STORAGE_KEYS.TAREFAS, JSON.stringify(atualizadas));
    return atualizadas;
  },

  atualizarStatusTarefa: (
    id: string,
    status: StatusTarefa,
    empresaId: string
  ): TarefaPJ[] => {
    const todas = api.getTarefas().map((t) => {
      if (t.id !== id) return t;
      return {
        ...t,
        status,
        dataPagamento: status === 'PAGO' ? hojeISO() : t.dataPagamento
      };
    });
    localStorage.setItem(STORAGE_KEYS.TAREFAS, JSON.stringify(todas));
    return todas.filter((t) => t.empresaId === empresaId);
  },

  getCredenciaisConsolidadas: (): CredencialMasterView[] => {
    const empresas = apiEmpresas.getEmpresas();
    const prestadores = api.getPrestadores();
    const mapaEmpresas = new Map(empresas.map((e) => [e.id, e]));

    const lista: CredencialMasterView[] = [
      {
        id: MASTER_PADRAO.id,
        nome: MASTER_PADRAO.nome,
        email: MASTER_PADRAO.email,
        senha: MASTER_PADRAO.senha,
        perfil: 'MASTER',
        empresaId: 'global',
        empresaNome: 'Clingest SaaS',
        ativo: true
      }
    ];

    empresas.forEach((emp) => {
      lista.push({
        id: `gestor-${emp.id}`,
        nome: emp.responsavelNome,
        email: emp.responsavelEmail,
        senha: emp.senhaGestor,
        perfil: 'GESTOR',
        empresaId: emp.id,
        empresaNome: emp.nomeFantasia,
        ativo: emp.status === 'ATIVO'
      });
    });

    prestadores.forEach((p) => {
      const emp = mapaEmpresas.get(p.empresaId);
      lista.push({
        id: p.id,
        nome: p.nome,
        email: p.email,
        senha: p.senha,
        perfil: 'PRESTADOR',
        empresaId: p.empresaId,
        empresaNome: emp ? emp.nomeFantasia : 'Sem vínculo',
        ativo: p.situacao === 'ATIVO' && emp?.status === 'ATIVO'
      });
    });

    return lista;
  },

  redefinirSenhaUsuario: (email: string, novaSenha: string): void => {
    const emailNorm = email.trim().toLowerCase();

    const empresas = apiEmpresas.getEmpresas().map((emp) =>
      emp.responsavelEmail.toLowerCase() === emailNorm
        ? { ...emp, senhaGestor: novaSenha }
        : emp
    );
    localStorage.setItem(STORAGE_KEYS.EMPRESAS, JSON.stringify(empresas));

    const prestadores = api.getPrestadores().map((p) =>
      p.email.toLowerCase() === emailNorm ? { ...p, senha: novaSenha } : p
    );
    localStorage.setItem(STORAGE_KEYS.PRESTADORES, JSON.stringify(prestadores));
  },

  getMovimentacoesAcesso: (): RegistroMovimentacaoAcesso[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.ACESSOS);
    return raw ? JSON.parse(raw) : [];
  },

  registrarMovimentacaoAcesso: (
    dados: Omit<RegistroMovimentacaoAcesso, 'id' | 'dataHora'>
  ): void => {
    const lista = api.getMovimentacoesAcesso();
    const novo: RegistroMovimentacaoAcesso = {
      ...dados,
      id: gerarId('acc'),
      dataHora: agoraFormatado()
    };
    localStorage.setItem(
      STORAGE_KEYS.ACESSOS,
      JSON.stringify([novo, ...lista].slice(0, 100))
    );
  }
};

export const apiAuth = {
  login: (
    email: string,
    senha: string
  ): { ok: boolean; erro?: string; usuario?: UsuarioSistema } => {
    const emailNorm = email.trim().toLowerCase();
    const senhaNorm = senha.trim();

    if (!emailNorm || !senhaNorm) {
      return { ok: false, erro: 'Preencha e-mail e senha para acessar.' };
    }

    if (
      emailNorm === MASTER_PADRAO.email &&
      senhaNorm === MASTER_PADRAO.senha
    ) {
      const usuario: UsuarioSistema = {
        id: MASTER_PADRAO.id,
        nome: MASTER_PADRAO.nome,
        email: MASTER_PADRAO.email,
        senha: MASTER_PADRAO.senha,
        perfil: 'MASTER',
        empresaNome: 'Clingest SaaS'
      };
      localStorage.setItem(STORAGE_KEYS.SESSAO, JSON.stringify(usuario));
      api.registrarMovimentacaoAcesso({
        usuarioNome: usuario.nome,
        usuarioEmail: usuario.email,
        perfil: 'MASTER',
        empresaNome: 'Clingest SaaS',
        tipo: 'ENTRADA'
      });
      return { ok: true, usuario };
    }

    const empresa = apiEmpresas
      .getEmpresas()
      .find(
        (e) =>
          e.responsavelEmail.toLowerCase() === emailNorm &&
          e.senhaGestor === senhaNorm
      );

    if (empresa) {
      if (empresa.status !== 'ATIVO') {
        return {
          ok: false,
          erro: 'O contrato desta clínica está desativado pelo Master.'
        };
      }

      const usuario: UsuarioSistema = {
        id: `gestor-${empresa.id}`,
        nome: empresa.responsavelNome,
        email: empresa.responsavelEmail,
        senha: empresa.senhaGestor,
        perfil: 'GESTOR',
        empresaId: empresa.id,
        empresaNome: empresa.nomeFantasia
      };
      localStorage.setItem(STORAGE_KEYS.SESSAO, JSON.stringify(usuario));
      api.registrarMovimentacaoAcesso({
        usuarioNome: usuario.nome,
        usuarioEmail: usuario.email,
        perfil: 'GESTOR',
        empresaNome: empresa.nomeFantasia,
        tipo: 'ENTRADA'
      });
      return { ok: true, usuario };
    }

    const prestador = api
      .getPrestadores()
      .find(
        (p) => p.email.toLowerCase() === emailNorm && p.senha === senhaNorm
      );

    if (prestador) {
      const empresaVinculada = apiEmpresas.getEmpresaPorId(prestador.empresaId);

      if (!empresaVinculada || empresaVinculada.status !== 'ATIVO') {
        return {
          ok: false,
          erro: 'A clínica contratante está com o contrato inativo.'
        };
      }

      if (prestador.situacao !== 'ATIVO') {
        return {
          ok: false,
          erro: 'Seu acesso foi desativado pelo RH da clínica.'
        };
      }

      const usuario: UsuarioSistema = {
        id: prestador.id,
        nome: prestador.nome,
        email: prestador.email,
        senha: prestador.senha,
        perfil: 'PRESTADOR',
        empresaId: empresaVinculada.id,
        empresaNome: empresaVinculada.nomeFantasia
      };
      localStorage.setItem(STORAGE_KEYS.SESSAO, JSON.stringify(usuario));
      api.registrarMovimentacaoAcesso({
        usuarioNome: usuario.nome,
        usuarioEmail: usuario.email,
        perfil: 'PRESTADOR',
        empresaNome: empresaVinculada.nomeFantasia,
        tipo: 'ENTRADA'
      });
      return { ok: true, usuario };
    }

    return { ok: false, erro: 'Credenciais inválidas.' };
  },

  getSessao: (): UsuarioSistema | null => {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSAO);
    return raw ? JSON.parse(raw) : null;
  },

  logout: (): void => {
    const atual = apiAuth.getSessao();
    if (atual) {
      api.registrarMovimentacaoAcesso({
        usuarioNome: atual.nome,
        usuarioEmail: atual.email,
        perfil: atual.perfil,
        empresaNome: atual.empresaNome || 'Clingest SaaS',
        tipo: 'SAIDA'
      });
    }
    localStorage.removeItem(STORAGE_KEYS.SESSAO);
  }
};