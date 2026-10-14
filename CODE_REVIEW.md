# Code Review — DG Notas (V5 — Revisão Criteriosa Pós-Refatoração)

**Data:** 6 de Junho de 2026
**Autor:** Engenheiro de Software Senior (Antigravity AI)
**Escopo:** Auditoria técnica completa pós-refatoração de autorização, análise de segurança, dead code, inconsistências de arquitetura e performance.

---

## 1. Resumo Executivo

A aplicação está significativamente mais sólida após a última sessão de refatoração. A centralização da autorização no `proxy.ts` e a eliminação das queries globais em wrappers de layout representam ganhos reais de performance. Ainda assim, esta auditoria identificou **7 problemas concretos** — alguns com potencial de impacto em produção — distribuídos entre segurança, dead code, inconsistências arquiteturais e race conditions de cache.

---

## 2. Problemas Identificados

---

### 🔴 Crítico 2.1 — Bypass de Segurança no `proxy.ts` por Ordem de Iteração de Objeto

**Arquivo:** [`proxy.ts`](file:///c:/dev/dg-notas/proxy.ts) — Linhas 44-53

**Descrição:**  
O loop `for...of Object.entries(routeRoleMap)` itera sobre as chaves na ordem de inserção do objeto. O problema é que `/aluno` é checado antes de `/admin`. Um pathname como `/aluno-test` ou uma futura rota `/aluno-admin` poderia acionar a verificação errada antes de chegar à regra correta. Mais grave: se um usuário com role `admin` acessar `/aluno/qualquer-coisa`, o proxy o redireciona corretamente para `/admin` — mas **não antes de uma comparação desnecessária por iteração**. O `break` após o match evita falsos positivos hoje, mas a dependência na ordem de inserção de chaves é uma armadilha frágil.

**Código atual:**
```typescript
for (const [pathPrefix, requiredRole] of Object.entries(routeRoleMap)) {
    if (pathname.startsWith(pathPrefix)) {
        if (userRole !== requiredRole) {
            return NextResponse.redirect(new URL(userHome, request.url));
        }
        break;
    }
}
```

**Problema real:** O `routeRoleMap` tem `/aluno` antes de `/admin`. Se alguém adicionar uma rota `/aluno-admin`, o `startsWith('/aluno')` vai disparar incorretamente. A solução é usar `===` no path exato ou comparar por segmentos.

**Solução recomendada:**
```typescript
// Comparar segmento exato, não prefixo genérico
const matchedPrefix = Object.keys(routeRoleMap).find(
    prefix => pathname === prefix || pathname.startsWith(prefix + '/')
);

if (matchedPrefix) {
    const requiredRole = routeRoleMap[matchedPrefix];
    if (userRole !== requiredRole) {
        return NextResponse.redirect(new URL(userHome, request.url));
    }
}
```

---

### 🔴 Crítico 2.2 — Dupla Verificação de Sessão em Layouts (Redundância com o Proxy)

**Arquivos afetados:**
- [`app/admin/wrapper.tsx`](file:///c:/dev/dg-notas/app/admin/wrapper.tsx) — L30-36
- [`app/professor/wrapper.tsx`](file:///c:/dev/dg-notas/app/professor/wrapper.tsx) — L34-40
- [`app/aluno/layout.tsx`](file:///c:/dev/dg-notas/app/aluno/layout.tsx) — L46-59
- [`app/aluno/(inicio)/page.tsx`](file:///c:/dev/dg-notas/app/aluno/(inicio)/page.tsx) — L12-18

**Descrição:**  
O `proxy.ts` (via `middleware.ts`) já bloqueia usuários sem sessão válida antes de eles chegarem em qualquer rota protegida. Apesar disso, todos os wrappers e várias pages realizam uma segunda chamada a `auth.api.getSession()` **apenas para verificar se há sessão** — gerando uma round-trip extra ao banco/sessão por cada requisição.

O `aluno/(inicio)/page.tsx` chama `getSession` pela **terceira vez** no mesmo request: uma vez no middleware, uma vez no `layout.tsx` (`AlunoLayoutContent`) e mais uma vez na própria page. São **3 chamadas de sessão por navegação** no dashboard do aluno.

**Impacto:** Latência acumulada desnecessária. Cada `getSession` é uma operação de I/O, mesmo que cacheada pelo Better Auth.

**Solução:** Passar o usuário resolvido pelo layout como prop para a page, evitando novas chamadas à API de sessão dentro das pages.

---

### 🟠 Alto 2.3 — `professor/wrapper.tsx` ainda faz signOut e redireciona manualmente (inconsistente com o proxy)

**Arquivo:** [`app/professor/wrapper.tsx`](file:///c:/dev/dg-notas/app/professor/wrapper.tsx) — Linhas 42-47

**Código atual:**
```typescript
if (session.user.role !== 'professor') {
    await auth.api.signOut({
        headers: await headers()
    })
    redirect('/')
}
```

**Descrição:**  
O `proxy.ts` já redireciona usuários de outras roles para suas respectivas áreas **sem deslogar**. Mas o `professor/wrapper.tsx` ainda executa um `signOut` forçado quando a role não bate. Isso cria uma inconsistência de comportamento: um `admin` que acesse `/professor` por erro (e.g., link antigo) será **deslogado** pelo wrapper, mas o proxy o teria redirecionado para `/admin` sem deslogar.

Além disso, o middleware executa primeiro. Se o proxy funcionou corretamente, nenhum usuário com role diferente de `professor` deveria chegar até esse wrapper. Este código é, portanto, dead code de segurança — e perigoso porque desloga o usuário se ele chegar aqui por algum bypass.

**Solução:** Remover o bloco de role-check do wrapper. A guarda deve existir apenas no proxy. Se quiser uma segunda camada, usar apenas `redirect` sem `signOut`.

---

### 🟠 Alto 2.4 — Imports Mortos no `assistente/wrapper.tsx` (Dead Code)

**Arquivo:** [`app/assistente/wrapper.tsx`](file:///c:/dev/dg-notas/app/assistente/wrapper.tsx)

**Imports não utilizados identificados:**
```typescript
import type { Metadata } from "next";           // ❌ Nunca usado
import { Poppins } from "next/font/google";      // ❌ Nunca usado
import { AppSidebar } from "@/components/app-sidebar";  // ❌ Substituído por AppSidebarAssistant
import { ProvedorAdmin } from "@/context/provider-admin"; // ❌ Errado — deveria ser ProvedorAssistente
import { ListarAvaliacoes, listarTemasMes, listarTemas, ListarCriterios } from "@/actions/avaliacao"; // ❌ Alguns não usados
import { listarMentoriasMes } from "@/actions/mentoria"; // ❌ Nunca usado no wrapper
import { listarAlunosGoogle } from "@/actions/alunos";   // ❌ Nunca usado no wrapper
```

**Impacto:** Esses imports aumentam o bundle de análise estática do compilador, podem causar erros de tree-shaking inesperados e, no caso de `ProvedorAdmin` sendo importado mas `ProvedorAssistente` sendo usado, indica um copy-paste de arquivo que nunca foi limpo.

---

### 🟠 Alto 2.5 — Import Morto no `relatorio-evolucao.tsx` (`ContextoProfessor`)

**Arquivo:** [`components/relatorio-evolucao.tsx`](file:///c:/dev/dg-notas/components/relatorio-evolucao.tsx) — Linha 39

**Código:**
```typescript
import { ContextoProfessor } from '@/context/contexto-professor'
```

**Descrição:** O `ContextoProfessor` é importado mas **não é usado em lugar nenhum** no arquivo. Esse import sobreviveu a alguma refatoração anterior e gera ruído no bundle do cliente (o componente tem `'use client'`).

---

### 🟡 Médio 2.6 — Query sem Cache no Dashboard Admin (`listarAlunosGoogle` + `ListarAvaliacoes`)

**Arquivo:** [`app/admin/(dashboard)/page.tsx`](file:///c:/dev/dg-notas/app/admin/(dashboard)/page.tsx) — Linhas 39-40

**Código atual:**
```typescript
const { total } = await listarAlunosGoogle()
const avaliacoesIniciais = await ListarAvaliacoes(Number(mes), Number(ano), 1, 1000)
```

**Problemas identificados:**

1. **`listarAlunosGoogle` com `limit: 1000` implícito:** O `listarAlunosGoogle` interno chama `obterAlunos` que usa cache com `cacheTag('lista-alunos')`. Mas a chamada aqui usa os parâmetros padrão (`page=1, limit=12`), apenas para pegar o `total`. Isso busca 12 registros completos (incluindo `include: { avaliacoesComoAluno: true }`) só para extrair `total`. Um `prisma.user.count()` seria 10x mais barato.

2. **`ListarAvaliacoes(... , 1, 1000)`:** Busca até 1000 avaliações sem cache. Essa chamada não está dentro de nenhuma função `'use cache'` e o `limit=1000` pode trazer payloads enormes ao servidor em plataformas com muitas correções. Não há paginação ou memoização aqui.

3. **Waterfall sequencial:** As duas queries (`listarAlunosGoogle` e `ListarAvaliacoes`) estão fora do `Promise.all` que existe acima, executando **depois** das queries paralelizadas — gerando um mini-waterfall desnecessário.

**Código com o problema:**
```typescript
// Paralelo ✅
const [mentorias, temasMes] = await Promise.all([
    listarMentoriasMes(Number(mes), Number(ano)),
    listarTemasMes(Number(mes), Number(ano)),
]);

// Sequencial ❌ (fora do Promise.all acima)
const { total } = await listarAlunosGoogle()
const avaliacoesIniciais = await ListarAvaliacoes(...)
```

**Solução:**
```typescript
const [mentorias, temasMes, { total }, avaliacoesIniciais] = await Promise.all([
    listarMentoriasMes(Number(mes), Number(ano)),
    listarTemasMes(Number(mes), Number(ano)),
    listarAlunosGoogle(),
    ListarAvaliacoes(Number(mes), Number(ano), 1, 1000)
]);
```

---

### 🟡 Médio 2.7 — `let whereClause: any` em `listarMentoriasProfessor`

**Arquivo:** [`actions/mentoria.ts`](file:///c:/dev/dg-notas/actions/mentoria.ts) — Linha 483

**Código:**
```typescript
let whereClause: any = {
    professorId: professorId,
};
```

**Descrição:** Uso explícito de `any` que desabilita a verificação de tipos do TypeScript. O Prisma exporta o tipo correto para `where` clauses via `Prisma.MentoriaWhereInput`. Substituir `any` por esse tipo revelaria erros de tipo em tempo de compilação.

**Solução:**
```typescript
let whereClause: Prisma.MentoriaWhereInput = {
    professorId: professorId,
};
```

---

### 🟡 Médio 2.8 — `console.log` em Código de Produção

**Arquivos:**
- [`actions/mentoria.ts`](file:///c:/dev/dg-notas/actions/mentoria.ts) — Linhas 62, 92, 922, 963
- [`actions/admin.ts`](file:///c:/dev/dg-notas/actions/admin.ts) — Linha 33
- [`actions/notificacoes.ts`](file:///c:/dev/dg-notas/actions/notificacoes.ts) — Linhas 182, 183, 191, 195, 225
- [`actions/videoaulas.ts`](file:///c:/dev/dg-notas/actions/videoaulas.ts) — Linhas 50, 81

**Descrição:** `console.log` em Server Actions são visíveis nos logs do servidor em produção (Vercel). Os logs de `notificacoes.ts` (`📤 Enviando notificações...`, `✅ Resultado...`) são especialmente verbosos e gerarão ruído nos logs da Vercel a cada disparo de notificação. Em `mentoria.ts` e `videoaulas.ts`, `console.log(error)` sem message descritiva é menos informativo que `console.error`.

**Recomendação:** Substituir todos os `console.log` por `console.error` (para erros reais) ou removê-los (para logs de debug). Para logs estruturados em produção, considerar uma lib como `pino` ou o módulo de logging nativo do Next.js.

---

### 🟢 Baixo 2.9 — Legenda de Paginação Incorreta na `TabelaAlunos`

**Arquivo:** [`components/tabela-alunos.tsx`](file:///c:/dev/dg-notas/components/tabela-alunos.tsx) — Linha 223

**Código atual:**
```tsx
{paginaAtual} - {totalPage} de {totalStudents} resultados
```

**Problema:** Exibe "1 - 3 de 47 resultados" quando deveria exibir "1 - 12 de 47 resultados" (itens desta página, não número da última página). O campo `totalPage` é o número de páginas, não o último item da página atual. A matemática correta é:

```tsx
{((paginaAtual - 1) * limite) + 1} - {Math.min(paginaAtual * limite, totalStudents)} de {totalStudents} resultados
```

---

### 🟢 Baixo 2.10 — `configuracoes?.logoSistema!` com Non-Null Assertion Perigoso

**Arquivo:** [`app/aluno/wrapper.tsx`](file:///c:/dev/dg-notas/app/aluno/wrapper.tsx) — Linhas 76, 82

**Código:**
```tsx
<AppSidebarAluno logo={configuracoes?.logoSistema!} />
<FooterAluno logo={configuracoes?.logoAplicativo!} />
```

**Descrição:** O `?.` (optional chain) e `!` (non-null assertion) se contradizem: o `?.` significa "pode ser nulo", mas o `!` diz ao TypeScript "nunca é nulo". Se `configuracoes` for `null` (o que é possível, já que o tipo do prop é `ConfiguracaoComCores | null`), o `!` não previne um erro em runtime, apenas suprime o erro TypeScript. Deve-se usar um fallback:

```tsx
<AppSidebarAluno logo={configuracoes?.logoSistema ?? ''} />
<FooterAluno logo={configuracoes?.logoAplicativo ?? ''} />
```

---

## 3. Tabela de Prioridades

| # | Severidade | Arquivo | Problema | Impacto |
|---|---|---|---|---|
| 2.1 | 🔴 Crítico | `proxy.ts` | `startsWith` pode causar match incorreto | Segurança / Bypass |
| 2.2 | 🔴 Crítico | Múltiplos wrappers | Triple `getSession` por request no aluno | Performance / TTFB |
| 2.3 | 🟠 Alto | `professor/wrapper.tsx` | `signOut` manual inconsistente com proxy | UX / Inconsistência |
| 2.4 | 🟠 Alto | `assistente/wrapper.tsx` | 7+ imports mortos | Bundle / Dead Code |
| 2.5 | 🟠 Alto | `relatorio-evolucao.tsx` | Import `ContextoProfessor` não usado | Bundle Client-side |
| 2.6 | 🟡 Médio | `admin/dashboard/page.tsx` | Queries sequenciais fora do Promise.all | Performance |
| 2.7 | 🟡 Médio | `actions/mentoria.ts:483` | `whereClause: any` | Type Safety |
| 2.8 | 🟡 Médio | Múltiplos actions | `console.log` em produção | Observabilidade |
| 2.9 | 🟢 Baixo | `tabela-alunos.tsx` | Legenda de paginação incorreta | UX |
| 2.10 | 🟢 Baixo | `aluno/wrapper.tsx` | `?.!` contradição de nullability | Type Safety |

---

## 4. Pontos Positivos Confirmados ✅

- **`proxy.ts`** implementado corretamente como middleware central de autorização com `roleHomeMap` — boa arquitetura.
- **`Promise.all`** corretamente aplicado na maioria dos wrappers e pages para paralelismo de queries.
- **`'use cache'`** com `cacheLife` e `cacheTag` aplicado nas funções de leitura mais frequentes (`obterAlunos`, `obterAvaliacoesAluno`, `ListarCriterios`, `listarDiasSemana`).
- **Transações Prisma com `isolationLevel: 'Serializable'`** no agendamento de mentorias — excelente prática para evitar race conditions.
- **Padrão de separação público/privado** em Server Actions (`obterAlunos` privado + `listarAlunosGoogle` público com auth) — padrão sólido.
- **`Suspense` com streaming** no `aluno/layout.tsx` via `AlunoLayoutContent` — correto.
- **`normalizarParams`** extraído para helper reutilizável em `helpers/normalizar-params.ts` — boa DX.

---

## 5. Plano de Ação Recomendado

### Prioridade 1 — Segurança e Consistência (Hoje)
1. Corrigir o match de rota no `proxy.ts` (problema 2.1) para usar `prefix + '/'`
2. Remover o bloco `signOut` manual do `professor/wrapper.tsx` (problema 2.3)

### Prioridade 2 — Dead Code e Type Safety (Esta Semana)
3. Limpar os imports mortos do `assistente/wrapper.tsx` (problema 2.4)
4. Remover import `ContextoProfessor` não utilizado de `relatorio-evolucao.tsx` (problema 2.5)
5. Substituir `whereClause: any` por `Prisma.MentoriaWhereInput` (problema 2.7)
6. Corrigir `?.!` no `aluno/wrapper.tsx` (problema 2.10)

### Prioridade 3 — Performance e UX (Próxima Sprint)
7. Parallelizar queries no `admin/dashboard/page.tsx` (problema 2.6)
8. Reduzir chamadas de sessão redundantes nas pages do aluno (problema 2.2)
9. Corrigir legenda de paginação no `tabela-alunos.tsx` (problema 2.9)
10. Substituir `console.log` por `console.error` ou remover (problema 2.8)
