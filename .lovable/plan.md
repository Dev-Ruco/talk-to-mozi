
# Expandir Carousel e Melhorar Proporções dos Cards

## Problema Identificado

Olhando para o screenshot:
- O carousel está limitado a `max-w-2xl` (672px) no container do Hero
- Os cards têm altura fixa de `h-48` (192px) com proporção quase quadrada
- Há muito espaço vazio à direita que não está a ser aproveitado
- A sidebar esquerda tem `w-56` (224px)

## Cálculo do Espaço Disponível

```text
Container max: 1400px (definido no tailwind)
Sidebar: 224px
Gap: 24px
────────────────
Espaço para conteúdo: ~1152px

Actualmente usado: 672px (max-w-2xl)
Espaço desperdiçado: ~480px
```

## Solução Proposta

### 1. Expandir o Container do Hero

**Antes:** `max-w-2xl` (672px)
**Depois:** `max-w-5xl` (1024px) ou `max-w-4xl` (896px)

Isto permite que o carousel ocupe mais espaço horizontal, com cards mais rectangulares.

### 2. Ajustar Proporção dos Cards

**Antes:** `h-48` (192px) - cards mais quadrados
**Depois:** `h-44` ou `h-40` (176px/160px) - cards mais rectangulares/panorâmicos

Com 3 cards mais largos e ligeiramente menos altos, obtemos um visual mais cinematográfico.

### 3. Manter Centralização do Título e Input

O título e o campo de pesquisa mantêm-se com `max-w-2xl` para boa legibilidade, apenas o carousel expande:

```text
┌─────────────────────────────────────────────────────────┐
│                                                          │
│        O que aconteceu hoje em Moçambique?              │ ← max-w-2xl (centrado)
│        [  Campo de pesquisa               ]             │ ← max-w-2xl (centrado)
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │  Card 1  │ │  Card 2  │ │  Card 3  │                 │ ← max-w-5xl (expandido)
│  │ (16:10)  │ │ (16:10)  │ │ (16:10)  │                 │
│  └──────────┘ └──────────┘ └──────────┘                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Alterações Técnicas

### Ficheiro: `src/components/news/HeroChat.tsx`

**Linha 54-55 - Container principal:**
```tsx
// Antes:
<motion.div className="w-full max-w-2xl space-y-8 text-center">

// Depois:
<motion.div className="w-full max-w-5xl space-y-8 text-center">
```

**Linha 62-70 - Título (manter centrado):**
```tsx
// Adicionar wrapper com max-w-2xl para título:
<div className="mx-auto max-w-2xl space-y-3">
  <motion.h1>...</motion.h1>
</div>
```

**Linha 74-132 - Form (manter centrado):**
```tsx
// Adicionar wrapper com max-w-2xl para form:
<motion.form className="mx-auto max-w-2xl space-y-4">
```

**Linha 163 - Altura dos cards:**
```tsx
// Antes:
className="group relative block h-48 w-full overflow-hidden rounded-xl"

// Depois:
className="group relative block h-40 w-full overflow-hidden rounded-xl"
```

**Linha 143-147 - Skeletons:**
```tsx
// Ajustar altura dos skeletons para h-40
<Skeleton className="h-40 w-full shrink-0 rounded-xl md:w-1/2 lg:w-1/3" />
```

**Linha 189 - Sponsored card:**
```tsx
// Antes:
<div className="h-48">

// Depois:
<div className="h-40">
```

---

## Resultado Visual Esperado

### Antes
```text
Sidebar │        ┌────────────────────┐      │ Espaço vazio
   │    │        │  max-w-2xl (672px) │      │
   │    │        │  [■■] [■■] [■■]    │      │  ← Cards quadrados
   │    │        └────────────────────┘      │
```

### Depois
```text
Sidebar │  ┌─────────────────────────────────────────┐  │
   │    │  │         max-w-5xl (1024px)              │  │
   │    │  │   [━━━━━━] [━━━━━━] [━━━━━━]            │  │  ← Cards rectangulares
   │    │  └─────────────────────────────────────────┘  │
```

---

## Ficheiros a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| `src/components/news/HeroChat.tsx` | Expandir container, ajustar alturas |

---

## Proporções Finais

| Elemento | Antes | Depois |
|----------|-------|--------|
| Container Hero | max-w-2xl (672px) | max-w-5xl (1024px) |
| Título/Input | max-w-2xl | max-w-2xl (mantém) |
| Altura cards | h-48 (192px) | h-40 (160px) |
| Proporção card | ~1:1 (quadrado) | ~16:10 (rectangular) |

Os cards ficam mais cinematográficos e ocupam melhor o espaço disponível, mantendo a harmonia com o título e campo de pesquisa centralizados.
