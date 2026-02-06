
# Correção: Automação da Fila de Reformulação + Forçar Reformulação

## Diagnóstico do Problema

### Problema Actual
1. O **contador de tempo** (`0:45`, `1:30`, etc.) na coluna "Em Reformulação" é **apenas visual** — não dispara nenhuma acção
2. Quando o tempo chega a zero, ele simplesmente reinicia o contador sem processar os artigos
3. Não existe nenhum cron job configurado para chamar automaticamente o `process-queue`
4. A reformulação só acontece quando alguém clica manualmente ou adiciona um artigo à fila

### Causa Raiz
- A Edge Function `process-queue` só é chamada **manualmente** (quando utilizador adiciona artigo à fila)
- Não há automação do lado do servidor (pg_cron) para processar a fila periodicamente
- O countdown do UI não está ligado a nenhuma acção real

---

## Solução Completa

### Parte 1: Cron Jobs (Processamento Automático Sempre)

Criar dois cron jobs no Supabase usando `pg_cron` + `pg_net`:

| Cron Job | Função | Intervalo |
|----------|--------|-----------|
| `process-rewrite-queue` | Chama `process-queue` | A cada 2 minutos |
| `news-agent-capture` | Chama `news-agent` (captura RSS) | A cada 5 minutos |

**SQL para configurar:**
```sql
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Cron job para processar fila de reformulação (a cada 2 minutos)
SELECT cron.schedule(
  'process-rewrite-queue',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://kwwzfhpamciilgmknsov.supabase.co/functions/v1/process-queue',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}',
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

---

### Parte 2: Botão "Forçar Reformulação" + Trigger Imediato

#### 2.1 Modificar `PipelineCard.tsx`
Adicionar prop `onForceRewrite` e botão visível para artigos na fila:

```tsx
// Novo botão na secção de acções (para artigos na fila)
{isQueued && !isProcessing && onForceRewrite && (
  <Button
    size="icon"
    variant="ghost"
    onClick={(e) => { e.stopPropagation(); onForceRewrite(); }}
    className="h-7 w-7 text-primary hover:bg-primary/20"
    title="Forçar reformulação agora"
  >
    <Zap className="h-4 w-4" />
  </Button>
)}
```

#### 2.2 Nova função `forceRewrite` no `usePipeline.ts`
Esta função move o artigo para o topo da fila com prioridade máxima e **dispara imediatamente** o `process-queue`:

```tsx
const forceRewrite = useMutation({
  mutationFn: async (articleId: string) => {
    // 1. Definir prioridade muito alta (9999)
    const { data: existing } = await supabase
      .from('rewrite_queue')
      .select('id')
      .eq('article_id', articleId)
      .in('status', ['queued', 'processing'])
      .single();

    if (existing) {
      await supabase
        .from('rewrite_queue')
        .update({ priority: 9999 })
        .eq('id', existing.id);
    }

    // 2. Verificar se algo está a processar
    const { data: processing } = await supabase
      .from('rewrite_queue')
      .select('id')
      .eq('status', 'processing')
      .limit(1);

    // 3. Se ninguém está a processar, disparar imediatamente
    if (!processing || processing.length === 0) {
      await supabase.functions.invoke('process-queue', {
        body: { article_id: articleId }
      });
    }
    // Se estiver ocupado, o artigo fica no topo e será o próximo
  },
  onSuccess: () => {
    toast.success('Reformulação iniciada');
    refetchQueue();
  },
});
```

#### 2.3 Modificar `RewritingColumn.tsx`
- Passar a nova função `onForceRewrite` para os cards
- Quando countdown chega a 0, **disparar o process-queue** (backup para quando dashboard está aberto)

```tsx
// Effect para countdown COM trigger automático
useEffect(() => {
  if (!processingArticle && queuedItems.length > 0 && agentSettings) {
    const intervalMinutes = parseInt(agentSettings.rewrite_interval_minutes) || 2;
    const intervalSeconds = intervalMinutes * 60;
    
    setCountdown(intervalSeconds);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // DISPARAR REFORMULAÇÃO quando chegar a zero!
          triggerProcessQueue();
          return intervalSeconds; // Reiniciar contador
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }
}, [processingArticle, queuedItems.length, agentSettings]);

// Função para disparar edge function
const triggerProcessQueue = async () => {
  try {
    await supabase.functions.invoke('process-queue');
  } catch (e) {
    console.log('Cron job will handle this');
  }
};
```

---

### Parte 3: UI Melhorada para Cards na Fila

Cada card na fila terá:
1. **Posição na fila** (número)
2. **Botão de forçar** (ícone Zap/relâmpago)
3. **Menu dropdown** com opções

```text
┌────────────────────────────────────────────────────────────────┐
│ 1   Título do artigo que está na fila...        [⚡] [...]     │
│     Jornal Notícias | Alta | Nacional                          │
│     ⏱️ há aproximadamente 18 horas                             │
└────────────────────────────────────────────────────────────────┘
```

---

## Ficheiros a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| `src/admin/components/pipeline/RewritingColumn.tsx` | Adicionar trigger automático quando countdown=0; passar `onForceRewrite` para cards |
| `src/admin/components/pipeline/PipelineCard.tsx` | Adicionar botão `[⚡]` para forçar reformulação; nova prop `onForceRewrite` |
| `src/admin/hooks/usePipeline.ts` | Adicionar mutation `forceRewrite` que dispara imediatamente |
| `src/admin/components/pipeline/PipelineBoard.tsx` | Passar `onForceRewrite` para RewritingColumn |
| **SQL (pg_cron)** | Configurar cron jobs para automação 24/7 |

---

## Fluxo Final

```text
┌─────────────────────────────────────────────────────────────────────┐
│                      AUTOMAÇÃO COMPLETA                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  pg_cron (a cada 2 minutos) ────────────────────┐                   │
│                                                  │                   │
│  Dashboard aberto (countdown=0) ────────────────┼──► process-queue  │
│                                                  │                   │
│  Botão "Forçar reformulação" ───────────────────┘        │          │
│                                                          │          │
│                                                          ▼          │
│                                                 ┌────────────────┐  │
│                                                 │ Próximo artigo │  │
│                                                 │ da fila (maior │  │
│                                                 │ prioridade)    │  │
│                                                 └────────────────┘  │
│                                                          │          │
│                                                          ▼          │
│                                                 ┌────────────────┐  │
│                                                 │ Reformulação   │  │
│                                                 │ com IA         │  │
│                                                 └────────────────┘  │
│                                                          │          │
│                                                          ▼          │
│                                                 ┌────────────────┐  │
│                                                 │ status =       │  │
│                                                 │ 'rewritten'    │  │
│                                                 └────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Checklist de Validação

- [ ] Cron jobs configurados com pg_cron
- [ ] Quando countdown chega a 0, dispara process-queue automaticamente
- [ ] Botão "⚡" visível em cada artigo na fila
- [ ] Clicar em "⚡" inicia reformulação imediatamente (se agente livre)
- [ ] Clicar em "⚡" move para topo da fila (se agente ocupado)
- [ ] Artigos passam de "Em Reformulação" para "Pendentes" após reformulação
- [ ] Sistema funciona 24/7 mesmo com dashboard fechado
