# DG - Plataforma de Mentoria e Correção de Redações

Bem-vindo ao **DG - Plataforma de Mentoria**, uma solução web completa e moderna desenvolvida para conectar alunos e professores, facilitando o processo de correção de redações e agendamento de mentorias. Este projeto utiliza as tecnologias mais recentes do ecossistema React/Next.js para oferecer uma experiência de usuário fluida, responsiva e engajadora.

## 🚀 Visão Geral

A plataforma visa otimizar o aprendizado e o ensino da redação, oferecendo ferramentas robustas para:
- **Correção detalhada** baseada em competências.
- **Acompanhamento de progresso** com métricas visuais.
- **Agendamento simplificado** de mentorias individuais.
- **Notificações em tempo real** para manter todos atualizados.
- **Experiência nativa** através de suporte PWA (Progressive Web App).

## ✨ Funcionalidades Principais

### 🎓 Para Alunos
- **Dashboard Personalizado:** Visão geral do desempenho, últimas correções e próximas mentorias.
- **Submissão de Redações:** Interface intuitiva para envio de textos (imagem ou texto).
- **Feedback Detalhado:** Receba correções com notas por competência (C1-C5) e comentários específicos.
- **Gráficos de Evolução:** Acompanhe seu progresso ao longo do tempo com gráficos interativos.
- **Ranking:** Veja sua posição em relação a outros alunos.
- **Agendamento de Mentorias:** Reserve horários com professores através de um calendário interativo.
- **Notificações Push:** Receba alertas instantâneos sobre correções finalizadas e lembretes de mentoria (Web Push).
- **PWA Instalável:** Instale o app no seu dispositivo (desktop ou mobile) para acesso rápido e offline-ready.

### 👨‍🏫 Para Professores
- **Gestão de Alunos:** Acesso fácil ao histórico e perfil de cada aluno.
- **Fila de Correção:** Organização eficiente das redações pendentes.
- **Ferramenta de Correção:** Interface otimizada para atribuir notas e comentários por competência com agilidade.
- **Gestão de Agenda:** Defina seus horários disponíveis para mentoria.
- **Painel Administrativo:** Visão macro do engajamento e desempenho da plataforma.
- **Criação de Temas:** Gerencie os temas de redação disponíveis para prática.

### 🛠️ Diferenciais Técnicos
- **Real-Time Notifications:** Sistema de notificações Web Push integrado, garantindo que os usuários não percam atualizações importantes, mesmo com o app fechado.
- **Progressive Web App (PWA):** Manifesto completo com ícones adaptáveis para Windows, iOS e Android. Suporte a instalação na home screen e funcionamento similar a app nativo.
- **Design System Moderno:** Interface polida construída com **Shadcn/UI** e **Tailwind CSS**, com suporte a modo escuro (Dark Mode).
- **Performance:** Renderização otimizada com Next.js App Router e Server Actions.

## 💻 Tecnologias Utilizadas

O projeto foi construído com uma stack moderna e robusta:

- **Framework:** [Next.js 14+](https://nextjs.org/) (App Router & Server Components)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) com [Prisma ORM](https://www.prisma.io/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Validação:** [Zod](https://zod.dev/) e [React Hook Form](https://react-hook-form.com/)
- **Notificações:** Web Push API & Service Workers
- **Autenticação:** [BetterAuth](https://www.better-auth.com/) (ou NextAuth, conforme configuração)

## 📂 Estrutura do Projeto

- **/app**: Rotas e layouts do Next.js (App Router).
  - `(login)`: Fluxos de autenticação.
  - `aluno`: Área restrita do aluno.
  - `professor`: Área restrita do professor.
  - `api`: Rotas de API (Webhooks, etc).
- **/components**: Biblioteca de componentes reutilizáveis.
- **/actions**: Server Actions para mutação de dados segura.
- **/lib**: Configurações de serviços (Prisma, Auth, Utils).
- **/public**: Assets estáticos e configurações de PWA (manifest, icons, sw.js).
- **/prisma**: Schema do banco de dados.

## 🚀 Como Executar

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz com as chaves necessárias (DATABASE_URL, chaves VAPID para push, secrets de auth).

4. **Prepare o banco de dados:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

6. Acesse `http://localhost:3000` no seu navegador.

---

Desenvolvido com foco em **Performance**, **Usabilidade** e **Código Limpo**.
