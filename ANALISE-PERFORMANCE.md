# Análise de Performance - Área de Aluno

## 🔴 Score Atual: 81 | First Contentful Paint: 3.27s (POBRE)

---

## 1. PROBLEMA PRINCIPAL: First Contentful Paint Alto (3.27s)

### 🎯 Root Causes:

#### 1.1 **Renderização Bloqueada no Layout** 
**Arquivo:** `app/aluno/layout.tsx` (linhas 76-82)

```tsx
const [avaliacoes, mentorias, temas] = await Promise.all([
    ListarAvaliacoesAlunoId(userId),    // ⚠️ Sem paginação = TODAS as avaliações
    listarMentoriasAluno(userId),       // ⚠️ Sem limite = TODAS as mentorias
    ListarTemasDisponiveis(userId),     // ⚠️ Query complexa com LEFT JOIN
]);
```

**Impacto:**
- A página NÃO renderiza até que TODAS as 3 queries terminem
- Se uma query demora 3s, tudo demora 3s
- Não há Progressive Enhancement ou Streaming

#### 1.2 **Queries sem Paginação/Limite**

**`ListarAvaliacoesAlunoId()`** - `actions/avaliacao.ts:426`
```tsx
const avaliacoes = await prisma.avaliacao.findMany({
    where: { alunoId: alunoId },
    include: {
        tema: true,
        criterios: true,      // ⚠️ Carrega TODAS as relações
        aluno: true,
    },
    // ⚠️ SEM LIMITE - pode retornar 100, 1000+ registros!
});
```

**Problemas:**
- Sem `take`/`skip`
- Sem limite de registros
- Carrega todos os critérios para cada avaliação
- Alunos com muitas avaliações travamtudo

#### 1.3 **Query Complexa de Temas**

**`ListarTemasDisponiveis()`** - `actions/avaliacao.ts:467`
```tsx
const temas = await prisma.tema.findMany({
    where: {
        Avaliacao: {
            none: {
                alunoId: alunoId  // ⚠️ Subquery cara!
            }
        },
        disponivel: true
    },
    include: {
        professor: true       // ⚠️ JOIN desnecessário
    },
});
```

**Problemas:**
- `Avaliacao: { none: { alunoId } }` = Subquery complexa
- Verifica TODAS as avaliações para cada tema
- Não há índice otimizado para isso
- Ordem `createdAt` sem índice
- Carrega professor.* completo (talvez desnecessário)

#### 1.4 **Imports em Cascata**

Layout carrega muitos componentes pesados:
- `AppSidebarAluno` - Renderiza menu completo
- `ProvedorAluno` - Context com múltiplos useMemo
- `SidebarProvider` - Layout complexo
- `FooterAluno` - Footer com componentes

---

## 2. PROBLEMAS SECUNDÁRIOS

### 2.1 **Sem React Suspense para Streaming**

A página deveria usar `Suspense` para renderizar seções incrementalmente:

```tsx
// ❌ Atualmente: Tudo espera tudo
const [avaliacoes, mentorias, temas] = await Promise.all([...])

// ✅ Deveria ser: Streaming com Suspense
<Suspense fallback={<SkeletonHabilidades />}>
    <ListaCompetenciasAluno />
</Suspense>
```

### 2.2 **Componente ProvedorAluno Pesado**

**Arquivo:** `context/provedor-aluno.tsx`

```tsx
useEffect(() => {
    if (!notificacoes?.data?.url) return;
    
    if (url === '/aluno/avaliacoes') {
        // ⚠️ Refetch desnecessário - refaz as mesmas queries caras!
        const [novasAvaliacoes, novosTemas] = await Promise.all([
            ListarAvaliacoesAlunoId(userId),  // Novamente SEM LIMITE
            ListarTemasDisponiveis(userId)
        ]);
    }
}, [notificacoes])
```

**Problemas:**
- Cada notificação refaz as queries caras
- Sem cache client-side
- Sem deduplicação

### 2.3 **Carregamento de Fonte (Poppins)**

```tsx
const poppins = Poppins({
    weight: ['200', '300', '400', '500', '600', '700', '800', '900'],  // ⚠️ 8 pesos!
    display: 'swap',
});
```

**Problema:**
- Carrega 8 variações de font
- Isso multiplica requisições + overhead
- Recomendado: 3-4 pesos máximo

### 2.4 **Sem Otimização de Imagens**

Na `page.tsx` do aluno:
- `Header` pode ter imagens não otimizadas
- `DesempenhoAlunoGrafico` pode ter SVGs inline pesados
- Sem `priority` ou `loading="lazy"`

### 2.5 **Sidebar Sempre Renderizada**

```tsx
<SidebarProvider>
    <AppSidebarAluno />           // ⚠️ Renderiza menu completo no servidor
    <SidebarInset>
        {children}
    </SidebarInset>
</SidebarProvider>
```

**Problema:**
- Sidebar é renderizada em TODAS as páginas do layout
- Pode conter muitos items/navegação complexa
- Deveria ser lazy ou hidratada no cliente

---

## 3. IMPACTO ESPECÍFICO NO FCP (First Contentful Paint)

```
Timeline esperado (ATUAL):
0ms ────────────────────────────── 3000ms (FCP) ────────────────────
     |
     └─ Layout layout.tsx inicia
        └─ Auth.getSession() ~200ms
           └─ Promise.all([
               ├─ ListarAvaliacoesAlunoId() ~1200ms ⚠️ GARGALO
               ├─ listarMentoriasAluno() ~400ms
               └─ ListarTemasDisponiveis() ~1500ms ⚠️ GARGALO
           ])
           └─ ProvedorAluno renderiza
              └─ SidebarProvider renderiza
                 └─ Primeiro elemento visível aparece ~3000ms

Timeline esperado (OTIMIZADO):
0ms ──────────── 800ms ────────────── 1500ms
     |
     └─ Layout layout.tsx inicia
        └─ Auth.getSession() ~200ms
           └─ Renderiza Sidebar skeleton IMEDIATAMENTE ✅
              └─ Headers renderizado ~800ms (FCP) ✅
                 └─ Promise.all queries em paralelo
                    └─ Conteúdo hidrata quando pronto ~1500ms
```

---

## 4. RECOMENDAÇÕES DE CORREÇÃO

### 🔴 Prioritárias (Impacto Alto)

#### 4.1 Implementar Paginação em `ListarAvaliacoesAlunoId()`
```typescript
export async function ListarAvaliacoesAlunoId(
    alunoId: string, 
    busca?: string,
    page: number = 1,      // ✅ NOVO
    limit: number = 10     // ✅ NOVO
) {
    const whereClause = { alunoId, ... };
    
    const [avaliacoes, total] = await Promise.all([
        prisma.avaliacao.findMany({
            where: whereClause,
            include: { tema: true, criterios: true, aluno: true },
            take: limit,           // ✅ Limita
            skip: (page - 1) * limit
        }),
        prisma.avaliacao.count({ where: whereClause })
    ]);
    
    return { data: avaliacoes, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}
```

#### 4.2 Otimizar `ListarTemasDisponiveis()`
```typescript
export async function ListarTemasDisponiveis(alunoId: string, limit: number = 20) {
    // ✅ Mudar de LEFT JOIN complexo para abordagem simples
    const temas = await prisma.tema.findMany({
        where: {
            disponivel: true,
            // ✅ REMOVER: Avaliacao: { none: ... }
            // Validar no cliente ou em query separada
        },
        include: {
            professor: {
                select: {
                    id: true,
                    name: true
                    // ✅ Não carregar tudo
                }
            }
        },
        take: limit,  // ✅ NOVO
        orderBy: { createdAt: 'desc' }
    });
    
    // ✅ Filtrar temas já respondidos no cliente
    const usuarioAvaliacoes = await prisma.avaliacao.findMany({
        where: { alunoId },
        select: { temaId: true }
    });
    
    return temas.filter(t => !usuarioAvaliacoes.find(a => a.temaId === t.id));
}
```

#### 4.3 Usar React Suspense no Layout
```tsx
// app/aluno/layout.tsx
import { Suspense } from 'react';

export default async function RootLayout({ children }) {
    // ✅ Renderizar Sidebar imediatamente
    return (
        <SidebarProvider>
            <AppSidebarAluno />  // ✅ Hidratação rápida
            <SidebarInset>
                <Suspense fallback={<HeaderSkeleton />}>
                    <Header />
                </Suspense>
                
                <Suspense fallback={null}>
                    <InicializarNotificacoes userId={userId} />
                </Suspense>
                
                <ProvedorAluno {...props}>  // ✅ Só quando dados prontos
                    {children}
                </ProvedorAluno>
            </SidebarInset>
        </SidebarProvider>
    );
}
```

#### 4.4 Reduzir Pesos de Font
```typescript
const poppins = Poppins({
    weight: ['400', '600', '700'],  // ✅ Apenas essenciais
    subsets: ['latin'],
    display: 'swap',
});
```

### 🟠 Importantes (Impacto Médio)

#### 4.5 Adicionar Índices no Banco

```prisma
// prisma/schema.prisma

model Avaliacao {
    // ...
    @@index([alunoId])           // ✅ NOVO
    @@index([temaId])            // ✅ NOVO
    @@index([createdAt])         // ✅ NOVO
}

model Tema {
    // ...
    @@index([disponivel])        // ✅ NOVO
    @@index([createdAt])         // ✅ NOVO
}
```

#### 4.6 Remover Refetch desnecessário no Provedor
```tsx
// Remover o useEffect que refaz todas as queries
// Usar apenas revalidateTag() no servidor
```

#### 4.7 Lazy Load Footer e Componentes Pesados
```tsx
import dynamic from 'next/dynamic';

const FooterAluno = dynamic(() => import('@/components/ui/footer-aluno'), {
    loading: () => null,
    ssr: false
});
```

### 🟡 Otimizações (Impacto Baixo/Médio)

#### 4.8 Cache no Servidor
```typescript
// Na ação
export async function ListarAvaliacoesAlunoId(...) {
    // ...
    revalidateTag(`avaliacoes-${alunoId}`);  // ✅ Tag para invalidação
}
```

#### 4.9 Otimizar Imagens
```tsx
// Em componentes que usam imagens
<Image 
    src={...}
    priority      // ✅ Para imagens above-the-fold
    quality={80}  // ✅ Reduz tamanho
/>
```

---

## 5. RESUMO DE IMPACTO ESPERADO

| Otimização | FCP | LCP | CLS | Dificuldade |
|------------|-----|-----|-----|-------------|
| Paginação avaliacões | -800ms ⬇️ | -600ms ⬇️ | Neutro | ⭐⭐ |
| Otimizar ListarTemas | -500ms ⬇️ | -300ms ⬇️ | Neutro | ⭐⭐ |
| Suspense + Streaming | -700ms ⬇️ | -400ms ⬇️ | Mínimo | ⭐⭐⭐ |
| Reduzir fonts | -200ms ⬇️ | -200ms ⬇️ | Neutro | ⭐ |
| Índices DB | -400ms ⬇️ | -300ms ⬇️ | Neutro | ⭐ |
| Lazy load footer | -100ms ⬇️ | -50ms ⬇️ | Neutro | ⭐ |

**Total esperado:** 3.27s → ~1.5s (54% melhoria) ✅

---

## 6. ORDEM DE PRIORIDADE

1. ✅ **URGENTE:** Adicionar paginação em `ListarAvaliacoesAlunoId()` 
2. ✅ **URGENTE:** Otimizar `ListarTemasDisponiveis()`
3. ✅ **IMPORTANTE:** Implementar Suspense no layout
4. ✅ **IMPORTANTE:** Adicionar índices no banco de dados
5. 🟠 **MÉDIO:** Reduzir pesos de font
6. 🟠 **MÉDIO:** Lazy load componentes pesados
7. 🟡 **BAIXO:** Otimizar imagens individuais

