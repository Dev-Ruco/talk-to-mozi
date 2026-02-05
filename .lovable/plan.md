
# Redesenho Visual do Layout - Feed Estilo Facebook

## Resumo das Alterações

Implementar 4 alterações visuais principais para criar um layout mais amplo e profissional:

1. **Expandir área de conteúdo** - Remover sidebar direita para dar mais espaço
2. **Carousel com 3 cards** - Mostrar 3 notícias no Hero em vez de 2
3. **Fundo cinza claro** - Área de trabalho com cinza suave, cards mantêm branco
4. **Preparar espaço para publicidade futura** - Remover secção "Tendências"

---

## Alterações Técnicas

### 1. Layout Principal (`src/components/layout/Layout.tsx`)

**Antes:**
```
┌──────────────────────────────────────────────────────────┐
│ Header                                                    │
├──────────┬────────────────────────────────┬──────────────┤
│ Sidebar  │         Conteúdo               │  Tendências  │
│ Esquerda │       (max 600px)              │   (w-72)     │
│ (w-56)   │                                │              │
└──────────┴────────────────────────────────┴──────────────┘
```

**Depois:**
```
┌──────────────────────────────────────────────────────────┐
│ Header                                                    │
├──────────┬───────────────────────────────────────────────┤
│ Sidebar  │              Conteúdo Expandido               │
│ Esquerda │                                               │
│ (w-56)   │   (mais espaço para cards e publicidade)      │
└──────────┴───────────────────────────────────────────────┘
```

**Alterações:**
- Remover `<RightSidebar />` e todo o código associado (estado, scroll listener)
- Simplificar estrutura do container
- Manter apenas sidebar esquerda de categorias

---

### 2. Carousel do Hero (`src/components/news/HeroChat.tsx`)

**Antes:** `basis-full md:basis-1/2 lg:basis-1/2` (2 cards visíveis)

**Depois:** `basis-full md:basis-1/2 lg:basis-1/3` (3 cards visíveis em desktop)

**Alterações na linha 158:**
```tsx
// Antes:
<CarouselItem key={index} className="basis-full md:basis-1/2 lg:basis-1/2">

// Depois:
<CarouselItem key={index} className="basis-full md:basis-1/2 lg:basis-1/3">
```

Também ajustar o skeleton de loading para reflectir 3 cards.

---

### 3. Cores de Fundo (`src/index.css`)

**Nova variável CSS:**
```css
:root {
  --background: 220 14% 96%;    /* Cinza azulado muito claro (estilo Facebook) */
  --card: 0 0% 100%;            /* Mantém branco puro */
}
```

**Valores HSL:**
- Background actual: `0 0% 100%` (branco puro)
- Background novo: `220 14% 96%` (cinza muito suave com tom frio)
- Card: `0 0% 100%` (mantém branco)

---

### 4. Feed de Notícias (`src/components/news/NewsFeed.tsx`)

**Antes:** `max-w-[600px]`

**Depois:** `max-w-[700px]` ou `max-w-2xl` para aproveitar o espaço extra.

---

## Ficheiros a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| `src/components/layout/Layout.tsx` | Remover RightSidebar, simplificar layout |
| `src/components/news/HeroChat.tsx` | Carousel com `lg:basis-1/3` para 3 cards |
| `src/index.css` | Alterar `--background` para cinza claro |
| `src/components/news/NewsFeed.tsx` | Aumentar `max-w` para aproveitar espaço |

---

## Comparação Visual

### Antes
```text
┌─────────────────────────────────────────────────────────────────┐
│ Fundo: Branco                                                    │
│ ┌────────┐ ┌──────────────────────┐ ┌─────────────┐             │
│ │Sidebar │ │   Conteúdo           │ │ Tendências  │             │
│ │        │ │   max-w-600px        │ │ w-72        │             │
│ │        │ │                      │ │             │             │
│ │        │ │   [Card branco]      │ │ [trends]    │             │
│ └────────┘ └──────────────────────┘ └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### Depois
```text
┌─────────────────────────────────────────────────────────────────┐
│ Fundo: Cinza claro (#f4f4f5 ou similar)                          │
│ ┌────────┐ ┌──────────────────────────────────────────┐         │
│ │Sidebar │ │         Conteúdo Expandido               │         │
│ │        │ │         max-w-700px                      │         │
│ │        │ │                                          │         │
│ │        │ │    ┌────────────────────────────┐        │         │
│ │        │ │    │    Card branco (destaca!)  │        │         │
│ │        │ │    └────────────────────────────┘        │         │
│ └────────┘ └──────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Considerações

### Publicidade Futura
Com a remoção da sidebar de Tendências:
- **Espaço libertado** pode ser usado para banners de publicidade
- **Eventos** podem aparecer como cards especiais no feed
- O feed fica mais limpo e focado

### Contraste Visual
- Cards brancos destacam-se melhor sobre fundo cinza
- Cria profundidade visual sem poluir o design
- Similar à experiência Facebook/LinkedIn

### Responsividade
- No mobile, nada muda (já não mostrava sidebar)
- No tablet (md), 2 cards no carousel
- No desktop (lg+), 3 cards no carousel
