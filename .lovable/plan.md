
# Ligacao Frontend-Backend: Artigos Publicados em Tempo Real

## Problema Actual

O frontend esta completamente desligado da base de dados:

| Componente | Actualmente | Deveria |
|------------|-------------|---------|
| NewsFeed | Importa `articles` de `src/data/articles.ts` (mock) | Buscar artigos `status='published'` do Supabase |
| HeroChat (slider) | Usa `getLatestArticles()` do mock | Buscar ultimos 4 artigos publicados |
| ArticlePage | Usa `getArticleById()` do mock | Buscar artigo por ID/slug do Supabase |
| Imagens | URLs `blob:` temporarias | Upload para Supabase Storage com URLs permanentes |

**Resultado**: Mesmo publicando artigos no CRM, o site nao actualiza.

---

## Arquitectura Proposta

```text
                    BACKEND (Supabase)                    FRONTEND (React)
                    
┌─────────────────────────────────────┐     ┌─────────────────────────────────────┐
│                                     │     │                                     │
│  articles (tabela)                  │     │  usePublishedArticles() ◄───────────┤
│  ├── status = 'published'           │────►│  - Busca artigos publicados         │
│  ├── image_url (Storage URL)        │     │  - Filtro por categoria             │
│  ├── published_at                   │     │  - Ordenacao por data               │
│  └── highlight_type                 │     │  - Paginacao infinita               │
│                                     │     │                                     │
│  article-images (bucket Storage)    │     │  useArticle(id) ◄───────────────────┤
│  └── URLs permanentes               │────►│  - Busca artigo individual          │
│                                     │     │  - Para pagina de artigo            │
│                                     │     │                                     │
│  RLS: articles_public_published     │     │  Components:                        │
│  └── Permite SELECT para anon       │     │  - NewsFeed (usa hook)              │
│                                     │     │  - HeroChat (usa hook)              │
│                                     │     │  - ArticlePage (usa hook)           │
│                                     │     │                                     │
└─────────────────────────────────────┘     └─────────────────────────────────────┘
```

---

## Plano de Implementacao

### Fase 1: Hooks para Artigos Publicados

**Criar `src/hooks/usePublishedArticles.ts`**

```typescript
// Hook para buscar artigos publicados do Supabase
export function usePublishedArticles(options?: {
  category?: string;
  limit?: number;
  highlightType?: 'hero' | 'trending' | 'normal';
}) {
  // - Busca artigos com status='published'
  // - Ordena por published_at DESC
  // - Suporta filtro por categoria
  // - Suporta paginacao infinita
  // - Retorna { articles, isLoading, hasMore, loadMore }
}

export function useArticle(id: string) {
  // - Busca artigo individual por ID
  // - Retorna { article, isLoading, error }
}

export function useLatestArticles(count: number) {
  // - Busca ultimos N artigos para slider
  // - Filtro opcional por highlight_type
}
```

### Fase 2: Corrigir Upload de Imagens

**Modificar `src/admin/components/editor/PublishPanel.tsx`**

```typescript
// ANTES - URLs temporarias (perdem-se)
onUpdate({ image_url: URL.createObjectURL(file) });

// DEPOIS - Upload para Supabase Storage
const { data } = await supabase.storage
  .from('article-images')
  .upload(`${articleId}/${file.name}`, file);

const publicUrl = supabase.storage
  .from('article-images')
  .getPublicUrl(data.path).data.publicUrl;

onUpdate({ image_url: publicUrl });
```

### Fase 3: Actualizar Componentes do Frontend

**1. NewsFeed.tsx**

```typescript
// ANTES
import { articles } from '@/data/articles';

// DEPOIS  
import { usePublishedArticles } from '@/hooks/usePublishedArticles';

export function NewsFeed({ categoryFilter }) {
  const { articles, isLoading, hasMore, loadMore } = usePublishedArticles({
    category: categoryFilter,
    limit: 10,
  });
  // ... renderizar artigos da base de dados
}
```

**2. HeroChat.tsx**

```typescript
// ANTES
import { getLatestArticles } from '@/data/articles';
const latestArticles = getLatestArticles(3);

// DEPOIS
import { useLatestArticles } from '@/hooks/usePublishedArticles';
const { articles: latestArticles, isLoading } = useLatestArticles(4);
```

**3. ArticlePage.tsx**

```typescript
// ANTES
import { getArticleById } from '@/data/articles';
const article = getArticleById(id);

// DEPOIS
import { useArticle } from '@/hooks/usePublishedArticles';
const { article, isLoading, error } = useArticle(id);
```

### Fase 4: Tipo Article Unificado

**Criar `src/types/article.ts`** (ou actualizar `news.ts`)

```typescript
import { Tables } from '@/integrations/supabase/types';

// Tipo derivado directamente da base de dados
export type PublishedArticle = Tables<'articles'>;

// Adaptador para manter compatibilidade com componentes existentes
export function adaptArticle(dbArticle: PublishedArticle): Article {
  return {
    id: dbArticle.id,
    title: dbArticle.title || '',
    summary: dbArticle.lead || '',
    content: dbArticle.content || '',
    category: (dbArticle.category || 'sociedade') as CategoryId,
    imageUrl: dbArticle.image_url || undefined,
    publishedAt: dbArticle.published_at || '',
    readingTime: dbArticle.reading_time || 3,
    author: dbArticle.author || 'Redaccao B NEWS',
    quickFacts: dbArticle.quick_facts || [],
    relatedArticleIds: [], // Calculado separadamente
    tags: dbArticle.tags || [],
  };
}
```

---

## Ficheiros a Criar/Modificar

| Ficheiro | Accao | Descricao |
|----------|-------|-----------|
| `src/hooks/usePublishedArticles.ts` | CRIAR | Hooks para artigos publicados |
| `src/components/news/NewsFeed.tsx` | MODIFICAR | Usar hook em vez de mock |
| `src/components/news/HeroChat.tsx` | MODIFICAR | Usar hook para slider |
| `src/pages/ArticlePage.tsx` | MODIFICAR | Buscar artigo do Supabase |
| `src/admin/components/editor/PublishPanel.tsx` | MODIFICAR | Upload de imagens para Storage |
| `src/types/article.ts` | CRIAR | Tipos unificados e adaptador |

---

## Logica de Destaques no Feed

Artigos recentes/importantes aparecem primeiro:

```typescript
// Query para NewsFeed
const { data } = await supabase
  .from('articles')
  .select('*')
  .eq('status', 'published')
  .order('highlight_type', { ascending: true }) // hero primeiro
  .order('published_at', { ascending: false })
  .limit(limit);
```

Para o slider do Hero:

```typescript
// Ultimos 4 artigos OU artigos marcados como "hero"
const { data } = await supabase
  .from('articles')
  .select('*')
  .eq('status', 'published')
  .or('highlight_type.eq.hero,published_at.gte.' + last24h)
  .order('published_at', { ascending: false })
  .limit(4);
```

---

## Resultado Esperado

Apos implementacao:

1. **Publicar artigo no CRM** → Aparece imediatamente no site
2. **Slider do Hero** → Mostra ultimas 4 noticias publicadas
3. **Feed principal** → Artigos ordenados por data/destaque
4. **Imagens persistem** → Upload para Storage com URLs permanentes
5. **Dados mock eliminados** → `src/data/articles.ts` pode ser removido

---

## Consideracoes Tecnicas

### RLS (Row Level Security)
A politica `articles_public_published` ja existe e permite:
- Utilizadores anonimos podem ler artigos com `status='published'`
- Nao e necessaria autenticacao para ver o site publico

### Performance
- Usar React Query (`@tanstack/react-query`) para cache e deduplicacao
- Implementar paginacao para evitar carregar todos os artigos
- Prefetch de artigos ao hover para navegacao mais rapida

### Fallback Gracioso
- Se nao houver artigos publicados, mostrar mensagem amigavel
- Se imagem falhar, usar placeholder padrao

