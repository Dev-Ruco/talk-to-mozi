

# Redesign do B NEWS — Portal de Notícias com IA Conversacional

Este plano abrange as alterações visuais e estruturais solicitadas, divididas em fases incrementais para evitar regressões.

---

## Fase 1: Tipografia e Sistema de Cards Uniforme

### Tipografia
- Reforçar hierarquia no `index.css` e nos componentes:
  - H1 (títulos de página): `font-weight: 700`, `text-2xl` a `text-4xl`
  - Títulos de artigo nos cards: `font-weight: 700` (actualmente `600/semibold` — subir para `bold`)
  - Categorias/badges: `font-weight: 500`
  - Metadata (data, tempo): `font-weight: 400`

### Cards uniformes (`NewsCard.tsx` + `SponsoredCard.tsx`)
- Aplicar altura fixa ao card default:
  - Card: `h-[360px] flex flex-col`
  - Imagem: `h-[180px]` (substituir `AspectRatio` por altura fixa)
  - Título: `line-clamp-2`, `font-bold`
  - Resumo: `line-clamp-2`
  - Conteúdo inferior: `mt-auto` para empurrar acções para baixo
- Aplicar o mesmo layout dimensional ao `SponsoredCard` variant `feed`
- Garantir que cards de publicidade e notícias no feed são indistinguíveis em tamanho

**Ficheiros**: `src/components/news/NewsCard.tsx`, `src/components/news/SponsoredCard.tsx`

---

## Fase 2: Redesign da Secção "Últimas Notícias de Hoje"

### Remover secção "Em destaque hoje"
- Eliminar `<FeaturedArticle />` da página Index

### Novo container destacado
- Criar container com gradiente da marca (roxo B NEWS), bordas arredondadas
- Dentro: slider horizontal automático com cards de notícias
- Slider: autoplay 5s, loop infinito, pausa ao hover
- Mover o carrossel existente do `HeroChat` para este container, ou reestruturar o `HeroChat` para integrar este bloco

### Estrutura visual:
```text
┌─────────────────────────────────────────┐
│  ÚLTIMAS NOTÍCIAS DE HOJE               │
│  bg: gradiente roxo da marca            │
│                                         │
│  [card] [card] [card] [card]  → auto    │
│         dots de navegação               │
└─────────────────────────────────────────┘
```

**Ficheiros**: `src/pages/Index.tsx`, `src/components/news/HeroChat.tsx`, `src/components/news/FeaturedArticle.tsx` (remover uso)

---

## Fase 3: Página de Artigo — Reordenar e Slider de Relacionados

### Nova ordem da página de artigo:
1. Conteúdo do artigo (título, meta, imagem, texto, factos rápidos)
2. Chat IA contextual (já existe)
3. Artigos relacionados em slider horizontal (mover para depois do chat)

### Slider de artigos relacionados
- Substituir grid estático por carrossel horizontal Embla
- 3-4 cards visíveis em desktop, 1-2 em mobile
- Autoplay, loop infinito, animação suave
- Cards com o mesmo tamanho uniforme da Fase 1

**Ficheiros**: `src/pages/ArticlePage.tsx`

---

## Fase 4: Feed Estilo Rede Social + Infinite Scroll

### Já implementado:
- Infinite scroll com IntersectionObserver ✓
- Cards de publicidade intercalados a cada 8 artigos ✓

### Melhorias:
- Aplicar o sistema de cards uniformes (Fase 1)
- Garantir que cards de publicidade têm exactamente as mesmas dimensões

**Ficheiros**: `src/components/news/NewsFeed.tsx`

---

## Fase 5: Sidebar e Navegação

### Sidebar esquerda (já existe)
- Adicionar secção "Trending" abaixo das categorias (usando `useTrendingTopics`)
- Manter fixa durante scroll (já está `sticky`)

### Mobile
- Cards já respondem ao viewport
- Manter botão flutuante de chat IA no artigo

**Ficheiros**: `src/components/layout/DesktopSidebar.tsx`

---

## Fase 6: Sugestões de Artigos no Chat

### Dentro do chat (`InlineChatCarousel`)
- Já existe o mecanismo de inserir carrosseis de artigos a cada 2 interacções
- Garantir que os cards do carrossel inline seguem o mesmo sistema visual uniforme

**Ficheiros**: `src/components/news/InlineChatCarousel.tsx`

---

## Resumo de Ficheiros a Modificar

| Ficheiro | Alteração |
|---|---|
| `src/components/news/NewsCard.tsx` | Cards com altura fixa, tipografia reforçada |
| `src/components/news/SponsoredCard.tsx` | Mesmo tamanho que NewsCard |
| `src/components/news/HeroChat.tsx` | Container com gradiente da marca para o carrossel |
| `src/components/news/FeaturedArticle.tsx` | Remover da página Index |
| `src/pages/Index.tsx` | Remover FeaturedArticle, ajustar layout |
| `src/pages/ArticlePage.tsx` | Reordenar: chat antes de relacionados; slider horizontal |
| `src/components/layout/DesktopSidebar.tsx` | Adicionar trending topics |
| `src/components/news/InlineChatCarousel.tsx` | Uniformizar cards |
| `src/index.css` | Sem grandes mudanças (tipografia já configurada) |

---

## O que NÃO muda
- Backend, Edge Functions, base de dados
- Lógica de chat IA
- Sistema de autenticação admin
- Rotas existentes

