import { z } from 'zod';

export const prestadorSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  razaoSocial: z.string().min(3, 'A razão social deve ter pelo menos 3 caracteres'),
  cnpj: z.string().min(14, 'CNPJ inválido').max(18, 'CNPJ inválido'),
  email: z.string().email('E-mail inválido'),
  servico: z.string().min(2, 'Informe o serviço prestado'),
  remuneracao: z.enum(['POR_PROCEDIMENTO', 'FIXO_MENSAL', 'MISTO', 'POR_ENTREGA']),
  valorBase: z.coerce.number().min(0, 'O valor base deve ser positivo'),
  contratoStatus: z.enum(['VIGENTE', 'EM_REVISAO', 'VENCENDO']),
  situacao: z.enum(['ATIVO', 'PENDENTE', 'ATENCAO'])
});

export type PrestadorFormData = z.infer<typeof prestadorSchema>;