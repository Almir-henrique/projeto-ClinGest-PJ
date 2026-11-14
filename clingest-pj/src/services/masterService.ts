import type {
  AtualizarEmpresaContratoInput,
  EmpresaComMetricas,
  EmpresaSaaS,
  IndicadoresDashboardMaster,
  LogAuditoriaMaster,
  MetricasLicencaEmpresa,
  NovaEmpresaInput,
  ResultadoRedefinicaoSenha,
  ResultadoValidacaoAcesso,
  StatusEmpresa,
  StatusUsuarioSistema,
  UsuarioContaMaster
} from '../types/master';

const STORAGE_EMPRESAS = 'clingest_empresas_saas';
const STORAGE_USUARIOS_MASTER = 'clingest_usuarios_admin';
const STORAGE_LOGS_MASTER = 'clingest_logs_master';
const STORAGE_PRESTADORES_SISTEMA = '@clingest_prestadores';

interface RegistroPrestadorLegado {
  id: string;
  empresaId?: string;
  nome: string;
  email?: string;
  situacao?: string;
  status?: string;
  ativo?: boolean;
  senha?: string;
  criadoEm?: string;
  dataCadastro?: string;
}

const EMPRESAS_INICIAIS: EmpresaSaaS[] = [
  {
    id: 'emp-001',
    razaoSocial: 'Instituto Medico Boa Viagem LTDA',
    nomeFantasia: 'Clinica Boa Viagem Saude',
    cnpj: '14.892.340/0001-12',
    emailContato: 'diretoria@clinicaboaviagem.com.br',
    telefoneContato: '(81) 3325-4410',
    dataCadastro: '2026-01-15',
    plano: 'Enterprise 20',
    valorContratoBase: 1490.0,
    licencasContratadas: 20,
    politicaExcedentes: 'COBRAR',
    valorPorExcedente: 55.0,
    vigenciaInicio: '2026-01-15',
    vigenciaFim: '2027-01-14',
    status: 'ATIVA'
  },
  {
    id: 'emp-002',
    razaoSocial: 'Centro Hospitalar Recife Norte S.A.',
    nomeFantasia: 'Hospital Recife Norte',
    cnpj: '28.410.912/0001-88',
    emailContato: 'gestao.pj@hospitalrecifenorte.com.br',
    telefoneContato: '(81) 3421-9000',
    dataCadastro: '2026-03-02',
    plano: 'Growth 10',
    valorContratoBase: 890.0,
    licencasContratadas: 10,
    politicaExcedentes: 'BLOQUEAR',
    valorPorExcedente: 0,
    vigenciaInicio: '2026-03-02',
    vigenciaFim: '2027-03-01',
    status: 'ATIVA'
  },
  {
    id: 'emp-003',
    razaoSocial: 'Clinica Integrada Ilha do Leite LTDA',
    nomeFantasia: 'Integrada Saude',
    cnpj: '39.115.604/0001-45',
    emailContato: 'admin@integrada.med.br',
    telefoneContato: '(81) 3222-1870',
    dataCadastro: '2026-05-10',
    plano: 'Starter 5',
    valorContratoBase: 490.0,
    licencasContratadas: 5,
    politicaExcedentes: 'BLOQUEAR',
    valorPorExcedente: 0,
    vigenciaInicio: '2026-05-10',
    vigenciaFim: '2027-05-09',
    status: 'SUSPENSA'
  }
];

const USUARIOS_INICIAIS: UsuarioContaMaster[] = [
  {
    id: 'usr-101',
    empresaId: 'emp-001',
    empresaNome: 'Clinica Boa Viagem Saude',
    nome: 'Dr. Roberto Almeida',
    email: 'roberto.almeida@clinicaboaviagem.com.br',
    senha: '123',
    perfil: 'GESTOR',
    dataCriacao: '2026-01-15',
    ultimoLogin: '2026-11-14 08:42',
    status: 'ATIVO'
  },
  {
    id: 'usr-102',
    empresaId: 'emp-001',
    empresaNome: 'Clinica Boa Viagem Saude',
    nome: 'Dra. Camila Vasconcelos',
    email: 'camila.vasconcelos@medpj.com.br',
    senha: '123',
    perfil: 'PJ',
    dataCriacao: '2026-01-20',
    ultimoLogin: '2026-11-13 19:15',
    status: 'ATIVO'
  },
  {
    id: 'usr-103',
    empresaId: 'emp-001',
    empresaNome: 'Clinica Boa Viagem Saude',
    nome: 'Dr. Felipe Montenegro',
    email: 'felipe.montenegro@medpj.com.br',
    senha: '123',
    perfil: 'PJ',
    dataCriacao: '2026-02-04',
    ultimoLogin: '2026-11-14 07:10',
    status: 'ATIVO'
  },
  {
    id: 'usr-104',
    empresaId: 'emp-002',
    empresaNome: 'Hospital Recife Norte',
    nome: 'Mariana Costa',
    email: 'mariana.costa@hospitalrecifenorte.com.br',
    senha: '123',
    perfil: 'GESTOR',
    dataCriacao: '2026-03-02',
    ultimoLogin: '2026-11-14 09:05',
    status: 'ATIVO'
  },
  {
    id: 'usr-105',
    empresaId: 'emp-002',
    empresaNome: 'Hospital Recife Norte',
    nome: 'Dr. Lucas Andrade',
    email: 'lucas.andrade@medpj.com.br',
    senha: '123',
    perfil: 'PJ',
    dataCriacao: '2026-03-10',
    ultimoLogin: '2026-11-12 21:30',
    status: 'ATIVO'
  },
  {
    id: 'usr-106',
    empresaId: 'emp-003',
    empresaNome: 'Integrada Saude',
    nome: 'Fernanda Lins',
    email: 'fernanda@integrada.med.br',
    senha: '123',
    perfil: 'GESTOR',
    dataCriacao: '2026-05-10',
    ultimoLogin: '2026-10-28 14:20',
    status: 'ATIVO'
  }
];

function lerListaStorage<T>(chave: string, fallback: T[]): T[] {
  try {
    const bruto = localStorage.getItem(chave);
    if (!bruto) {
      localStorage.setItem(chave, JSON.stringify(fallback));
      return fallback;
    }
    const convertido = JSON.parse(bruto);
    if (!Array.isArray(convertido)) {
      localStorage.setItem(chave, JSON.stringify(fallback));
      return fallback;
    }
    return convertido as T[];
  } catch {
    return fallback;
  }
}

function salvarStorage<T>(chave: string, dados: T): void {
  localStorage.setItem(chave, JSON.stringify(dados));
}

function gerarSenhaProvisoria(): string {
  const codigo = Math.floor(1000 + Math.random() * 9000);
  return `Clin@${codigo}`;
}

function obterUsuariosConsolidados(): UsuarioContaMaster[] {
  const usuariosAdmin = lerListaStorage<UsuarioContaMaster>(STORAGE_USUARIOS_MASTER, USUARIOS_INICIAIS);
  const prestadoresBrutos = lerListaStorage<RegistroPrestadorLegado>(STORAGE_PRESTADORES_SISTEMA, []);

  const emailsExistentes = new Set(usuariosAdmin.map((u) => u.email.toLowerCase()));
  const empresas = lerListaStorage<EmpresaSaaS>(STORAGE_EMPRESAS, EMPRESAS_INICIAIS);
  const empresaPadrao = empresas[0];

  const sincronizados: UsuarioContaMaster[] = [...usuariosAdmin];

  prestadoresBrutos.forEach((p) => {
    const emailNormalizado = (p.email || `${p.id}@prestador.clingest.com.br`).toLowerCase();
    if (!emailsExistentes.has(emailNormalizado)) {
      const empresaVinculada = empresas.find((e) => e.id === p.empresaId) || empresaPadrao;
      if (empresaVinculada) {
        const estaBloqueado =
          p.situacao === 'INATIVO' ||
          p.status === 'BLOQUEADO' ||
          p.status === 'INATIVO' ||
          p.ativo === false;

        sincronizados.push({
          id: p.id,
          empresaId: empresaVinculada.id,
          empresaNome: empresaVinculada.nomeFantasia,
          nome: p.nome,
          email: emailNormalizado,
          senha: p.senha || '123',
          perfil: 'PJ',
          dataCriacao: p.criadoEm || p.dataCadastro || new Date().toISOString().split('T')[0],
          ultimoLogin: 'Sincronizado',
          status: estaBloqueado ? 'BLOQUEADO' : 'ATIVO'
        });
      }
    }
  });

  return sincronizados;
}

export const masterService = {
  getEmpresas(): EmpresaSaaS[] {
    return lerListaStorage<EmpresaSaaS>(STORAGE_EMPRESAS, EMPRESAS_INICIAIS);
  },

  getEmpresaComMetricasById(empresaId: string): EmpresaComMetricas | null {
    const empresa = this.getEmpresas().find((e) => e.id === empresaId);
    if (!empresa) {
      return null;
    }
    return {
      ...empresa,
      metricas: this.calcularMetricasEmpresa(empresa)
    };
  },

  getUsuariosPorEmpresa(empresaId: string): UsuarioContaMaster[] {
    return obterUsuariosConsolidados().filter((u) => u.empresaId === empresaId);
  },

  calcularMetricasEmpresa(empresa: EmpresaSaaS): MetricasLicencaEmpresa {
    const usuarios = this.getUsuariosPorEmpresa(empresa.id);
    const licencasUtilizadas = usuarios.filter(
      (u) => u.perfil === 'PJ' && u.status === 'ATIVO'
    ).length;

    const contratadas = Number(empresa.licencasContratadas) || 0;
    const valorBase = Number(empresa.valorContratoBase) || 0;
    const valorExcedente = Number(empresa.valorPorExcedente) || 0;

    const licencasDisponiveis = Math.max(0, contratadas - licencasUtilizadas);
    const licencasExcedentes = Math.max(0, licencasUtilizadas - contratadas);

    const cobrancaAdicionalMensal =
      empresa.politicaExcedentes === 'COBRAR'
        ? licencasExcedentes * valorExcedente
        : 0;

    const valorTotalMensal = valorBase + cobrancaAdicionalMensal;

    return {
      empresaId: empresa.id,
      licencasContratadas: contratadas,
      licencasUtilizadas,
      licencasDisponiveis,
      licencasExcedentes,
      cobrancaAdicionalMensal,
      valorTotalMensal
    };
  },

  getEmpresasComMetricas(): EmpresaComMetricas[] {
    const empresas = this.getEmpresas();
    return empresas.map((empresa) => ({
      ...empresa,
      metricas: this.calcularMetricasEmpresa(empresa)
    }));
  },

  cadastrarEmpresa(dados: NovaEmpresaInput): EmpresaComMetricas {
    const empresasAtuais = this.getEmpresas();
    const cnpjLimpo = dados.cnpj.replace(/\D/g, '');

    const cnpjDuplicado = empresasAtuais.some(
      (e) => e.cnpj.replace(/\D/g, '') === cnpjLimpo
    );
    if (cnpjDuplicado) {
      throw new Error('Ja existe uma empresa cadastrada com este CNPJ.');
    }

    const todosUsuarios = obterUsuariosConsolidados();
    const emailGestorNormalizado = dados.gestorEmail.trim().toLowerCase();
    const emailDuplicado = todosUsuarios.some(
      (u) => u.email.toLowerCase() === emailGestorNormalizado
    );
    if (emailDuplicado) {
      throw new Error('O e-mail informado para o gestor ja esta em uso na plataforma.');
    }

    const hoje = new Date().toISOString().split('T')[0];
    const novoIdEmpresa = `emp-${Date.now()}`;
    const senhaInicial = dados.gestorSenhaInicial?.trim() || gerarSenhaProvisoria();

    const novaEmpresa: EmpresaSaaS = {
      id: novoIdEmpresa,
      razaoSocial: dados.razaoSocial.trim(),
      nomeFantasia: dados.nomeFantasia.trim(),
      cnpj: dados.cnpj.trim(),
      emailContato: dados.emailContato.trim(),
      telefoneContato: dados.telefoneContato.trim(),
      dataCadastro: hoje,
      plano: dados.plano.trim(),
      valorContratoBase: Number(dados.valorContratoBase),
      licencasContratadas: Number(dados.licencasContratadas),
      politicaExcedentes: dados.politicaExcedentes,
      valorPorExcedente:
        dados.politicaExcedentes === 'COBRAR' ? Number(dados.valorPorExcedente) : 0,
      vigenciaInicio: dados.vigenciaInicio || hoje,
      vigenciaFim: dados.vigenciaFim,
      status: 'ATIVA'
    };

    const usuariosAdmin = lerListaStorage<UsuarioContaMaster>(
      STORAGE_USUARIOS_MASTER,
      USUARIOS_INICIAIS
    );

    const novoGestor: UsuarioContaMaster = {
      id: `usr-${Date.now()}`,
      empresaId: novoIdEmpresa,
      empresaNome: novaEmpresa.nomeFantasia,
      nome: dados.gestorNome.trim(),
      email: emailGestorNormalizado,
      senha: senhaInicial,
      senhaProvisoria: senhaInicial,
      perfil: 'GESTOR',
      dataCriacao: hoje,
      ultimoLogin: 'Nunca acessou',
      status: 'ATIVO',
      exigirTrocaSenha: true
    };

    salvarStorage(STORAGE_EMPRESAS, [novaEmpresa, ...empresasAtuais]);
    salvarStorage(STORAGE_USUARIOS_MASTER, [novoGestor, ...usuariosAdmin]);

    this.registrarLog(
      'CADASTRO_EMPRESA',
      `Empresa ${novaEmpresa.nomeFantasia} cadastrada no plano ${novaEmpresa.plano} (${novaEmpresa.licencasContratadas} licencas) com gestor ${novoGestor.email} e credencial provisoria gerada.`,
      novaEmpresa.id,
      novaEmpresa.nomeFantasia
    );

    return {
      ...novaEmpresa,
      metricas: this.calcularMetricasEmpresa(novaEmpresa)
    };
  },

  atualizarContratoEmpresa(
    empresaId: string,
    dados: AtualizarEmpresaContratoInput
  ): EmpresaComMetricas {
    const empresasAtuais = this.getEmpresas();
    const indice = empresasAtuais.findIndex((e) => e.id === empresaId);

    if (indice === -1) {
      throw new Error('Empresa contratante nao encontrada.');
    }

    if (Number(dados.licencasContratadas) < 1) {
      throw new Error('A quantidade de licencas contratadas deve ser no minimo 1.');
    }

    if (Number(dados.valorContratoBase) < 0) {
      throw new Error('O valor do contrato base nao pode ser negativo.');
    }

    if (dados.politicaExcedentes === 'COBRAR' && Number(dados.valorPorExcedente) <= 0) {
      throw new Error('Informe um valor mensal valido por profissional excedente.');
    }

    const empresaAnterior = empresasAtuais[indice];
    const empresaAtualizada: EmpresaSaaS = {
      ...empresaAnterior,
      razaoSocial: dados.razaoSocial.trim(),
      nomeFantasia: dados.nomeFantasia.trim(),
      emailContato: dados.emailContato.trim(),
      telefoneContato: dados.telefoneContato.trim(),
      plano: dados.plano.trim(),
      valorContratoBase: Number(dados.valorContratoBase),
      licencasContratadas: Number(dados.licencasContratadas),
      politicaExcedentes: dados.politicaExcedentes,
      valorPorExcedente:
        dados.politicaExcedentes === 'COBRAR' ? Number(dados.valorPorExcedente) : 0,
      vigenciaInicio: dados.vigenciaInicio,
      vigenciaFim: dados.vigenciaFim
    };

    const listaAtualizada = [...empresasAtuais];
    listaAtualizada[indice] = empresaAtualizada;
    salvarStorage(STORAGE_EMPRESAS, listaAtualizada);

    const usuariosAdmin = lerListaStorage<UsuarioContaMaster>(
      STORAGE_USUARIOS_MASTER,
      USUARIOS_INICIAIS
    );
    const usuariosAtualizados = usuariosAdmin.map((u) =>
      u.empresaId === empresaId ? { ...u, empresaNome: empresaAtualizada.nomeFantasia } : u
    );
    salvarStorage(STORAGE_USUARIOS_MASTER, usuariosAtualizados);

    this.registrarLog(
      'ATUALIZACAO_CONTRATO_EMPRESA',
      `Contrato atualizado para plano ${empresaAtualizada.plano}, ${empresaAtualizada.licencasContratadas} licencas, politica ${empresaAtualizada.politicaExcedentes}.`,
      empresaAtualizada.id,
      empresaAtualizada.nomeFantasia
    );

    return {
      ...empresaAtualizada,
      metricas: this.calcularMetricasEmpresa(empresaAtualizada)
    };
  },

  alterarStatusEmpresa(
    empresaId: string,
    novoStatus: StatusEmpresa,
    motivo?: string
  ): EmpresaComMetricas {
    const empresasAtuais = this.getEmpresas();
    const indice = empresasAtuais.findIndex((e) => e.id === empresaId);

    if (indice === -1) {
      throw new Error('Empresa contratante nao encontrada.');
    }

    const empresaAtual = empresasAtuais[indice];
    if (empresaAtual.status === novoStatus) {
      throw new Error(
        novoStatus === 'SUSPENSA'
          ? 'Esta empresa ja se encontra suspensa.'
          : 'Esta empresa ja se encontra com plano ativo.'
      );
    }

    const empresaAtualizada: EmpresaSaaS = {
      ...empresaAtual,
      status: novoStatus
    };

    const listaAtualizada = [...empresasAtuais];
    listaAtualizada[indice] = empresaAtualizada;
    salvarStorage(STORAGE_EMPRESAS, listaAtualizada);

    const usuariosVinculados = this.getUsuariosPorEmpresa(empresaId);
    const totalGestores = usuariosVinculados.filter((u) => u.perfil === 'GESTOR').length;
    const totalPJs = usuariosVinculados.filter((u) => u.perfil === 'PJ').length;
    const bloqueadosIndividuais = usuariosVinculados.filter(
      (u) => u.status === 'BLOQUEADO'
    ).length;

    const justificativa = motivo && motivo.trim() ? ` Motivo: ${motivo.trim()}.` : '';

    if (novoStatus === 'SUSPENSA') {
      this.registrarLog(
        'SUSPENSAO_EMPRESA',
        `Plano suspenso para ${empresaAtualizada.nomeFantasia}. Acesso revogado imediatamente para ${totalGestores} gestor(es) e ${totalPJs} profissional(is) PJ, com preservacao integral dos dados.${justificativa}`,
        empresaAtualizada.id,
        empresaAtualizada.nomeFantasia
      );
    } else {
      this.registrarLog(
        'REATIVACAO_EMPRESA',
        `Plano reativado para ${empresaAtualizada.nomeFantasia}. Acessos restaurados para contas ativas (${bloqueadosIndividuais} conta(s) com bloqueio individual mantida(s)).${justificativa}`,
        empresaAtualizada.id,
        empresaAtualizada.nomeFantasia
      );
    }

    return {
      ...empresaAtualizada,
      metricas: this.calcularMetricasEmpresa(empresaAtualizada)
    };
  },

  alterarStatusUsuario(
    usuarioId: string,
    novoStatus: StatusUsuarioSistema
  ): UsuarioContaMaster {
    const consolidados = obterUsuariosConsolidados();
    const alvo = consolidados.find((u) => u.id === usuarioId);

    if (!alvo) {
      throw new Error('Conta de usuario nao encontrada.');
    }

    if (alvo.status === novoStatus) {
      throw new Error(
        novoStatus === 'BLOQUEADO'
          ? 'Esta conta ja se encontra bloqueada.'
          : 'Esta conta ja se encontra ativa.'
      );
    }

    if (alvo.perfil === 'PJ' && novoStatus === 'ATIVO') {
      const validacao = this.podeReativarProfissionalPJ(alvo.empresaId);
      if (!validacao.permitido) {
        throw new Error(
          validacao.motivo || 'Nao e possivel reativar este profissional PJ devido a regra contratual.'
        );
      }
    }

    const usuarioAtualizado: UsuarioContaMaster = {
      ...alvo,
      status: novoStatus
    };

    const usuariosAdmin = lerListaStorage<UsuarioContaMaster>(
      STORAGE_USUARIOS_MASTER,
      USUARIOS_INICIAIS
    );
    const indiceAdmin = usuariosAdmin.findIndex((u) => u.id === usuarioId);

    if (indiceAdmin !== -1) {
      const atualizados = [...usuariosAdmin];
      atualizados[indiceAdmin] = usuarioAtualizado;
      salvarStorage(STORAGE_USUARIOS_MASTER, atualizados);
    } else {
      salvarStorage(STORAGE_USUARIOS_MASTER, [usuarioAtualizado, ...usuariosAdmin]);
    }

    const prestadoresLegados = lerListaStorage<RegistroPrestadorLegado>(
      STORAGE_PRESTADORES_SISTEMA,
      []
    );
    if (prestadoresLegados.length > 0) {
      const prestadoresSincronizados = prestadoresLegados.map((p) => {
        const mesmoId = p.id === usuarioId;
        const mesmoEmail =
          p.email && p.email.toLowerCase() === alvo.email.toLowerCase();
        if (mesmoId || mesmoEmail) {
          return {
            ...p,
            situacao: novoStatus === 'ATIVO' ? 'ATIVO' : 'INATIVO',
            status: novoStatus === 'ATIVO' ? 'ATIVO' : 'BLOQUEADO',
            ativo: novoStatus === 'ATIVO'
          };
        }
        return p;
      });
      salvarStorage(STORAGE_PRESTADORES_SISTEMA, prestadoresSincronizados);
    }

    const impactoLicenca =
      alvo.perfil === 'PJ'
        ? novoStatus === 'BLOQUEADO'
          ? ' 1 licenca PJ liberada automaticamente.'
          : ' 1 licenca PJ alocada conforme contrato.'
        : ' Perfil gestor isento de consumo de licenca.';

    this.registrarLog(
      novoStatus === 'BLOQUEADO' ? 'BLOQUEIO_USUARIO' : 'REATIVACAO_USUARIO',
      `Usuario ${alvo.nome} (${alvo.email} - ${alvo.perfil}) teve o status alterado para ${novoStatus}.${impactoLicenca}`,
      alvo.empresaId,
      alvo.empresaNome
    );

    return usuarioAtualizado;
  },

  iniciarRedefinicaoSenhaUsuario(usuarioId: string): ResultadoRedefinicaoSenha {
    const consolidados = obterUsuariosConsolidados();
    const alvo = consolidados.find((u) => u.id === usuarioId);

    if (!alvo) {
      throw new Error('Conta de usuario nao encontrada.');
    }

    const agora = new Date();
    const dataFormatada = `${agora.toISOString().split('T')[0]} ${agora.toTimeString().slice(0, 5)}`;
    const protocolo = `RST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const novaSenhaProvisoria = gerarSenhaProvisoria();

    const usuarioAtualizado: UsuarioContaMaster = {
      ...alvo,
      senha: novaSenhaProvisoria,
      senhaProvisoria: novaSenhaProvisoria,
      exigirTrocaSenha: true,
      ultimaRedefinicaoSenha: dataFormatada
    };

    const usuariosAdmin = lerListaStorage<UsuarioContaMaster>(
      STORAGE_USUARIOS_MASTER,
      USUARIOS_INICIAIS
    );
    const indiceAdmin = usuariosAdmin.findIndex((u) => u.id === usuarioId);

    if (indiceAdmin !== -1) {
      const atualizados = [...usuariosAdmin];
      atualizados[indiceAdmin] = usuarioAtualizado;
      salvarStorage(STORAGE_USUARIOS_MASTER, atualizados);
    } else {
      salvarStorage(STORAGE_USUARIOS_MASTER, [usuarioAtualizado, ...usuariosAdmin]);
    }

    this.registrarLog(
      'REDEFINICAO_SENHA_USUARIO',
      `Fluxo seguro de redefinicao de senha iniciado para ${alvo.nome} (${alvo.email}). Protocolo ${protocolo}. Troca obrigatoria exigida no proximo acesso.`,
      alvo.empresaId,
      alvo.empresaNome
    );

    return {
      protocolo,
      usuarioNome: alvo.nome,
      usuarioEmail: alvo.email,
      dataHora: dataFormatada,
      senhaProvisoria: novaSenhaProvisoria
    };
  },

  definirNovaSenhaUsuario(usuarioId: string, novaSenha: string): UsuarioContaMaster {
    const senhaLimpa = novaSenha.trim();
    if (senhaLimpa.length < 4) {
      throw new Error('A nova senha deve ter pelo menos 4 caracteres.');
    }

    const consolidados = obterUsuariosConsolidados();
    const alvo = consolidados.find((u) => u.id === usuarioId);

    if (!alvo) {
      throw new Error('Conta de usuario nao encontrada.');
    }

    const usuarioAtualizado: UsuarioContaMaster = {
      ...alvo,
      senha: senhaLimpa,
      senhaProvisoria: undefined,
      exigirTrocaSenha: false
    };

    const usuariosAdmin = lerListaStorage<UsuarioContaMaster>(
      STORAGE_USUARIOS_MASTER,
      USUARIOS_INICIAIS
    );
    const indiceAdmin = usuariosAdmin.findIndex((u) => u.id === usuarioId);

    if (indiceAdmin !== -1) {
      const atualizados = [...usuariosAdmin];
      atualizados[indiceAdmin] = usuarioAtualizado;
      salvarStorage(STORAGE_USUARIOS_MASTER, atualizados);
    } else {
      salvarStorage(STORAGE_USUARIOS_MASTER, [usuarioAtualizado, ...usuariosAdmin]);
    }

    const prestadoresLegados = lerListaStorage<RegistroPrestadorLegado>(
      STORAGE_PRESTADORES_SISTEMA,
      []
    );
    if (prestadoresLegados.length > 0) {
      const prestadoresAtualizados = prestadoresLegados.map((p) => {
        if (p.id === usuarioId || p.email?.toLowerCase() === alvo.email.toLowerCase()) {
          return { ...p, senha: senhaLimpa };
        }
        return p;
      });
      salvarStorage(STORAGE_PRESTADORES_SISTEMA, prestadoresAtualizados);
    }

    return usuarioAtualizado;
  },

  registrarLoginUsuario(usuarioId: string): void {
    const agora = new Date();
    const dataFormatada = `${agora.toISOString().split('T')[0]} ${agora.toTimeString().slice(0, 5)}`;

    const usuariosAdmin = lerListaStorage<UsuarioContaMaster>(
      STORAGE_USUARIOS_MASTER,
      USUARIOS_INICIAIS
    );
    const indiceAdmin = usuariosAdmin.findIndex((u) => u.id === usuarioId);
    if (indiceAdmin !== -1) {
      const atualizados = [...usuariosAdmin];
      atualizados[indiceAdmin] = {
        ...atualizados[indiceAdmin],
        ultimoLogin: dataFormatada
      };
      salvarStorage(STORAGE_USUARIOS_MASTER, atualizados);
    }
  },

  getIndicadoresDashboard(): IndicadoresDashboardMaster {
    const lista = this.getEmpresasComMetricas();

    const totalEmpresas = lista.length;
    const empresasAtivas = lista.filter((e) => e.status === 'ATIVA').length;
    const empresasSuspensas = lista.filter((e) => e.status === 'SUSPENSA').length;

    const totalLicencasContratadas = lista.reduce(
      (acc, e) => acc + e.metricas.licencasContratadas,
      0
    );
    const totalLicencasUtilizadas = lista.reduce(
      (acc, e) => acc + e.metricas.licencasUtilizadas,
      0
    );
    const totalLicencasDisponiveis = lista.reduce(
      (acc, e) => acc + e.metricas.licencasDisponiveis,
      0
    );
    const totalExcedentes = lista.reduce(
      (acc, e) => acc + e.metricas.licencasExcedentes,
      0
    );

    const ativas = lista.filter((e) => e.status === 'ATIVA');
    const mrrBase = ativas.reduce((acc, e) => acc + (Number(e.valorContratoBase) || 0), 0);
    const mrrExcedentes = ativas.reduce(
      (acc, e) => acc + e.metricas.cobrancaAdicionalMensal,
      0
    );
    const mrrTotal = mrrBase + mrrExcedentes;

    return {
      totalEmpresas,
      empresasAtivas,
      empresasSuspensas,
      totalLicencasContratadas,
      totalLicencasUtilizadas,
      totalLicencasDisponiveis,
      totalExcedentes,
      mrrBase,
      mrrExcedentes,
      mrrTotal
    };
  },

  getLogsAuditoria(): LogAuditoriaMaster[] {
    return lerListaStorage<LogAuditoriaMaster>(STORAGE_LOGS_MASTER, [
      {
        id: 'log-001',
        dataHora: '2026-11-14 08:00',
        atorNome: 'Master Admin',
        acao: 'INICIALIZACAO_GOVERNANCA',
        detalhes: 'Modulo de governanca Master SaaS sincronizado com a base de contratos.'
      }
    ]);
  },

  getLogsPorEmpresa(empresaId: string): LogAuditoriaMaster[] {
    return this.getLogsAuditoria().filter((log) => log.empresaId === empresaId);
  },

  registrarLog(acao: string, detalhes: string, empresaId?: string, empresaNome?: string): void {
    const logs = this.getLogsAuditoria();
    const agora = new Date();
    const dataFormatada = `${agora.toISOString().split('T')[0]} ${agora.toTimeString().slice(0, 5)}`;

    const novoLog: LogAuditoriaMaster = {
      id: `log-${Date.now()}`,
      dataHora: dataFormatada,
      atorNome: 'Master Admin',
      acao,
      detalhes,
      empresaId,
      empresaNome
    };

    salvarStorage(STORAGE_LOGS_MASTER, [novoLog, ...logs]);
  },

  podeAdicionarProfissionalPJ(empresaId: string): {
    permitido: boolean;
    motivo?: string;
    excedente?: boolean;
    valorAdicional?: number;
  } {
    const empresa = this.getEmpresas().find((e) => e.id === empresaId);
    if (!empresa) {
      return { permitido: false, motivo: 'Empresa contratante nao encontrada.' };
    }
    if (empresa.status === 'SUSPENSA') {
      return { permitido: false, motivo: 'O plano desta empresa encontra-se suspenso.' };
    }
    const metricas = this.calcularMetricasEmpresa(empresa);
    const atingiuLimite = metricas.licencasUtilizadas >= metricas.licencasContratadas;

    if (atingiuLimite && empresa.politicaExcedentes === 'BLOQUEAR') {
      return {
        permitido: false,
        motivo: `Limite de ${metricas.licencasContratadas} licencas PJ atingido. Solicite upgrade ou habilite excedentes no plano.`
      };
    }

    if (atingiuLimite && empresa.politicaExcedentes === 'COBRAR') {
      return {
        permitido: true,
        excedente: true,
        valorAdicional: Number(empresa.valorPorExcedente) || 0,
        motivo: `Limite de ${metricas.licencasContratadas} licencas atingido. Este cadastro gerara cobranca adicional de R$ ${Number(empresa.valorPorExcedente).toFixed(2)}/mes.`
      };
    }

    return { permitido: true, excedente: false, valorAdicional: 0 };
  },

  podeReativarProfissionalPJ(empresaId: string): {
    permitido: boolean;
    motivo?: string;
    excedente?: boolean;
    valorAdicional?: number;
  } {
    return this.podeAdicionarProfissionalPJ(empresaId);
  },

  verificarAcessoPermitido(
    empresaId: string,
    statusUsuario: StatusUsuarioSistema
  ): ResultadoValidacaoAcesso {
    const empresa = this.getEmpresas().find((e) => e.id === empresaId);
    if (!empresa) {
      return { permitido: false, motivo: 'Empresa nao localizada.' };
    }
    if (empresa.status === 'SUSPENSA') {
      return {
        permitido: false,
        motivo: 'Acesso temporariamente suspenso. Entre em contato com o suporte comercial Clingest PJ.',
        empresa
      };
    }
    if (statusUsuario === 'BLOQUEADO') {
      return {
        permitido: false,
        motivo: 'Sua conta de usuario esta bloqueada. Contate o administrador.',
        empresa
      };
    }
    return { permitido: true, empresa };
  },

  validarAutenticacaoUsuario(email: string, senha?: string): ResultadoValidacaoAcesso {
    const emailNormalizado = email.trim().toLowerCase();
    const usuario = obterUsuariosConsolidados().find(
      (u) => u.email.toLowerCase() === emailNormalizado
    );

    if (!usuario) {
      return {
        permitido: false,
        motivo: 'Usuario nao encontrado na base de contas.'
      };
    }

    const validacao = this.verificarAcessoPermitido(usuario.empresaId, usuario.status);
    if (!validacao.permitido) {
      return {
        ...validacao,
        usuario
      };
    }

    if (senha !== undefined) {
      const senhaEsperada = usuario.senha || usuario.senhaProvisoria || '123';
      if (senha !== senhaEsperada) {
        return {
          permitido: false,
          motivo: 'Usuario ou senha invalidos.'
        };
      }
    }

    return {
      ...validacao,
      usuario
    };
  }
};