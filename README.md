# Plataforma de Mentoria e Correção de Redações

## Visão Geral

Uma plataforma web completa para conectar alunos e professores, facilitando mentorias e a correção detalhada de redações. O sistema oferece ferramentas avançadas para agendamento, avaliação por competências, acompanhamento de progresso e rankings de desempenho.

## Funcionalidades

### Para Alunos:

- **Autenticação Segura:** Cadastro e login de usuários.
- **Submissão de Redações:** Envio de redações para correção e feedback detalhado.
- **Dashboard de Competências:** Visualização de desempenho por competência (C1 a C5) com gráficos interativos.
- **Ranking:** Acompanhamento da posição no ranking geral de alunos.
- **Agendamento de Mentorias:** Visualização e agendamento de horários com professores.
- **Histórico:** Acesso a todas as avaliações e mentorias passadas.
- **Perfil:** Gerenciamento de dados pessoais.

### Para Professores:

- **Dashboard Administrativo:** Visão geral dos alunos, avaliações recentes e estatísticas.
- **Correção de Redações:** Interface otimizada para avaliar redações com base em critérios específicos.
- **Gestão de Temas:** Criação e gerenciamento de temas de redação disponíveis para os alunos.
- **Ranking de Alunos:** Visualização dos alunos com melhor desempenho (Top 5).
- **Gerenciamento de Agenda:** Controle total sobre a disponibilidade para mentorias.
- **Detalhes do Aluno:** Acesso ao histórico completo e evolução de cada aluno.

### Gerais:

- **Controle de Acesso Baseado em Função:** Permissões específicas para Alunos e Professores/Admins.
- **Design Responsivo:** Interface moderna e adaptável para qualquer dispositivo.
- **Dark/Light Mode:** Suporte a temas visuais.

## Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Banco de Dados:** [Prisma ORM](https://www.prisma.io/)
- **Autenticação:** [BetterAuth](https://www.better-auth.com/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes:** [shadcn/ui](https://ui.shadcn.com/)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Validação:** [Zod](https://zod.dev/)
- **Formulários:** [React Hook Form](https://react-hook-form.com/)

## Começando

Siga os passos abaixo para configurar e executar o projeto localmente.

1. **Clone o repositório:**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   - Crie um arquivo `.env` na raiz do projeto.
   - Adicione a string de conexão do banco de dados e outros segredos necessários.
     ```
     DATABASE_URL="sua_string_de_conexao"
     NEXTAUTH_URL="http://localhost:3000"
     NEXTAUTH_SECRET="seu_segredo_aqui"
     ```

4. **Execute as migrações do banco de dados:**
   ```bash
   npx prisma migrate dev
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

6. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## Estrutura do Projeto

- **/app**: Diretório principal (App Router).
  - `/(login)`: Rotas de autenticação.
  - `/aluno`: Dashboard e funcionalidades do aluno.
  - `/professor`: Dashboard e ferramentas do professor.
- **/actions**: Server Actions para lógica de negócios e mutações.
- **/components**: Componentes React modulares.
  - `/ui`: Componentes base do shadcn/ui.
- **/lib**: Utilitários, configurações (auth, prisma) e helpers.
- **/prisma**: Schema do banco de dados e migrações.
