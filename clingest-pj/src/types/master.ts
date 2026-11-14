export type StatusEmpresa = 'ATIVA' | 'SUSPENSA';

export type PoliticaExcedentes = 'BLOQUEAR' | 'COBRAR';

export type PerfilUsuarioSistema = 'MASTER' | 'GESTOR' | 'PJ';

export type StatusUsuarioSistema = 'ATIVO' | 'BLOQUEADO';

export interface EmpresaSaaS {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  emailContato: string;
  telefoneContato: string;
  dataCadastro: string;
  plano: string;
  valorContratoBase: number;
  licencasContratadas: number;
  politicaExcedentes: PoliticaExcedentes;
  valorPorExcedente: number;
  vigenciaInicio: string;
  vigenciaFim: string;
  status: StatusEmpresa;
}

export interface MetricasLicencaEmpresa {
  empresaId: string;
  licencasContratadas: number;
  licencasUtilizadas: number;
  licencasDisponiveis: number;
  licencasExcedentes: number;
  cobrancaAdicionalMensal: number;
  valorTotalMensal: number;
}

export interface EmpresaComMetricas extends EmpresaSaaS {
  metricas: MetricasLicencaEmpresa;
}

export interface UsuarioContaMaster {
  id: string;
  empresaId: string;
  empresaNome: string;
  nome: string;
  email: string;
  senha?: string;
  senhaProvisoria?: string;
  perfil: PerfilUsuarioSistema;
  dataCriacao: string;
  ultimoLogin: string;
  status: StatusUsuarioSistema;
  exigirTrocaSenha?: boolean;
  ultimaRedefinicaoSenha?: string;
}

export interface LogAuditoriaMaster {
  id: string;
  dataHora: string;
  atorNome: string;
  acao: string;
  detalhes: string;
  empresaId?: string;
  empresaNome?: string;
}

export interface IndicadoresDashboardMaster {
  totalEmpresas: number;
  empresasAtivas: number;
  empresasSuspensas: number;
  totalLicencasContratadas: number;
  totalLicencasUtilizadas: number;
  totalLicencasDisponiveis: number;
  totalExcedentes: number;
  mrrBase: number;
  mrrExcedentes: number;
  mrrTotal: number;
}

export interface NovaEmpresaInput {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  emailContato: string;
  telefoneContato: string;
  plano: string;
  valorContratoBase: number;
  licencasContratadas: number;
  politicaExcedentes: PoliticaExcedentes;
  valorPorExcedente: number;
  vigenciaInicio: string;
  vigenciaFim: string;
  gestorNome: string;
  gestorEmail: string;
  gestorSenhaInicial?: string;
}

export interface AtualizarEmpresaContratoInput {
  razaoSocial: string;
  nomeFantasia: string;
  emailContato: string;
  telefoneContato: string;
  plano: string;
  valorContratoBase: number;
  licencasContratadas: number;
  politicaExcedentes: PoliticaExcedentes;
  valorPorExcedente: number;
  vigenciaInicio: string;
  vigenciaFim: string;
}

export interface ResultadoValidacaoAcesso {
  permitido: boolean;
  motivo?: string;
  usuario?: UsuarioContaMaster;
  empresa?: EmpresaSaaS;
}

export interface ResultadoRedefinicaoSenha {
  protocolo: string;
  usuarioNome: string;
  usuarioEmail: string;
  dataHora: string;
  senhaProvisoria?: string;
}