# Blueprint: DG - Plataforma de Mentoria e Redação

## Visão Geral

**DG** é uma plataforma SaaS (Software as a Service) de ponta, desenvolvida para revolucionar a educação online, conectando professores e alunos através de um ecossistema de mentoria e correção de redações. Construída com as tecnologias mais avançadas (Next.js 16, React 19, Prisma, Tailwind CSS e Neon PostgreSQL), a plataforma oferece uma experiência de usuário nativa na web, performance excepcional e um conjunto de funcionalidades robustas para maximizar o potencial de aprendizado e ensino.

---

## Funcionalidades e Design Documentados (V3)

### Core Features

- **Autenticação Avançada:** Sistema de login e registro para alunos e professores integrado via Better-Auth (OAuth Google e Email/Senha).
- **Perfis de Usuário:** Páginas de perfil customizadas para alunos, assistentes e professores com suporte a dados de contato.
- **Dashboard de Aluno:**
    - Visualização de performance geral e notas por competência.
    - Fila de redações enviadas, corrigidas e devolvidas.
    - Gráficos interativos de evolução de desempenho.
    - Agendamento dinâmico de mentorias individuais.
- **Dashboard de Professor / Admin:**
    - Gestão completa de turmas e alunos com liberação manual de acesso (matriculado).
    - Fila inteligente de correção de redações com avaliação de competências (C1-C5).
    - Ferramentas para inserção de correções visuais e feedback detalhado.
    - Gestão de slots de horário para agendamento de mentorias.
- **PWA (Progressive Web App):** Suporte total a instalação desktop e mobile, com prompts elegantes de instalação e compatibilidade com iOS.
- **Notificações Push (WebPush):** Sistema de disparo em tempo real e atualização dinâmica de cache client-side baseada em pings de notificação.

### Design e Estilo

- **Design System Premium:** Baseado em **shadcn/ui** e **Tailwind CSS**.
- **Visual Vibes:** Cores dinâmicas injetadas via CSS Variables lidas diretamente do painel de configurações gerais, gradientes suaves, sombras multicamadas ("lifted" effect) e micro-animações interativas via framer-motion/motion.
- **Componentes Otimizados:**
    - **Cards de Métricas:** Estatísticas com micro-glows e design translúcido.
    - **Formulários:** Validação robusta usando **Zod** e **React Hook Form**.
    - **Gráficos:** Visualização avançada com **Recharts** com lazy loading.
    - **Calendários de Agendamento:** Controle de concorrência com travas de slots.

---

## Plano de Desenvolvimento Atual: Master Code Review & Análise de Gargalos na Vercel (V4)

**Objetivo:** Atualizar o diagnóstico de performance do Vercel Speed Insights e mapear novos gargalos críticos no ecossistema da aplicação.

### Passos do Plano Atual:

1. **Paralelização de Queries no Aluno:**
   - Corrigir a cachoeira de requisições assíncronas (waterfall) na página home do aluno (`app/aluno/(inicio)/page.tsx`) por meio de `Promise.all`.
2. **Desbloqueio de SSR nos Wrappers de Layout:**
   - Mapear a eliminação de buscas globais síncronas de banco de dados nos wrappers de layout do admin e professor (`app/admin/wrapper.tsx` e `app/professor/wrapper.tsx`).
3. **Ativação da Diretiva `'use cache'`:**
   - Identificar a falta da flag `dynamicIO: true` no `next.config.ts` para habilitar a execução real das diretivas de cache da aplicação.
4. **Otimização de Bundles Client-side (INP):**
   - Configurar importações dinâmicas para componentes e pacotes pesados como `jspdf` e `recharts` no componente `RelatorioEvolucao`.
5. **Correção de Legendas de Paginação:**
   - Ajustar a matemática e contagem do total geral de itens nas tabelas de dados paginadas.

### Passos Concluídos:
* [x] Auditoria técnica detalhada e validação de compilação sem erros (`tsc --noEmit`).
* [x] Elaboração do novo documento oficial de Engenharia de Performance: [CODE_REVIEW.md](file:///c:/dev/dg-notas/CODE_REVIEW.md).
* [x] Atualização deste arquivo [blueprint.md](file:///c:/dev/dg-notas/blueprint.md) com os passos do plano atualizados.

## Plano de Desenvolvimento Atual: Ajuste de Tipagem do Usuário de Sessão no Layout do Aluno

### Objetivo
Resolver o erro de compilação do TypeScript no arquivo `layout.tsx` do aluno, onde o objeto de usuário retornado pelo Better-Auth (`session.user`) contém propriedades opcionais/possivelmente indefinidas (como `image?: string | null | undefined`) e não pode ser atribuído diretamente à propriedade `user` do componente `AlunoWrapper`, que espera o tipo `User` gerado pelo Prisma (onde campos opcionais são estritamente `string | null` e obrigatórios).

### Passos para Resolução:
1. Importar o tipo `User` de `../generated/prisma` no arquivo [layout.tsx](file:///c:/dev/dg-notas/app/aluno/layout.tsx).
2. Realizar uma asserção de tipo em `session.user` utilizando `as unknown as User` ao passá-lo para `<AlunoWrapper>`.
3. Executar lint e builds locais para validar a correção de compilação sem introduzir erros adicionais.

## Plano de Desenvolvimento Atual: Correção do Erro de Blocking Route (Dynamic API outside of Suspense)

### Objetivo
Resolver o erro `Blocking Route: Data that blocks navigation was accessed outside of <Suspense>` no layout do aluno. Este erro ocorre porque a função dinâmica `headers()` (e a consequente chamada de sessão) é invocada diretamente no escopo principal do componente assíncrono `RootLayout`, antes do HTML estrutural ser renderizado, impedindo que o Next.js realize streaming ou prerenderização do shell estático.

### Passos para Resolução:
1. **Refatorar o layout do aluno (`layout.tsx`)**:
   - Manter a renderização do shell básico do HTML e das CSS variables do tema no `RootLayout` principal (que passa a ser estático/cached).
   - Criar um novo componente interno assíncrono chamado `AlunoLayoutContent` que encapsula o acesso à API dinâmica `headers()`, a validação/redirecionamento da sessão (`auth.api.getSession`), e a renderização do `<AlunoWrapper>`.
   - Envolver o componente `<AlunoLayoutContent>` em um bloco `<Suspense fallback={<Loading />}>` dentro do corpo (`<body>`) do `RootLayout`.
2. **Validar a compilação**:
   - Executar o type-check TypeScript (`npx tsc --noEmit`) para garantir que os tipos continuem 100% corretos e sem erros de build.

## Plano de Desenvolvimento Atual: Refatoração, Ajuste de Estilização e Tratamento de Horário no Componente AgendarMentoria (V6)

### Objetivo
Simplificar o componente `AgendarMentoria`, remover imports e funções mortas, extrair lógicas duplicadas em `onSubmit`, corrigir o design dos botões de horário (outline para selecionado e secondary para inativo), liberar a seleção do horário original no reagendamento (evitando `disabled` por falta de vagas) e ajustar o reset do formulário no fechamento automático do Dialog.

### Passos para Resolução:
1. **Limpeza de Imports e Componentes Mortos:** Remover componentes do `Select`, `Accordion`, `CalendarioAgendarMentoria` e ícone `Loader2`.
2. **Simplificação de Datas:** Ajustar `formatarData` para formatar datas locais sem conversões desnecessárias que causam desvio de dia em fusos horários específicos, e simplificar o `selected` do `<Calendar>` para `field.value`.
3. **Unificar Notificações:** Centralizar o disparo repetitivo de notificações em uma função assíncrona externa `enviarNotificacoes`.
4. **Estilização e Disponibilidade de Slots (Mockup):**
   - Configurar o botão ativo como `variant="outline"` (borda e texto azul, fundo transparente/card) e o inativo como `variant="secondary"` (fundo sólido escuro).
   - Identificar o horário original no modo de edição e mantê-lo ativo (evitando desabilitar por `vagas === 0`) e marcado como selecionado.
5. **Correção de Ciclo de Efeitos (React Compiler):** Mapear `slotIds` dentro do próprio `useEffect` de vagas e declarar `slotsHorario` na lista de dependências.
6. **Controle de Fechamento do Modal:** Utilizar um callback `handleOpenChange` no `<Dialog>` para disparar a função `cancelar()` e resetar o formulário sempre que o modal for fechado clicando fora ou com ESC.
7. **Tipagens e Props Radix:** Renomear a interface de props para `AgendarMentoriaProps` e delegar o atributo `disabled` do `<DialogTrigger>` diretamente aos botões internos correspondentes.

## Plano de Desenvolvimento Atual: Disparo de Busca Manual no InputBusca (V7)

### Objetivo
Remover o disparo de busca automático via `onChange` (com debounce) no componente `InputBusca`, permitindo que o usuário digite livremente sem alterar os parâmetros de consulta na URL e disparando a busca exclusivamente ao pressionar a tecla `Enter` (`onKeyDown`) ou ao clicar no botão de lupa (`onClick`).

### Passos para Resolução:
1. **Remover debounce e busca no onChange:** Excluir o hook `useDebouncedCallback` e manter no `onChange` apenas a atualização do estado local do input (`termoBusca`).
2. **Ajustar onKeyDown e onClick:** Configurar a função de busca síncrona `handleSearch` para ser acionada diretamente no evento `Enter` do teclado e no clique do botão `Button`.
3. **Validar compilação e tipagem:** Executar `tsc --noEmit` para garantir ausência de erros.

## Plano de Desenvolvimento Atual: Correção do Erro "Module not found: Can't resolve 'file-type'" no Elysia com Next.js (V8)

### Diagnóstico do Erro
Ao integrar o Elysia com o Next.js App Router em `app/api/[[...slugs]]/route.ts`, o bundler (Turbopack/Webpack) tenta resolver todas as dependências importadas estática ou dinamicamente. O Elysia possui em `elysia/dist/type-system/utils.mjs` uma importação dinâmica `import('file-type')` utilizada pelo validador de arquivos `t.File()`. Como o pacote `file-type` é uma peer dependency do Elysia e não estava instalado na raiz do projeto Next.js, a rota `/api` quebrou em tempo de compilação com erro 500 (`Module not found: Can't resolve 'file-type'`).

### Passos de Resolução:
1. **Instalação do `file-type`:** Instalar explicitamente o pacote `file-type` (`npm install file-type`) para que o bundler do Next.js consiga localizá-lo e resolver a importação dinâmica.
2. **Ajuste de configuração TypeScript:** Remoção do parâmetro obsoleto `"baseUrl": "."` do `tsconfig.json` exigido pelas versões mais recentes do TypeScript.
3. **Validação:** Reiniciar o servidor de desenvolvimento Next.js (`npm run dev`) e testar a rota `/api`.

## Plano de Desenvolvimento Atual: Correção do Erro "Failed to transpile next.config.ts - Cannot read properties of undefined (reading 'fileExists')" (V9)

### Diagnóstico do Erro
Ao atualizar dependências, o TypeScript foi acidentalmente elevado para a versão `7.0.2`. No Next.js 16, a transpilação do arquivo de configuração `next.config.ts` utiliza a API do compilador do TypeScript via `ts.sys.fileExists`. Na versão 7 do TypeScript, o objeto `ts.sys` não é mais exportado da mesma forma pela API legada, fazendo com que a transpilação do Next.js lance a exceção `TypeError: Cannot read properties of undefined (reading 'fileExists')`.

### Passos de Resolução:
1. **Reversão do TypeScript:** Instalação do TypeScript na versão estável compatível (`^5.9.3`) através de `npm install -D typescript@^5.9.3`.
2. **Limpeza de Cache:** Remoção do diretório de build `.next` para evitar artefatos em cache corrompidos de builds parciais anteriores.
3. **Validação:** Executado `tsc --noEmit` (0 erros) e `npx next info` (configuração carregada com sucesso).

## Plano de Desenvolvimento Atual: Integração do Eden Treaty e Resolução do PATH do Bun (V10)

### Diagnóstico do Problema
1. O executável do Bun está em `C:\Users\augus\.bun\bin\bun.exe` e já consta nas variáveis de ambiente de usuário do Windows, mas a sessão ativa do terminal Git Bash (PID 17636) foi aberta antes ou não recarregou o PATH da sessão atual, gerando `bash: bun: command not found`.
2. A biblioteca `@elysia/eden` foi adicionada para fornecer end-to-end type safety com Eden Treaty em `lib/eden.ts`, exigindo que a instância `app` do Elysia fosse devidamente exportada em `app/api/[[...slugs]]/route.ts`.

### Passos de Resolução:
1. **Export do `app` no Elysia:** Exportado `export const app = new Elysia(...)` e `export type App = typeof app;` em `app/api/[[...slugs]]/route.ts`.
2. **Instalação do `@elysia/eden`:** Instalado via `npm install @elysia/eden` para manter a consistência do `package-lock.json`.
## Plano de Desenvolvimento Atual: Validação de Query Params no Elysia com TypeBox e Eden Treaty (V11)

### Diagnóstico do Erro
Ao tipar manualmente o parâmetro de entrada do handler no Elysia:
```ts
.get('/alunos', async ({ query }: { query: { busca?: string; page: number; limit: number; } }) => { ... })
```
O TypeScript gerou erro de incompatibilidade (`Argument of type ... is not assignable to parameter of type 'InlineHandlerNonMacro'`).
Isso ocorreu por dois motivos fundamentais da arquitetura do Elysia:
1. **Inferência Orientada a Schema:** O Elysia deriva os tipos dos argumentos do handler (`query`, `params`, `body`, `headers`) diretamente a partir do schema de validação fornecido no hook da rota (TypeBox `t`). Sem um schema de validação explícito para `query`, o Elysia infere `query` como um `Record<string, string>` genérico, incompatível com a anotação manual.
2. **Coerção HTTP de Query Strings:** Parâmetros de URL chegam via HTTP sempre como strings. Tipar manualmente como `number` em tempo de compilação sem um validador de coerção (`t.Numeric()`) gera falhas tanto em tempo de tipo quanto em tempo de execução.

### Passos de Resolução:
1. **Remoção de Anotação Manual:** Remover a tipagem manual inline `{ query }: { query: ... }` no handler, deixando o Elysia inferir os tipos automaticamente.
2. **Declaração do Schema com TypeBox:** Adicionar o objeto de opções no endpoint contendo `query: t.Object({ busca: t.Optional(t.String()), page: t.Optional(t.Numeric({ default: 1 })), limit: t.Optional(t.Numeric({ default: 12 })) })`.
3. **Coerção Numérica via `t.Numeric()`:** Utilizar `t.Numeric()` para que o Elysia faça o parse automático das strings de query para `number` em tempo de execução.
4. **Validação:** Execução do `tsc --noEmit` validando compilação 100% limpa (0 erros).

## Plano de Desenvolvimento Atual: Compatibilização do Tipo Aluno e Correção de Sintaxe na Tabela de Alunos (V12)

### Diagnóstico do Erro
1. **Incompatibilidade de Tipo (`image: string | null` vs `image?: string`):**
   No componente `components/tabela-alunos.tsx`, o tipo `Aluno` definiu `image?: string;`, o que no TypeScript equivale a `string | undefined`. No entanto, os dados retornados pelo Prisma e pelo endpoint do Eden Treaty (`api.alunos.get()`) vêm da coluna `image` do banco relacional, cujo tipo é `string | null`. Como `null` não é atribuível a `string | undefined`, o TypeScript apontou erro de incompatibilidade ao passar `alunos.data!.data` para a prop `alunosIniciais` em `app/admin/alunos/page.tsx`.
2. **Erro de Sintaxe no JSX (TS1003):**
   Na linha 201 de `components/tabela-alunos.tsx`, o atributo `src` da tag `<Image />` continha `src={aluno. || "/avatar-placeholder.png"}`, faltando a propriedade `image` após o ponto, gerando `TS1003: Identifier expected`.

### Passos de Resolução:
1. **Ajuste do Tipo `Aluno`:** Alterar `image?: string;` para `image?: string | null;` no tipo `Aluno` em `components/tabela-alunos.tsx`, permitindo `string`, `null` e `undefined`.
2. **Correção do Acesso à Propriedade `aluno.image`:** Corrigir a expressão no avatar de `aluno.` para `aluno.image`.
3. **Tratamento Seguro em `app/admin/alunos/page.tsx`:** Garantir que o valor passado para `alunosIniciais` utilize fallback defensivo (`alunos.data?.data ?? []`).
4. **Validação de Tipos:** Executar `npx tsc --noEmit` para garantir zero erros no TypeScript.

## Plano de Desenvolvimento Atual: Correção de Responsividade e Overflow Horizontal na Rota de Aulas do Aluno (V13)

### Diagnóstico do Erro
Na rota `app/aluno/aulas/[aula]/page.tsx`, o layout apresentava estouro de largura e barra de rolagem horizontal devido a três fatores combinados:
1. **Altura Fixa Conflitante com Aspect Ratio:** O elemento `<main>` continha `sm:h-[600px]`. Como o componente `VideoPlayer` possui proporção intrínseca `aspect-video` (16:9), uma altura forçada de 600px obrigava o vídeo a ter pelo menos 1066.67px de largura.
2. **Largura Invertida/Desproporcional da Seção de Conteúdos:** A `<section>` lateral de conteúdos foi declarada com `w-3/4` (75% da largura da tela). A soma de 1066.67px do vídeo com 75% da tela gerava uma largura superior a 2000px, extrapolando totalmente a largura disponível no componente pai (`SidebarInset`).
3. **Ausência de `min-w-0` e Truncate nos Itens da Lista:** Em `ListaVideoaulas`, strings longas contínuas nos títulos de aulas não truncavam porque os elementos flex não possuíam `min-w-0`, empurrando a coluna de conteúdos para além da viewport.
4. **Falta de Quebra de Linha nos Textos Abaixo do Player:** Títulos e descrições sem espaços não quebravam em telas menores.

### Passos de Resolução:
1. **Refatorar o Container do Player e Conteúdos em `app/aluno/aulas/[aula]/page.tsx`:**
   - Remover a restrição fixa `sm:h-[600px]` e a classe desproporcional `w-3/4`.
   - Adicionar container card responsivo com `flex flex-col sm:flex-row w-full max-w-full rounded-xl border bg-card shadow-xs overflow-hidden`.
   - Envolver o `VideoPlayer` em `flex-1 min-w-0`, permitindo que o vídeo se adapte fluidamente à largura disponível mantendo o `aspect-video` 16:9 sem estourar.
   - Definir a coluna lateral de conteúdos como `max-sm:hidden w-72 lg:w-80 xl:w-96 shrink-0 flex flex-col p-4 sm:p-5 border-t sm:border-t-0 sm:border-l min-w-0`.
   - Colocar `ListaVideoaulas` dentro de um container flexível `flex-1 min-h-0 min-w-0 overflow-hidden` para que acompanhe a altura do vídeo e permita scroll vertical interno via Radix `ScrollArea`.
   - Adicionar `break-words break-all` no título e descrição da aula para evitar overflow por textos longos.
2. **Ajustar `components/lista-videoaulas.tsx`:**
   - Corrigir o erro de digitação `oveflow-hidden` para `overflow-hidden`.
   - Aplicar `min-w-0` e `shrink-0` nos ícones e textos para que o `truncate` funcione perfeitamente com reticências.
3. **Ajustar `components/menu-videoaulas.tsx`:**
   - Garantir wrapper `flex-1 min-h-0 min-w-0 overflow-hidden` no menu gaveta (Sheet) mobile.
4. **Harmonizar `app/aluno/aulas/[aula]/loading.tsx`:**
   - Atualizar a estrutura do esqueleto para espelhar as mesmas proporções fluidas do layout real.
5. **Ajustar `app/aluno/wrapper.tsx`:**
   - Garantir `className="w-full flex-1 min-w-0 overflow-x-hidden"` no `<main>` que encapsula as rotas do aluno.
6. **Validação:**
   - Executar `tsc --noEmit` e `npm run lint` para garantir zero regressões ou erros de compilação.

## Plano de Desenvolvimento Atual: Página Inicial da Área de Membros

### Objetivo
Criar a experiência inicial responsiva da área de membros em `/membro`, seguindo a referência visual enviada e reaproveitando os componentes shadcn/ui, a tipografia Poppins e as cores configuráveis da aplicação.

### Passos
1. Implementar o dashboard com apresentação do curso, progresso, retomada de aula, plano de estudos, agenda, materiais e suporte.
2. Adicionar o layout raiz necessário para esta árvore de rotas, carregando os estilos globais e as cores do sistema.
3. Direcionar as ações para rotas de aulas e mentorias já existentes e validar a compilação.

## Plano de Desenvolvimento Atual: Componente Card de Videoaula

### Objetivo
Extrair o card de retomada de aula da página inicial da área de membros para um componente reutilizável, reorganizando o conteúdo no layout vertical da referência visual enviada.

### Passos
1. Criar o componente `CardVideoaula` com miniatura e ação de reprodução, informações da aula e professora, duração, nível, progresso e controle de aula salva.
2. Substituir o markup atual da aula em `app/membro/(inicio)/page.tsx` pela nova instância do componente, preservando os dados e o destino da navegação.
3. Validar TypeScript e lint nos arquivos alterados.

## Plano de Desenvolvimento Atual: Catálogo de Aulas da Área de Membros

### Objetivo
Implementar `/membro/aulas` com listagem paginada, busca e filtros visuais inspirados na referência enviada, reutilizando o card de videoaula e a navegação mobile da área de membros.

### Passos
1. Carregar videoaulas e dados da professora com a ação já existente, adicionando suporte a pesquisa por título/descrição e filtros de categoria baseados nos termos disponíveis no conteúdo.
2. Criar a interface responsiva com busca, filtros, cards, estado vazio, erro, paginação progressiva e navegação mobile compartilhada com a página inicial.
3. Atualizar o link “Aulas” da navegação para a nova rota e validar TypeScript, lint e preview.

## Plano de Desenvolvimento Atual: Card Horizontal de Videoaula

### Objetivo
Atualizar o componente reutilizável de videoaula para o layout horizontal da referência: miniatura à esquerda, informações e metadados no centro e status e ação de reprodução à direita, com adaptação para telas pequenas.

### Passos
1. Reorganizar o `CardVideoaula` preservando os dados atuais, destinos de navegação, duração, status e progresso.
2. Adicionar uma miniatura com imagem da professora, título e controle visual de reprodução, além de uma ação destacada para assistir.
3. Validar o type-check e o lint do componente.

## Atualização da Documentação: Área de Membros

### Objetivo
Manter o README alinhado à área de membros disponível em `/membro`, descrevendo a página inicial do curso, o catálogo de aulas e a experiência mobile com base nas funcionalidades existentes.

### Passos Concluídos
- [x] Documentada a página inicial com progresso, módulos, aula em destaque e materiais extras.
- [x] Documentado o catálogo de aulas com busca, filtros por categoria, carregamento progressivo e tratamento de erro.
- [x] Atualizados a arquitetura do projeto, os recursos para alunos e os detalhes de autenticação no README.
