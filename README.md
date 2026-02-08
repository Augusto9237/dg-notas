# DG - Plataforma de Mentoria e Redação

**DG** é uma plataforma SaaS (Software as a Service) de ponta, desenvolvida para revolucionar a educação online, conectando professores e alunos através de um ecossistema de mentoria e correção de redações. Construída com as tecnologias mais avançadas, a plataforma oferece uma experiência de usuário nativa na web, performance excepcional e um conjunto de funcionalidades robustas para maximizar o potencial de aprendizado e ensino.

## 🌟 Visão Comercial

O DG foi projetado para ser um negócio escalável e de alta retenção. Ele atende a uma demanda crescente por educação personalizada, oferecendo ferramentas que geram valor tangível para alunos e educadores.

- **Modelo SaaS:** Pronto para implementação de assinaturas para alunos ou licenciamento para instituições de ensino.
- **Alto Engajamento:** Notificações Push e funcionalidades PWA garantem que os usuários retornem e permaneçam ativos na plataforma.
- **Experiência Premium:** Um design moderno e uma interface fluida justificam um posicionamento de preço premium.
- **Data-Driven:** Ferramentas de análise de desempenho fornecem insights valiosos que podem ser um feature de valor agregado.

## ✨ Funcionalidades em Destaque

### 🎓 Para Alunos: Acelere seu Desenvolvimento
- **Dashboard de Performance:** Acompanhe seu progresso com métricas visuais.
- **Submissão Simplificada:** Envie redações em formato de imagem com facilidade.
- **Feedback Estruturado:** Receba análises detalhadas por competências (C1 a C5).
- **Visualização de Evolução:** Gráficos interativos mostram seu crescimento ao longo do tempo.
- **Agendamento Inteligente:** Encontre e reserve horários de mentoria com seus professores em um calendário interativo.
- **Experiência de App Nativo:** Instale o DG em seu desktop ou celular (PWA) e receba notificações push sobre suas correções e mentorias.

### 👨‍🏫 Para Professores: Otimize seu Fluxo de Trabalho
- **Gestão Completa de Alunos:** Acesse o perfil, histórico de redações e desempenho de cada aluno.
- **Fila de Correção Inteligente:** Organize e gerencie as redações pendentes de forma eficiente.
- **Ferramenta de Correção Ágil:** Atribua notas por competência de forma rápida e intuitiva.
- **Gestão de Disponibilidade:** Defina seus horários de mentoria com flexibilidade.
- **Criação de Conteúdo:** Publique novos temas de redação para desafiar seus alunos.

## 🛠️ Excelência Técnica: A Base para uma Plataforma Escalável

O DG é construído sobre uma fundação técnica sólida, garantindo performance, segurança e manutenibilidade.

- **Framework:** **Next.js 16+** e **React 19** (RC), utilizando App Router, React Server Components (RSCs) e Server Actions para máxima performance e segurança.
- **Linguagem:** **TypeScript** estrito para um código robusto e manutenível.
- **Autenticação:** **Better Auth** implementando um sistema completo de gestão de identidade e sessões seguras.
- **Banco de Dados:** **PostgreSQL** gerenciado pelo **Prisma ORM** com **Prisma Accelerate** para cache distribuído e conexões em borda.
- **Relatórios:** Geração de documentos PDF profissionais com **React PDF** e **jsPDF**, incluindo exportação de relatórios de evolução.
- **UI/UX:**
  - **shadcn/ui** e **Tailwind CSS v4** para interfaces modernas e responsivas.
  - **Framer Motion** para animações fluidas e micro-interações.
  - **Recharts** para visualização de dados e analytics.
  - **Sonner** e **React Hot Toast** para feedback visual imediato.
  - Validação rigorosa com **Zod** e **React Hook Form**.
- **PWA & Mobile:** Experiência nativa com suporte offline, instalação na home screen e notificações push em background e foreground.
- **Integrações:** **Web Push API** para engajamento e **Vercel Blob** para armazenamento de arquivos.

## 📂 Estrutura do Projeto

A arquitetura do projeto é modular e segue as melhores práticas do Next.js App Router.

- **/app**: Contém todas as rotas, layouts e UIs da aplicação.
  - `(login)`: Agrupamento de rotas para o fluxo de autenticação.
  - `aluno`: Dashboard e ferramentas exclusivas do aluno.
  - `professor`: Dashboard e ferramentas exclusivas do professor.
  - `api`: Rotas de API para webhooks, notificações e outras integrações.
- **/components**: Componentes React reutilizáveis, incluindo um diretório `ui` para o Design System.
- **/actions**: Funções Server Action para interações com o backend.
- **/lib**: Funções utilitárias e configurações de serviços (Prisma, Auth, etc.).
- **/public**: Assets estáticos, incluindo o Service Worker (`sw.js`) e todos os ícones da PWA.
- **/prisma**: Schema e migrações do banco de dados.

## 🚀 Como Executar o Projeto

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-repositorio>
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env.local` na raiz do projeto e adicione as chaves necessárias (DATABASE_URL, chaves VAPID para Web Push, segredos de autenticação).

4.  **Execute as migrações do banco de dados:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

Acesse `http://localhost:3000` e veja a mágica acontecer.

---

**DG - Elevando o padrão da educação online com tecnologia e design de ponta.**