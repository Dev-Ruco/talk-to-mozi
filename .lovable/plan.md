

# Barra de Progresso Real + Datas em Todos os Cards

## Problema 1: Coluna "Em Reformulacao" nao funciona correctamente

O progresso actual e 100% simulado no browser (incrementa sozinho ate 95% e reinicia ao recarregar). O countdown tambem reinicia ao recarregar e nunca chega a processar nada de verdade. Os artigos ficam eternamente "queued" sem nunca passarem a "processing".

**Causa raiz**: O countdown do frontend tenta chamar `process-queue` quando chega a zero, mas como reinicia ao recarregar a pagina, nunca funciona de forma fiavel. O progresso nao esta ligado a nenhum dado real da base de dados.

## Problema 2: Datas so aparecem no carrossel

Os cards de noticias no feed (variante `default`), na sidebar (`sidebar`) e no FeaturedArticle nao mostram ha quanto tempo foram publicados.

---

## Solucao

### Parte 1: Barra de progresso real na RewritingColumn

Substituir a logica simulada por progresso baseado no estado real da `rewrite_queue`:

- **Sem `started_at`** (status `queued`): barra a 0%, texto "Na fila"
- **Com `started_at` mas sem `completed_at`** (status `processing`): barra animada com efeito de preenchimento gradual baseado no tempo decorrido (estimativa de 60s), mostrando o titulo do artigo em processamento
- **Com `completed_at`** (status `completed`): barra a 100%

A barra persiste entre recarregamentos porque le o `started_at` real da base de dados.

Remover o countdown falso. Manter apenas a indicacao de quantos artigos estao na fila.

**Ficheiro: `src/admin/components/pipeline/RewritingColumn.tsx`**

- Remover o `useState` de `progress`, `countdown`, `elapsedTime`, `isTriggering`
- Remover os 3 `useEffect` que simulam progresso e countdown
- Calcular o progresso real a partir do `processingItem.started_at` (estimativa: 0-100% em ~90 segundos, baseado no tempo medio de processamento da IA)
- Mostrar o titulo do artigo em processamento acima da barra
- Usar um `useEffect` com `setInterval` de 1s que calcula `Math.min(95, (elapsed / estimatedDuration) * 100)` -- nunca ultrapassa 95% ate o status mudar para `completed` via realtime
- Quando o realtime detecta `completed`, a barra salta para 100% e depois limpa

```text
+----------------------------------------------+
|  A REFORMULAR AGORA                          |
|  "Titulo do artigo em processamento..."      |
|  [=============================-------] 72%  |
|  Reformulando com IA... | 1:05 decorrido     |
+----------------------------------------------+
```

### Parte 2: Datas em todos os cards de noticias

**Ficheiro: `src/components/news/NewsCard.tsx`**

Adicionar tempo relativo + data em todas as variantes:

- **Variante `default`**: Adicionar `{timeAgo} · {formattedDate}` na zona de categoria/tempo (linha 169-183), junto ao badge de categoria
- **Variante `sidebar`**: Adicionar `{timeAgo}` abaixo do badge de categoria
- **Variante `compact`**: Ja tem `timeAgo` -- adicionar a data formatada ao lado

Formato: "Ha 2h · 11 Fev 2026" ou "Agora · 11 Fev 2026"

**Ficheiro: `src/components/news/FeaturedArticle.tsx`**

Adicionar tempo relativo + data abaixo do titulo, antes do summary.

---

## Ficheiros a Modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/admin/components/pipeline/RewritingColumn.tsx` | Remover logica simulada, calcular progresso real a partir de `started_at`, mostrar titulo do artigo |
| `src/components/news/NewsCard.tsx` | Adicionar `timeAgo + data` nas variantes `default` e `sidebar` |
| `src/components/news/FeaturedArticle.tsx` | Adicionar `timeAgo + data` abaixo do titulo |

---

## Seccao Tecnica

### RewritingColumn - Progresso real

```typescript
// Calcular progresso baseado no tempo real decorrido
const ESTIMATED_DURATION_SECONDS = 90; // Estimativa de 90s para reformulacao

const [realProgress, setRealProgress] = useState(0);

useEffect(() => {
  if (!processingItem?.started_at) {
    setRealProgress(0);
    return;
  }
  
  const updateProgress = () => {
    const startTime = new Date(processingItem.started_at!).getTime();
    const elapsed = (Date.now() - startTime) / 1000;
    const pct = Math.min(95, (elapsed / ESTIMATED_DURATION_SECONDS) * 100);
    setRealProgress(pct);
  };
  
  updateProgress();
  const interval = setInterval(updateProgress, 1000);
  return () => clearInterval(interval);
}, [processingItem?.started_at]);

// Quando o status muda para completed (via realtime), saltar para 100%
useEffect(() => {
  if (!processingItem) {
    // Se nao ha item em processing, e porque completou
    setRealProgress(prev => prev > 0 ? 100 : 0);
  }
}, [processingItem]);
```

### NewsCard - Tempo relativo + data em todas as variantes

```typescript
const formattedDate = new Date(article.publishedAt).toLocaleDateString('pt-MZ', {
  day: 'numeric', month: 'short', year: 'numeric'
});

// Na variante default, junto ao badge de categoria:
<span className="text-xs text-muted-foreground">
  {timeAgo} · {formattedDate}
</span>

// Na variante sidebar, abaixo do badge:
<span className="text-[10px] text-muted-foreground mt-1">
  {timeAgo} · {formattedDate}
</span>
```

### FeaturedArticle - Tempo relativo

```typescript
// Abaixo do titulo:
<p className="text-xs text-muted-foreground">
  {getTimeAgo(article.published_at)} · {new Date(article.published_at).toLocaleDateString('pt-MZ', { day: 'numeric', month: 'short', year: 'numeric' })}
</p>
```

