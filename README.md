# Plataforma de Mentoria

## Visão Geral

Uma plataforma web projetada para conectar alunos e professores para sessões de mentoria. O sistema permite que os alunos agendem horários com os professores disponíveis e fornece ferramentas para que os professores gerenciem seus horários, avaliem os alunos e acompanhem seu progresso.

## Funcionalidades

### Para Alunos:

- **Autenticação Segura:** Cadastro e login de usuários.
- **Visualização de Horários:** Acesso aos horários de mentoria disponíveis.
- **Agendamento:** Agendamento de novas sessões de mentoria.
- **Gerenciamento:** Visualização e gerenciamento de suas mentorias agendadas e passadas.
- **Feedback:** Recebimento de avaliações dos professores.

### Para Professores:

- **Autenticação Segura:** Cadastro e login de usuários.
- **Dashboard:** Painel para visualização de todos os alunos e suas informações.
- **Gerenciamento de Agenda:** Controle de disponibilidade e horários de mentoria.
- **Avaliações:** Criação, visualização e gerenciamento de avaliações de alunos com base em critérios específicos.
- **Detalhes do Aluno:** Acesso a informações detalhadas de cada aluno.

### Gerais:

- **Controle de Acesso Baseado em Função:** Distinção entre Aluno e Professor.
- **Design Responsivo:** Interface adaptável para desktops e dispositivos móveis.

## Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **ORM de Banco de Dados:** [Prisma](https://www.prisma.io/)
- **Autenticação:** [BetterAuth](https://www.better-auth.com/)
- **UI:** [React](https://reactjs.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes de UI:** [shadcn/ui](https://ui.shadcn.com/)
- **Linting:** [ESLint](https://eslint.org/)
- **Server Actions:** Para mutações de dados e lógica do lado do servidor.

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

- **/app**: Diretório principal da aplicação usando o App Router do Next.js.
  - `/(login)`: Rotas relacionadas à autenticação.
  - `/aluno`: Rotas e funcionalidades para a função de aluno.
  - `/professor`: Rotas e funcionalidades para a função de professor.
- **/actions**: Server Actions para manipulação de formulários e mutações de dados.
- **/components**: Componentes React reutilizáveis.
  - `/ui`: Componentes da biblioteca `shadcn/ui`.
- **/lib**: Funções utilitárias, configuração de autenticação e instância do cliente Prisma.
- **/prisma**: Schema do banco de dados (`schema.prisma`) e arquivos de migração.
