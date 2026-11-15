# ClinGest PJ — Plataforma SaaS B2B de Gestão e Conformidade em Saúde

Plataforma SaaS B2B multi-tenant desenvolvida para a gestão, conformidade jurídica, contratação e acompanhamento de prestadores de serviços de saúde (PJ). O sistema conta com isolamento estrito de dados por permissão de acesso e controle automatizado de licenças corporativas.

---

## 🚀 Status do Projeto & Funcionalidades Implementadas

O ecossistema está totalmente estruturado com arquitetura baseada em papéis (*Role-Based Access Control* - RBAC) e persistência via LocalStorage:

### 1. Painel Master (Governança Global)
* **Gestão de Tenants:** Cadastro e acompanhamento de clínicas/empresas contratantes.
* **Métrica MRR:** Cálculo automático da Receita Mensal Recorrente com base nas licenças ativas.
* **Tetos de Licenças:** Gerenciamento do limite máximo de funcionários/prestadores por clínica.
* **Controle de Acesso:** Capacidade de suspender ou reativar inquilinos na plataforma.

### 2. Painel da Empresa / Clínica (Gestão Interna)
* **Ocupação do Plano:** Monitoramento em tempo real do consumo de licenças contratadas (ex: `3/10`).
* **Credenciamento PJ:** Cadastro de profissionais de saúde com geração automatizada de credenciais.
* **Validação de Produção:** Aprovação de plantões, horas trabalhadas e apontamentos enviados pela equipe.
* **Relatórios Globais:** Exportação de dados consolidados de custos e produção em formato CSV.

### 3. Portal do Prestador / Profissional PJ (Área Autônoma)
* **Apontamento de Horas:** Registro individual de plantões e atendimentos vinculados ao nome do paciente.
* **Cálculo Remuneratório:** Apuração líquida baseada no valor da hora contratual do profissional.
* **Gestão de Notas Fiscais:** Módulo para envio e homologação de NFS-e (PDF).
* **Exportação Pessoal:** Recurso exclusivo para download do extrato e histórico de horas em CSV (garantindo isolamento total de dados).

---

## 🛠️ Tecnologias Utilizadas

* **Front-end:** React, TypeScript, Tailwind CSS
* **Ícones:** Lucide React
* **Arquitetura de Dados:** Serviços centralizados e persistência local via LocalStorage (`api.ts`, `apiEmpresas`)
* **Controle de Versão:** Git & GitHub

---

## 📂 Estrutura do Projeto

```text
src/
├── components/       # Componentes visuais e portais (Master, Gestor, Prestador)
├── context/          # Contextos globais (Toast, Autenticação/Sessão)
├── services/         # Camada de serviços e persistência de dados (API local)
├── types/            # Definições de tipagem estrita em TypeScript (Prestadores, Tarefas, etc.)
└── App.tsx           # Componente raiz e roteamento de perfis

📈 Próximos Passos (Roadmap)
[ ] Integração com backend real (Node.js / Express ou Spring Boot) e banco de dados relacional.

[ ] Implementação de testes automatizados unitários e de integração.

[ ] Fluxo avançado de assinatura de contratos digitais para prestadores PJ.

[ ] Notificações em tempo real para aprovação de notas fiscais.

---

### Como adicionar ao seu projeto:

1. Na raiz do seu projeto, crie um arquivo chamado exatamente **`README.md`**.
2. Cole o conteúdo acima dentro dele e salve o arquivo.
3. No terminal, execute os comandos para atualizar o GitHub:
   ```bash
   git add README.md
   git commit -m "docs: adiciona README detalhado com o progresso atual do projeto"
   git push origin main