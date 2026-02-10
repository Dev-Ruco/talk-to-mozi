
# Bloco "Noticia em Destaque do Dia"

## O que muda

Um novo componente inserido na homepage entre o carrossel e o feed. Nenhum componente existente e alterado.

## Como funciona

- Busca o artigo publicado mais recente com `highlight_type = 'hero'` (ja existe no backoffice como "Manchete")
- Se nao houver nenhum artigo marcado como Manchete, o bloco nao aparece (nao ocupa espaco)
- Ao clicar, navega para `/artigo/{id}#chat` (activa o chat de IA automaticamente)

## Estrutura visual

```text
         Em destaque hoje
+------------------------------------------+
|  +----------+                             |
|  |          |  Titulo editorial claro     |
|  |  IMAGEM  |  Linha breve de contexto    |
|  |          |                             |
|  +----------+  [Explorar com IA]          |
+------------------------------------------+
```

No mobile, o card empilha verticalmente (imagem em cima, texto em baixo).

## Seleccao editorial

O editor ja pode escolher "Manchete" no campo "Destaque" do painel de publicacao (`PublishPanel.tsx`, linha 268). Nao e necessario criar nenhum campo novo. Para mudar a noticia em destaque, basta alterar qual artigo tem `highlight_type = 'hero'`.

## Ficheiros

| Ficheiro | Accao |
|----------|-------|
| `src/components/news/FeaturedArticle.tsx` | **Novo** - Componente do bloco |
| `src/hooks/useFeaturedArticle.ts` | **Novo** - Hook para buscar artigo com highlight_type='hero' |
| `src/pages/Index.tsx` | Inserir o componente entre HeroChat e o separador |

## Seccao Tecnica

### Hook: `useFeaturedArticle.ts`

```typescript
// Busca o artigo publicado mais recente com highlight_type = 'hero'
const { data, error } = await supabase
  .from('articles')
  .select('*')
  .eq('status', 'published')
  .eq('highlight_type', 'hero')
  .order('published_at', { ascending: false })
  .limit(1)
  .maybeSingle();
```

Usa `useQuery` com key `['featured-article']`. Retorna `null` se nao houver artigo marcado.

### Componente: `FeaturedArticle.tsx`

- Se `data` for `null` ou loading, retorna `null` (sem espaco no layout)
- Card horizontal: `flex flex-col md:flex-row` com `rounded-xl border bg-card`
- Imagem com `aspect-video md:w-2/5` e `object-cover`
- Titulo com `font-display text-xl font-semibold`
- Contexto com `text-sm text-muted-foreground line-clamp-2` usando o campo `lead`
- Botao "Explorar com IA" com icone `MessageCircle`, variante `default` (roxo da marca)
- Label "Em destaque hoje" como `text-xs font-medium uppercase tracking-wider text-muted-foreground` acima do card
- `onClick` navega para `/artigo/{id}#chat`

### Index.tsx

Inserir entre `<HeroChat />` e o separador `<div className="border-t">`:
```tsx
<FeaturedArticle />
```

Nenhuma outra alteracao na pagina.
