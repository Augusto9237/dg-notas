# Blueprint: DG - Plataforma de Mentoria e Redação

## Visão Geral

**DG** é uma plataforma SaaS (Software as a Service) de ponta, desenvolvida para revolucionar a educação online, conectando professores e alunos através de um ecossistema de mentoria e correção de redações. Construída com as tecnologias mais avançadas, a plataforma oferece uma experiência de usuário nativa na web, performance excepcional e um conjunto de funcionalidades robustas para maximizar o potencial de aprendizado e ensino.

## Funcionalidades e Design

### Core Features

- **Autenticação:** Sistema de login e registro para alunos e professores.
- **Perfis de Usuário:** Páginas de perfil para alunos e professores.
- **Dashboard de Aluno:**
    - Visualização de performance geral.
    - Lista de redações enviadas e corrigidas.
    - Gráficos de evolução de notas.
    - Agendamento de mentorias.
- **Dashboard de Professor:**
    - Gestão de alunos.
    - Fila de correção de redações.
    - Ferramentas para correção e feedback.
    - Gestão de agenda de mentorias.
- **Submissão de Redações:** Upload de imagens de redações.
- **Correção de Redações:** Interface para dar notas por competência (C1-C5).
- **Agendamento de Mentorias:** Calendário interativo para marcar sessões.
- **Progressive Web App (PWA):** Instalação em desktop e mobile para uma experiência nativa.
- **Notificações Push:** Alertas em tempo real sobre correções e mentorias.

### Design e Estilo

- **Design System:** Baseado em **shadcn/ui** e **Tailwind CSS**.
- **Componentes:**
    - **Cards:** Para exibir informações de forma concisa (redações, alunos, etc.).
    - **Forms:** Validação com **Zod** e **React Hook Form**.
    - **Gráficos:** Visualização de dados com **Recharts**.
    - **Calendário:** Interativo para agendamentos.
    - **Modais:** Para ações como envio de redação e feedback.
- **Layout:** Responsivo, adaptando-se a telas de desktop e mobile.


## Plano de Desenvolvimento Atual

**Objetivo:** Correção de Bug - Notificações Duplicadas

**Passos:**

1.  **Refatorar `hooks/useWebPush.ts`:**
    - Adicionar suporte ao parâmetro `handleMessages` para controlar a criação de listeners de eventos.
    - Garantir que apenas um listener de notificação esteja ativo por vez.

2.  **Atualizar `components/inicializar-notificacoes.tsx`:**
    - Configurar o hook `useWebPush` com `handleMessages: false` para evitar duplicidade de notificações nesse componente.

3.  **Verificação:**
    - Confirmar que notificações são exibidas apenas uma vez.
    - Garantir que `app/(login)/wrapper.tsx` e outros wrappers funcionem conforme o esperado.


