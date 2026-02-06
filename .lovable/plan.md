
# Notícias Visuais (Image-First) — Plano de Implementação

## Visão Geral

Adicionar um novo tipo de conteúdo "Notícia Visual" ao B NEWS, baseado em carrosseis de imagens (ate 6), com dois formatos (vertical imersivo e horizontal classico). O artigo completo existe apenas como base de conhecimento para o chat.

---

## Fase 1: Base de Dados

### Migracaco SQL

Adicionar 3 novos campos a tabela `articles`:

| Campo | Tipo | Default | Descricao |
|-------|------|---------|-----------|
| `content_type` | `text` | `'article'` | `'article'` ou `'visual'` |
| `visual_format` | `text` | `null` | `'vertical'` ou `'horizontal'` |
| `gallery_urls` | `text[]` | `null` | Array de URLs de imagens (ate 6) |

```sql
ALTER TABLE public.articles
  ADD COLUMN content_type text NOT NULL DEFAULT 'article',
  ADD COLUMN visual_format text,
  ADD COLUMN gallery_urls text[];
```

---

## Fase 2: Tipos TypeScript

### 2.1 `src/types/news.ts`

Adicionar campos ao tipo `Article`:

```typescript
export interface Article {
  // ... campos existentes ...
  contentType: 'article' | 'visual';
  visualFormat?: 'vertical' | 'horizontal';
  galleryUrls?: string[];
}
```

### 2.2 `src/admin/types/admin.ts`

Adicionar campos ao tipo `Article` do admin:

```typescript
export interface Article {
  // ... campos existentes ...
  content_type: 'article' | 'visual';
  visual_format: 'vertical' | 'horizontal' | null;
  gallery_urls: string[] | null;
}
```

### 2.3 `src/hooks/usePublishedArticles.ts`

Actualizar `adaptArticle` para mapear os novos campos:

```typescript
export function adaptArticle(dbArticle: PublishedArticle): Article {
  return {
    // ... existentes ...
    contentType: (dbArticle as any).content_type || 'article',
    visualFormat: (dbArticle as any).visual_format || undefined,
    galleryUrls: (dbArticle as any).gallery_urls || [],
  };
}
```

---

## Fase 3: Componentes Frontend (Publico)

### 3.1 Novo componente: `src/components/news/VisualCarousel.tsx`

Componente de carousel com dois modos:

**Vertical Imersivo (aspect ratio 4:5):**
- Imagem central em destaque (grande)
- Imagens laterais parcialmente visiveis e reduzidas
- Ao deslizar, a proxima imagem cresce para o centro
- Usa `embla-carousel-react` (ja instalado)

**Horizontal Classico (aspect ratio 16:9):**
- Carousel standard com dots indicadores
- Navegacao por swipe/setas

```typescript
interface VisualCarouselProps {
  images: string[];
  format: 'vertical' | 'horizontal';
  className?: string;
}
```

### 3.2 Modificar `src/components/news/NewsCard.tsx`

Adicionar logica condicional para `article.contentType === 'visual'`:

```text
SE contentType === 'visual':
  +----------------------------------+
  | [ CAROUSEL DE IMAGENS ]           |
  |                                    |
  | Categoria                          |
  | Titulo da noticia                  |
  |                                    |
  | [ Explorar a noticia ]     [share] |
  +----------------------------------+

  - NAO mostrar summary/lead
  - Substituir imagem unica pelo VisualCarousel
  - Manter botao "Explorar a noticia" e share

SE contentType === 'article':
  - Comportamento actual (sem alteracoes)
```

### 3.3 Modificar `src/pages/ArticlePage.tsx`

Para noticias visuais, o layout muda:

```text
SE contentType === 'visual':
  1. Voltar
  2. VisualCarousel (grande, imersivo)
  3. Titulo
  4. Categoria + Data
  5. Botao flutuante mobile: "Explorar esta noticia"
  6. ArticleChat (com perguntas sugeridas)

  NAO mostrar:
  - Summary/lead
  - Conteudo textual
  - Quick Facts (ficam para o chat responder)
  - Reading time (nao relevante)

SE contentType === 'article':
  - Layout actual (sem alteracoes)
```

---

## Fase 4: Dashboard / CRM (Admin)

### 4.1 Botao "Criar como Noticia Visual" no Pipeline

Modificar `src/admin/components/pipeline/PipelineCard.tsx`:
- Adicionar opcao no dropdown menu dos artigos Pendentes:
  - "Converter em Noticia Visual" (icone Camera/Image)
  - Navega para `/admin/article/{id}?visual=true`

### 4.2 Novo componente: `src/admin/components/editor/VisualEditor.tsx`

Ecra dedicado para editar Noticias Visuais:

```text
+--------------------------------------------------+
| EDITOR VISUAL                                      |
|                                                    |
| Tipo: [Vertical Imersivo] [Horizontal Classico]   |
|                                                    |
| +--------+ +--------+ +--------+                  |
| |  Img 1 | |  Img 2 | |  Img 3 |                  |
| |  [x]   | |  [x]   | |  [x]   |  + Adicionar    |
| +--------+ +--------+ +--------+                  |
|                                                    |
| Preview do Carousel em tempo real                  |
|                                                    |
| Titulo: [____________________________]             |
| Categoria: [dropdown]                              |
|                                                    |
| [Guardar Rascunho]  [Publicar]                     |
+--------------------------------------------------+
```

Funcionalidades:
- Upload multiplo (drag and drop) via `MediaPicker` existente
- Reordenar imagens (drag)
- Remover imagens individuais
- Preview do carousel no formato seleccionado
- Maximo 6 imagens
- Campo titulo e selector de categoria

### 4.3 Modificar `src/admin/components/editor/ArticleEditor.tsx`

Adicionar toggle entre editor normal e editor visual:
- Se `content_type === 'visual'`, mostrar `VisualEditor` em vez do `ContentPanel`
- Se `content_type === 'article'`, manter layout actual

### 4.4 Modificar `src/admin/components/editor/PublishPanel.tsx`

Adicionar selector de tipo de conteudo:

```text
Tipo de Conteudo:
  [Artigo Normal]  [Noticia Visual]
```

Quando muda para "Noticia Visual":
- Oculta campos de lead, conteudo textual, quick facts
- Mostra upload de galeria

### 4.5 Modificar `src/admin/pages/ArticleEditorPage.tsx`

Actualizar `handleSave` para incluir os novos campos na gravacao:
- `content_type`
- `visual_format`
- `gallery_urls`

---

## Fase 5: Integracao com IA

Sem alteracoes necessarias. O artigo reformulado continua a existir na base de dados com `content` preenchido. O chat (`ArticleChat`) ja utiliza o conteudo do artigo para responder, independentemente do `content_type`.

---

## Ficheiros a Criar

| Ficheiro | Descricao |
|----------|-----------|
| `src/components/news/VisualCarousel.tsx` | Carousel com modos vertical/horizontal |
| `src/admin/components/editor/VisualEditor.tsx` | Editor de galeria para noticias visuais |

## Ficheiros a Modificar

| Ficheiro | Alteracao |
|----------|-----------|
| **SQL Migration** | Adicionar `content_type`, `visual_format`, `gallery_urls` |
| `src/types/news.ts` | Novos campos no tipo `Article` |
| `src/admin/types/admin.ts` | Novos campos no tipo `Article` admin |
| `src/hooks/usePublishedArticles.ts` | Mapear novos campos em `adaptArticle` |
| `src/components/news/NewsCard.tsx` | Renderizar carousel para tipo visual |
| `src/pages/ArticlePage.tsx` | Layout diferente para noticias visuais |
| `src/admin/components/editor/ArticleEditor.tsx` | Toggle entre editor normal e visual |
| `src/admin/components/editor/PublishPanel.tsx` | Selector de tipo de conteudo |
| `src/admin/pages/ArticleEditorPage.tsx` | Gravar novos campos |
| `src/admin/components/pipeline/PipelineCard.tsx` | Opcao "Converter em Noticia Visual" |

---

## Notas Tecnicas

- O `embla-carousel-react` e `embla-carousel-autoplay` ja estao instalados como dependencias
- O bucket `article-images` do Storage ja existe para armazenar as imagens da galeria
- O `MediaPicker` existente sera reutilizado para seleccionar/carregar imagens
- As RLS policies existentes na tabela `articles` aplicam-se automaticamente aos novos campos
- O Supabase Realtime ja esta configurado para a tabela `articles`
