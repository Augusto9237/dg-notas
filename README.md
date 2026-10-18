<h1 align="center">
  <br/>
  🎓 DG Redação — Plataforma de Mentoria e Redação
  <br/>
</h1>

<p align="center">
  <strong>SaaS educacional de ponta para mentoria, correção de redações e videoaulas exclusivas.</strong>
  <br/>
  Construída com o que há de mais moderno no ecossistema JavaScript.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16%2B-black?style=flat-square&logo=next.js"/>
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react"/>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript"/>
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma"/>
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css"/>
  <img alt="Vercel" src="https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel"/>
</p>

---

## 📌 Visão Geral

**DG** é uma plataforma SaaS educacional full-stack projetada para conectar professores e alunos em um ecossistema completo de **mentoria personalizada**, **correção inteligente de redações** (ENEM/Vestibulares) e uma **área de membros** com videoaulas protegidas.

A plataforma foi construída com um stack de alta performance voltado para escalabilidade, type-safety de ponta a ponta e uma experiência de usuário nativa — com suporte a PWA e notificações push em tempo real.

---

## ✨ Diferenciais da Plataforma

### 🤖 Correção Automática por Inteligência Artificial (Google Gemini)

O diferencial mais poderoso da plataforma: um sistema de **correção automática de redações por imagem** usando a API multimodal do **Google Gemini (gemini-3-flash-preview)**.

- O professor fotografa/faz upload da redação manuscrita do aluno.
- O Gemini analisa a imagem, lê a caligrafia e avalia as **5 competências oficiais do ENEM** (C1 a C5), atribuindo notas de 0 a 200 pontos cada.
- Retorna um **objeto JSON estruturado** com pontuações por competência e um **feedback narrativo** de até 220 palavras, citando trechos do texto do aluno.
- **Context Caching de 24h:** o prompt de sistema (extenso, ~2.000 tokens) é armazenado no **Gemini Context Cache**, reduzindo drasticamente o custo e a latência das requisições subsequentes.
- **Retry com Exponential Backoff:** resiliência automática para erros `429` (rate limit) e `5xx`, com até 3 tentativas e jitter aleatório.

```
Nota máxima: 1000 pontos (5 × 200)
Notas por competência: múltiplos de 40 (0, 40, 80, 120, 160 ou 200)
```

---

### 🌐 API REST Type-Safe com Elysia + Eden Treaty

A camada de API interna usa **Elysia.js** — um framework de alta performance — integrado ao App Router do Next.js via rota `[[...slugs]]`.

- **Validação de schema em runtime** com **TypeBox** (`t.Object`, `t.Numeric`, `t.Optional`) — query params string são coercidos automaticamente para `number`.
- **Eden Treaty** (`@elysia/eden`) garante **end-to-end type safety**: o tipo da resposta da API é inferido diretamente da implementação do servidor, sem geração de código ou OpenAPI manual.
- Resultado: chamadas no cliente com autocompletar, tipos inferidos e zero chance de desalinhamento entre backend e frontend.

```ts
// lib/eden.ts — cliente tipado gerado automaticamente
const api = treaty<App>('http://localhost:3000');
const { data } = await api.alunos.get({ query: { page: 1, limit: 12 } });
// data.total, data.data[0].name — 100% tipados pelo servidor
```

---

### 🎬 CDN de Vídeos com Cloudflare R2

Todos os vídeos da área de membros são armazenados e entregues via **Cloudflare R2** — com **zero taxas de egresso** e baixa latência global.

- **API S3-Compatible:** integração via `@aws-sdk/client-s3` e `@aws-sdk/s3-request-presigner`, sem vendor lock-in.
- **URLs Pré-Assinadas:** o cliente obtém uma URL temporária via `r2/upload-url` e faz upload direto ao bucket sem passar pelo servidor — evitando limites de payload.
- **Player Protegido:** `controlsList="nodownload"` + `disablePictureInPicture` + desativação do menu de contexto bloqueiam downloads pelo browser.
- **Lazy Loading de Vídeo:** o player só inicializa e solicita o streaming quando o usuário clica em "play", economizando banda.

---

### 🔐 Autenticação Moderna com Better Auth

- Sistema completo com **Better Auth**, suportando **OAuth (Google)** e **Email/Senha**.
- Controle de acesso por **roles**: `admin`, `professor`, `assistente` e `user` (aluno).
- Proteção de rotas no servidor via `auth.api.getSession({ headers })` — sem middleware client-side vulnerável.
- Campo `matriculado` bloqueia acesso à área de membros até liberação manual pelo admin.
- Suporte a **impersonation** de usuário para suporte e administração.

---

### 🗄️ Banco de Dados com Prisma Accelerate e Neon PostgreSQL

- **Neon PostgreSQL:** banco serverless com escala automática e branching — ideal para preview deployments.
- **Prisma ORM v6:** schema declarativo com migrações e índices compostos otimizados.
- **Prisma Accelerate:** proxy de borda com **cache distribuído** — queries frequentes retornam da CDN sem tocar o banco.
- **`@prisma/adapter-neon`:** driver via WebSockets para ambientes serverless, contornando limites de conexões TCP.
- Índices compostos estratégicos: `[alunoId, status]`, `[professorId, status]`, `[data, slotId, status]`.

---

### 📲 PWA + Notificações Push em Tempo Real

- **Progressive Web App:** instalável em desktop e mobile, sem App Store.
- **Web Push API** (`web-push`): notificações push com **VAPID keys**, em background e foreground.
- **Firebase Cloud Messaging (FCM):** canal alternativo para Android, com `firebase-admin` no servidor.
- **Service Worker** customizado: intercepta eventos de push e exibe notificações com o app fechado.
- **Assinaturas por dispositivo:** cada dispositivo do usuário possui `PushSubscription` própria com chaves de encriptação `p256dh`/`auth`.

---

### 📧 E-mail Transacional com Resend + React Email

- Templates de e-mail construídos com **componentes React** via `@react-email/components`.
- Envio via **Resend** — alta entregabilidade e rastreamento de cliques/aberturas.
- Templates renderizados server-side via `@react-email/render`.

---

### 📄 Geração de PDF e Relatórios

- **React PDF (`@react-pdf/renderer`):** relatórios de evolução em PDF com layout profissional e componentes React declarativos.
- **jsPDF + html2canvas / html-to-image:** captura de componentes como imagem para exportação alternativa.
- Relatórios incluem: histórico de notas por competência, gráficos de evolução e feedback consolidado.

---

## 🛠️ Stack Tecnológico Completo

| Categoria | Tecnologia | Versão | Função |
|-----------|-----------|--------|--------|
| **Framework** | Next.js | 16+ | App Router, RSC, Server Actions, Streaming |
| **UI Library** | React | 19 | React Compiler, Concurrent Features |
| **Linguagem** | TypeScript | 5.9 | Tipagem estrita em todo o projeto |
| **API Interna** | Elysia.js | 1.4 | REST API performática com validação TypeBox |
| **Type-Safe Client** | Eden Treaty | — | E2E type safety sem geração de código |
| **Autenticação** | Better Auth | 1.3 | OAuth, Email/Senha, Roles, Sessions |
| **ORM** | Prisma | 6 | Schema, migrations, queries type-safe |
| **Cache de BD** | Prisma Accelerate | 2 | Cache distribuído na borda |
| **Banco de Dados** | Neon PostgreSQL | — | Serverless, branching, WebSockets |
| **CDN de Vídeos** | Cloudflare R2 | — | Zero egress fees, S3-compatible |
| **IA / LLM** | Google Gemini | 3-flash | Correção multimodal + Context Cache 24h |
| **Push Notifications** | Web Push API | — | Notificações foreground e background |
| **Firebase** | Firebase / Admin | 12 / 13 | FCM push, Admin SDK |
| **E-mail** | Resend | 6 | Transacional com React Email |
| **Design System** | shadcn/ui + Radix UI | — | Componentes acessíveis e customizáveis |
| **Estilo** | Tailwind CSS | v4 | Utility-first, CSS Variables dinâmicas |
| **Animações** | Motion (Framer) | 12 | Micro-interações e transições |
| **Gráficos** | Recharts | 2 | Visualização de dados e evolução |
| **Formulários** | React Hook Form + Zod | — | Validação rigorosa client/server |
| **PDF** | React PDF + jsPDF | — | Relatórios e exportação |
| **Player** | React Player | 3 | Reprodução protegida de vídeo |
| **Upload** | React Dropzone | — | Drag-and-drop de arquivos |
| **Analytics** | Vercel Analytics + Speed Insights | — | Métricas de uso e performance |
| **Deploy** | Vercel | — | Edge Network, CI/CD, Previews |

---

## 🗂️ Arquitetura do Projeto

```
dg-notas/
├── app/                         # App Router (Next.js)
│   ├── (login)/                 # Grupo de rotas de autenticação
│   ├── aluno/                   # Dashboard e ferramentas do aluno
│   │   ├── (inicio)/page.tsx    # Home com métricas (queries paralelas)
│   │   ├── avaliacoes/          # Envio e histórico de redações
│   │   └── aulas/[aula]/        # Player da videoaula (streaming protegido)
│   ├── professor/               # Dashboard do professor
│   │   ├── correcoes/           # Fila de correção + IA Gemini
│   │   └── aulas/               # Gestão e upload de videoaulas
│   ├── admin/                   # Painel administrativo completo
│   ├── assistente/              # Dashboard do assistente
│   └── api/
│       ├── [[...slugs]]/        # Elysia REST API (alunos, professores, critérios)
│       ├── auth/                # Better Auth handler
│       ├── upload/              # Upload de vídeos para R2
│       ├── r2/upload-url/       # Geração de URLs pré-assinadas
│       └── cron/                # Jobs periódicos agendados
│
├── components/                  # Componentes React reutilizáveis
│   ├── ui/                      # Design System (shadcn/ui)
│   ├── video-player.tsx         # Player com proteção e lazy loading
│   ├── formulario-videoaula.tsx # Upload integrado ao R2
│   ├── lista-videoaulas.tsx     # Catálogo com busca e paginação
│   └── card-competencias.tsx    # Notas por competência (C1-C5)
│
├── actions/                     # Server Actions (Next.js)
│   └── videoaulas.ts            # CRUD + revalidação de cache
│
├── ia/
│   └── gemini.ts                # Cliente Gemini: context cache + retry
│
├── hooks/
│   └── use-upload-r2.ts         # Hook de upload com progresso e erros
│
├── lib/
│   ├── auth.ts                  # Config Better Auth
│   ├── prisma.ts                # Cliente Prisma + Accelerate
│   ├── eden.ts                  # Cliente Eden Treaty tipado
│   ├── webpush.ts               # Dispatcher de notificações push
│   ├── firebase.ts              # Config Firebase client
│   └── firebase-admin.ts        # Config Firebase Admin SDK
│
├── prisma/
│   └── schema.prisma            # Schema: User, Avaliacao, Mentoria, Videoaula...
│
└── public/
    └── sw.js                    # Service Worker para PWA e Push
```

---

## 🚀 Funcionalidades por Perfil

### 👩‍🎓 Aluno
- Dashboard com métricas de performance e notas por competência (C1–C5)
- Envio de redações como imagem com drag-and-drop
- Histórico de redações com status (`ENVIADA` / `CORRIGIDA`)
- Gráficos interativos de evolução de desempenho
- Agendamento de mentorias em calendário interativo com controle de vagas
- Acesso à área de membros com videoaulas exclusivas e player protegido
- Instalação como PWA + notificações push de novas correções e mentorias

### 👨‍🏫 Professor / Admin
- Gestão de alunos com liberação manual de matrícula e acesso
- Fila de correção com avaliação por competências e feedback narrativo
- **Correção automática por IA** (Gemini): análise multimodal da imagem da redação
- Publicação de temas de redação com prazo de entrega
- Gestão de disponibilidade de horários de mentoria (dias + slots)
- Upload e publicação de videoaulas na CDN (Cloudflare R2)
- Geração e exportação de relatórios de evolução em PDF

### 🛡️ Administrador
- Painel completo de usuários com busca, paginação e filtros
- Configurações globais: nome, logo, cores, slogan da plataforma
- Personalização de cores injetadas como **CSS Variables em tempo real**
- Controle de acesso granular por roles

---

## ⚙️ Como Executar

### 1. Clone e instale as dependências

```bash
git clone <url-do-repositorio>
cd dg-notas
npm install
```

### 2. Configure as variáveis de ambiente

Crie o arquivo `.env.local` na raiz:

```env
# ── Banco de Dados ──────────────────────────────────────────
DATABASE_URL=postgresql://...

# ── Autenticação (Better Auth) ──────────────────────────────
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ── Inteligência Artificial (Google Gemini) ─────────────────
GEMINI_API_KEY=

# ── CDN de Vídeos (Cloudflare R2) ───────────────────────────
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# ── Notificações Push (VAPID) ────────────────────────────────
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# ── Firebase (Push alternativo) ─────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_SDK_JSON=

# ── E-mail (Resend) ─────────────────────────────────────────
RESEND_API_KEY=
```

### 3. Inicialize o banco de dados

```bash
npx prisma generate
npx prisma db push
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`.

### 5. Build para produção

```bash
npm run build   # Executa prisma generate + next build
```

---

## 📈 Otimizações de Performance

| Otimização | Implementação |
|-----------|--------------|
| Queries paralelas | `Promise.all` e `prisma.$transaction` na home do aluno |
| Cache de borda do BD | Prisma Accelerate em queries de leitura |
| Context Cache de IA | Prompt Gemini cacheado por 24h na API Google |
| Streaming SSR | `<Suspense>` nos layouts para desbloqueio do shell estático |
| Importações dinâmicas | `next/dynamic` para `recharts`, `jsPDF` e componentes pesados |
| Índices compostos | `[alunoId, status]`, `[data, slotId, status]` no schema |
| Zero egress de vídeo | Cloudflare R2 com upload direto via URL pré-assinada |
| Service Worker | Cache de assets estáticos e estratégia offline para PWA |

---

## 🧱 Modelos de Dados

```
User ──── Avaliacao (aluno/professor)
     ──── Mentoria  (aluno/professor)
     ──── Videoaula (professor)
     ──── PushSubscription[] (dispositivos)

Avaliacao ──── Tema
          ──── CriterioAvaliacao[] ──── Criterio (C1-C5)

Mentoria  ──── Horario ──── SlotHorario
                      ──── DiaSemana

Configuracao ──── CorSistema[] (CSS Variables dinâmicas do tema)
```

---

## 🔒 Segurança

- Todas as rotas e Server Actions validam sessão server-side via `auth.api.getSession`.
- Upload de vídeos via URLs pré-assinadas — o arquivo nunca passa pelo servidor Next.js.
- Correção por IA restrita ao role `admin` no servidor.
- Acesso à área de membros condicionado a `matriculado: true`, verificado server-side.
- Senhas gerenciadas pelo Better Auth com hashing seguro.

---

<p align="center">
  <strong>DG — Elevando o padrão da educação online com tecnologia de ponta e design premium.</strong>
</p>
