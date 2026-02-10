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

**Objetivo:** UX: Agendamento de Mentoria - Condicional de Horários

**Passos Realizados:**

1.  **Atualizar `components/agendar-mentoria-aluno.tsx`:**
    - Implementar renderização condicional para a lista de `slotsHorario` dentro do `Accordion`.
    - Exibir os horários apenas quando o campo `data` do formulário possuir valor.
    - Adicionar mensagem de feedback visual ("Selecione uma data primeiro") quando nenhuma data estiver selecionada.
    - **Automatização:** O `Accordion` de horários agora abre automaticamente assim que uma data é selecionada.

**Verificação:**
- O Accordion de horários agora deve iniciar vazio (com mensagem).
- Ao selecionar uma data, o Accordion deve se abrir automaticamente, revelando os horários disponíveis.
