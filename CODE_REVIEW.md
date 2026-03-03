# Code Review — DG Notas (Análise Senior Completa)

**Data:** 25 de Fevereiro de 2026  
**Escopo:** Revisão criteriosa focada em **Qualidade de Código**, **Performance**, **Segurança** e **Escalabilidade**.  
**Arquivos analisados:** 7 actions, 5 contextos, proxy.ts, 2 cron routes, schema Prisma, componentes de UI.

---

## 1. Segurança 🔒

### ✅ O que está sólido
- **Proxy (Next.js 16):** Protege com wildcard (`/aluno/:path*`, `/professor/:path*`) toda a árvore de rotas usando cookie de sessão do Better-Auth. Impede qualquer renderização de página sem autenticação.
- **Server Actions de Mutação:** Todas as actions que alteram dados (`AdicionarAvaliacao`, `EditarAvaliacao`, `DeletarAvaliacao`, `adicionarMentoria`, `atualizarContaProfessor`, `banirUsuario`) verificam a sessão corretamente.
- **Cache Encapsulado:** Funções de cache (`obterAvaliacoesAluno`, `obterTemasDisponiveis`, `obterMentoriasAluno`) são privadas e inacessíveis externamente. As actions exportadas fazem auth antes de invocá-las.
- **Eliminação das Rotas `/api` Vulneráveis:** Os endpoints desprotegidos (`/api/notificacoes`, `/api/save-subscription`) foram removidos. As notificações agora transitam exclusivamente via Server Actions autenticadas.

### 🔴 Problemas Encontrados

#### 1.1 Bug Lógico na Auth de `salvarPushSubscription`
**Arquivo:** `actions/notificacoes.ts` — Linha 31
```typescript
if (!session?.user && session?.user.role !== 'admin') {
```
**O Bug:** O operador `&&` faz com que, se `session?.user` for `null/undefined`, a segunda condição (`session?.user.role`) lance um erro de acesso em `undefined`, ou (mais provavelmente com optional chaining) nunca entre no bloco. A lógica pretendida é `||`:
```typescript
if (!session?.user || session.user.role !== 'admin') {
```
**Impacto:** Na prática, qualquer usuário autenticado (mesmo um aluno) pode chamar esta Server Action e gravar subscriptions para qualquer `userId` arbitrário, pois a condição de bloqueio nunca é atingida.

#### 1.2 Bug Idêntico em `editarDiasSemana`
**Arquivo:** `actions/mentoria.ts` — Linha 48
```typescript
if (!session?.user && session?.user.role !== 'admin') {
```
Mesmo problema. Um aluno poderia teoricamente ativar/desativar dias da semana do professor.

#### 1.3 `editarSlotsHorario` Sem Autenticação
**Arquivo:** `actions/mentoria.ts` — Linha 72
```typescript
export async function editarSlotsHorario(id: number, status: boolean) {
  try { // <-- Nenhuma checagem de sessão
    await prisma.slotHorario.update(...)
```
**Impacto:** Qualquer pessoa com acesso à aplicação (até um aluno) pode habilitar/desabilitar slots de horário do professor, pois a função é exportada como Server Action sem nenhuma barreira.

#### 1.4 `listarTemasMes` e `ListarAvaliacoes` Sem Auth
**Arquivo:** `actions/avaliacao.ts` — Linhas 125 e 642
Ambas são Server Actions exportadas que consultam dados do banco sem checagem de sessão. `listarTemasMes` retorna todos os temas criados em um mês, e `ListarAvaliacoes` retorna todas as avaliações de todos os alunos de um mês — dados sensíveis acessíveis por qualquer requisição.

#### 1.5 `listarMentoriasHorario` e `listarMentoriasMes` Sem Auth
**Arquivo:** `actions/mentoria.ts` — Linhas 364 e 404
Listam mentorias de todos os alunos (incluindo nome e email) sem nenhuma verificação.

---

## 2. Performance ⚡

### ✅ O que está otimizado
- **Paginação Real:** Todas as listagens principais (avaliações, temas, videoaulas, mentorias, alunos) usam `take` e `skip` no Prisma com `Promise.all` para buscar dados e contagem em paralelo.
- **Cache Fragmentado por Usuário:** Tags dinâmicas (`listar-avaliacoes-aluno-${alunoId}`) garantem que a invalidação de cache de um aluno não afete outros.
- **Debounce no Frontend:** A verificação de vagas de mentoria usa debounce de 300ms, evitando enxurrada de Server Actions ao navegar pelo calendário.
- **Skeleton Loaders:** Feedback visual imediato enquanto dados assíncronos carregam.

### 🟡 Oportunidades de Melhoria

#### 2.1 `DeletarTema` — 3 Queries Sequenciais (Sem Transação)
**Arquivo:** `actions/avaliacao.ts` — Linha 218
```typescript
await prisma.criterioAvaliacao.deleteMany(...)  // Query 1
await prisma.avaliacao.deleteMany(...)           // Query 2
await prisma.tema.delete(...)                    // Query 3
```
Se a Query 2 falhar, os critérios da Query 1 já foram deletados mas as avaliações ainda existem — inconsistência no banco. Envolver num `prisma.$transaction([...])` garante atomicidade.

#### 2.2 `ListarAvaliacoesTemaId` — Sem Paginação
**Arquivo:** `actions/avaliacao.ts` — Linha 432
```typescript
const avaliacoes = await prisma.avaliacao.findMany({
    where: { temaId: temaId },
    include: { tema: true, aluno: true, criterios: true }
});
```
Se um tema popular acumular centenas de avaliações, esta query retorna **todas** sem limite. Adicionar `take`/`skip` e um `count` resolve.

#### 2.3 `listarTemas` — Include de `Avaliacao` Inteiro
**Arquivo:** `actions/avaliacao.ts` — Linha 89
```typescript
include: {
    professor: true,
    Avaliacao: true, // <-- Puxa TODAS as avaliações de cada tema
    _count: { select: { Avaliacao: ... } }
}
```
O `_count` já existe e é suficiente para mostrar o badge de contagem. O `Avaliacao: true` adicional carrega desnecessariamente o corpo completo de TODAS as avaliações de cada tema. Remover este include economiza dados e memória.

---

## 3. Qualidade de Código 🧹

### 🟡 Itens para Limpeza

#### 3.1 Imports Mortos
- **`actions/avaliacao.ts` L2:** `unstable_cache` e `updateTag` são importados mas nunca utilizados.
- **`context/provedor-aluno.tsx` L9:** `import { updateTag } from "next/cache"` — import de função server-side num arquivo `'use client'`. Não causa erro em runtime, mas é código morto e confuso.
- **`context/provedor-aluno.tsx` L5-6:** `ListarAvaliacoesAlunoId`, `listarTemasDisponiveis`, `listarMentoriasAluno` — todos importados mas comentados/não usados.

#### 3.2 `useEffect` Fantasma no `ProvedorAluno`
**Arquivo:** `context/provedor-aluno.tsx` — Linhas 59-89
O `useEffect` de notificações tem todo o corpo comentado. Ele roda a cada notificação, seta `isLoading = true`, não faz nada, e seta `isLoading = false`. Isso causa re-renders desnecessários em toda a árvore de componentes do aluno por nada.

#### 3.3 Inconsistência de Nomenclatura
Existe uma mistura de idiomas e convenções:
- Funções em PascalCase (`ListarAvaliacoesAlunoId`, `EditarAvaliacao`, `DeletarTema`) mescladas com camelCase (`listarTemasDisponiveis`, `adicionarTema`, `enviarRespostaAvaliacao`).
- Parâmetros de paginação: `page/limit` em avaliações vs `pagina/limite` em temas disponíveis.

Padronizar para um só idioma (pt-BR ou en-US) e uma só convenção (`camelCase` para funções) melhora a previsibilidade do código.

#### 3.4 `atualizarCache` — Wrapper Desnecessário
**Arquivo:** `actions/cache.ts`
```typescript
async function revalidarCache(tag: string) {
    updateTag(tag);
}
export async function atualizarCache(tag: string) {
    // ... auth check ...
    revalidarCache(tag); // <-- Sem await
}
```
A função interna `revalidarCache` é um wrapper de uma linha que não adiciona valor. E a chamada a ela **não possui `await`**, o que pode causar comportamento não-determinístico. Simplifique chamando `updateTag(tag)` diretamente após a checagem de auth.

---

## 4. Escalabilidade 📈

### ✅ Padrões Sólidos
- **Isolamento de Transação Serializable** nas mentorias previne double-booking de slots.
- **Cache por Tag de Usuário** permite escalar horizontalmente sem colisão entre caches de alunos diferentes.
- **Proxy no Edge** rejeita usuários deslogados antes mesmo do Node processar a request.

### 🟡 Pontos de Atenção

#### 4.1 Número Mágico de Vagas (Hardcoded `4`)
O limite de 4 mentorias por slot está espalhado em múltiplas funções (`adicionarMentoria`, `verificarDisponibilidadeHorario`, `verificarDisponibilidadeMultiplosSlots`). Se o professor quiser aumentar para 6, é preciso alterar em 4+ lugares. Extrair para uma constante (`MAX_VAGAS_POR_SLOT = 4`) ou para a configuração do banco resolve o problema.

#### 4.2 `dadosProfessor()` — `findFirst` com `role: 'admin'`
**Arquivo:** `actions/admin.ts` — Linha 25
Se futuramente existirem 2 professores (admins), `findFirst` retornará um deles de forma indeterminística. Mudar para `findUnique` com o `session.user.id` garante que o perfil correto é encontrado.

---

## 5. Resumo Executivo

| Categoria | Nota | Status |
|-----------|------|--------|
| **Segurança** | 7/10 | 3 bugs lógicos de auth e 4 actions sem checagem |
| **Performance** | 9/10 | Excelente uso de cache e paginação, apenas edge cases |
| **Qualidade** | 7/10 | Imports mortos, código comentado, nomenclatura mista |
| **Escalabilidade** | 9/10 | Transações serializáveis, cache fragmentado, proxy edge |

---

## 6. Plano de Ação (Priorizado)

### 🔴 Prioridade Alta (Segurança — Fazer Hoje)
1. Corrigir `&&` → `||` em `salvarPushSubscription` (notificacoes.ts:31)
2. Corrigir `&&` → `||` em `editarDiasSemana` (mentoria.ts:48)
3. Adicionar auth check em `editarSlotsHorario` (mentoria.ts:72)
4. Adicionar auth check em `listarTemasMes` (avaliacao.ts:125)
5. Adicionar auth check em `ListarAvaliacoes` (avaliacao.ts:642)
6. Adicionar auth check em `listarMentoriasHorario` (mentoria.ts:364) e `listarMentoriasMes` (mentoria.ts:404)

### 🟡 Prioridade Média (Performance + Qualidade — Próximos Dias)
7. Envolver `DeletarTema` em `$transaction`
8. Remover `Avaliacao: true` do include em `listarTemas`
9. Adicionar paginação em `ListarAvaliacoesTemaId`
10. Limpar imports mortos e código comentado no `provedor-aluno.tsx`
11. Adicionar `await` na chamada `revalidarCache(tag)` em `cache.ts`

### 🟢 Prioridade Baixa (Manutenibilidade — Backlog)
12. Padronizar nomenclatura (idioma e convenção de casing)
13. Extrair constante `MAX_VAGAS_POR_SLOT`
14. Alterar `dadosProfessor()` para usar `findUnique` com userId
