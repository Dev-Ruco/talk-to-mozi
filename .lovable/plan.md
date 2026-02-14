
# Limpar Arquitectura Antiga -- Remover Dependencias do Lovable Cloud

## Resumo

Remover toda a logica de backend antiga (queue management, Edge Function invocations, auto-rewrite) do frontend, mantendo apenas o CRUD de artigos e a leitura de logs. A UI nao e alterada estruturalmente -- apenas se removem as accoes que dependiam das Edge Functions antigas.

## Inventario Completo de Dependencias a Remover

### Edge Function calls (`supabase.functions.invoke`)

| Ficheiro | Funcao | Accao |
|---|---|---|
| `src/admin/hooks/useWorkflowStatus.ts` L113 | `news-agent` | Remover `runAgent` e toda a logica de execucao manual |
| `src/admin/hooks/usePipeline.ts` L130, L182, L286, L304 | `process-queue` (4x) | Remover `addToQueue`, `skipQueue`, `forceRewrite`, `triggerProcessQueue` |
| `src/admin/components/editor/ContentPanel.tsx` L38 | `rewrite-article` | Remover `handleAIAction` e toolbar de IA |
| `src/components/news/ArticleChat.tsx` L61, L106 | `chat` (2x) | Remover chamadas de chat (sugestoes + perguntas) |
| `src/pages/ChatPage.tsx` L122 | `chat` | Remover chamada de chat |
| `src/hooks/useTrendingTopics.ts` L17 | `trending-topics` | Remover invocacao |

### Logica de `rewrite_queue` a remover

| Ficheiro | O que remover |
|---|---|
| `src/admin/hooks/usePipeline.ts` | Query de `rewrite_queue`, realtime subscription de `rewrite_queue`, mutations: `addToQueue`, `skipQueue`, `forceRewrite`, `triggerProcessQueue`, `resetPipeline` (parte que limpa queue), tipos `RewriteQueueItem` |
| `src/admin/components/pipeline/PipelineBoard.tsx` | Props e uso de `addToQueue`, `skipQueue`, `forceRewrite`, `triggerProcessQueue`, `queuedArticles`, `processingArticle`, `processingItem`. Componente `RewritingColumn` |
| `src/admin/components/pipeline/RewritingColumn.tsx` | Ficheiro inteiro pode ser esvaziado das accoes de queue (props `onSkipQueue`, `onForceRewrite`, `onTriggerProcessQueue`) |
| `src/admin/components/pipeline/PipelineCard.tsx` | Props `onSkipQueue`, `onForceRewrite`, `onRewrite` |

### Lovable AI Gateway references (nas Edge Functions)

| Ficheiro | Referencia |
|---|---|
| `supabase/functions/news-agent/index.ts` | `ai.gateway.lovable.dev` |
| `supabase/functions/process-queue/index.ts` | `ai.gateway.lovable.dev` |
| `supabase/functions/rewrite-article/index.ts` | `ai.gateway.lovable.dev` |
| `supabase/functions/chat/index.ts` | `ai.gateway.lovable.dev` (2x) |

Estas Edge Functions estao deployadas no Lovable Cloud e nao no Supabase externo. Nao as podemos apagar (o deploy e automatico), mas podemos remover os ficheiros do codigo para que deixem de ser re-deployadas.

## Plano de Execucao

### 1. `src/admin/hooks/usePipeline.ts` -- Simplificar drasticamente

**Remover:**
- Tipo `RewriteQueueItem`
- Query `rewrite-queue` e todo o realtime de `rewrite_queue`
- Mutations: `addToQueue`, `skipQueue`, `forceRewrite`, `triggerProcessQueue`
- Parte de `resetPipeline` que limpa `rewrite_queue`
- Auto-cleanup destrutivo (que apaga artigos com mais de 12h)

**Manter:**
- Query de `pipeline-articles` (artigos)
- Realtime de `articles`
- `deleteArticles`, `publishArticle`, `unpublishArticle`
- Organizacao por colunas (inbox, pending, published)
- `refetch`

O hook passa a exportar apenas dados e accoes CRUD simples, sem queue management.

### 2. `src/admin/hooks/useWorkflowStatus.ts` -- Remover `runAgent`

**Remover:**
- Funcao `runAgent` (que chama `news-agent`)
- Estado `isRunning` e `isManualRunning`

**Manter:**
- Query de `agent_logs` (leitura de logs)
- Realtime de `agent_logs`
- `computeNodeStatuses` (visualizacao do workflow)
- `nodeStatuses`, `isAgentRunning` (baseado em logs), `lastExecution`, `recentLogs`

### 3. `src/admin/components/editor/ContentPanel.tsx` -- Remover toolbar IA

**Remover:**
- `handleAIAction` e toda a logica de reformulacao
- Botoes "Reformular", "Encurtar", "Tom Jornalistico"
- Estado `isRewriting`, `currentAction`
- Import de `supabase`

**Manter:**
- Todos os campos de edicao (titulo, lead, conteudo, tags, localizacao, factos rapidos)
- A UI do formulario fica intacta, apenas sem os botoes de IA

### 4. `src/admin/components/pipeline/PipelineBoard.tsx` -- Remover RewritingColumn e queue actions

**Remover:**
- Import e uso de `RewritingColumn`
- Destructuring de `addToQueue`, `skipQueue`, `forceRewrite`, `triggerProcessQueue`, `queuedArticles`, `processingArticle`, `processingItem`, `isAddingToQueue`
- Props `onRewrite` nos `PipelineCard` do Inbox e Pendentes
- Botao "Reformular (N)" no bulk actions do Inbox

**Manter:**
- Colunas Inbox, Pendentes, Publicadas (3 colunas em vez de 4)
- Delete, Publish, Unpublish
- Seleccao de artigos e dialogo de confirmacao

### 5. `src/admin/components/pipeline/PipelineCard.tsx` -- Remover props de queue

**Remover:**
- Props: `onRewrite`, `onSkipQueue`, `onForceRewrite`, `isQueued`
- UI correspondente (botao de force rewrite, item "Furar fila" no dropdown)

**Manter:**
- Card visual, publish/unpublish/delete, navegacao para editor

### 6. `src/admin/components/pipeline/RewritingColumn.tsx` -- Simplificar ou remover

Como a coluna "Em Reformulacao" deixa de ter funcao sem o queue, pode ser removida do board. O componente fica no codigo mas sem ser importado (ou removemos o import).

### 7. `src/components/news/ArticleChat.tsx` -- Remover chamadas ao chat

**Remover:**
- Chamadas a `supabase.functions.invoke('chat', ...)`
- Logica de sugestoes e envio de mensagens que dependem da Edge Function

**Manter:**
- Estrutura visual do componente (fica inactivo/placeholder)

### 8. `src/pages/ChatPage.tsx` -- Remover chamada ao chat

**Remover:**
- Chamada a `supabase.functions.invoke('chat', ...)`

### 9. `src/hooks/useTrendingTopics.ts` -- Remover invocacao

**Remover:**
- Chamada a `supabase.functions.invoke('trending-topics')`
- Retornar dados vazios ou fallback estatico

### 10. `src/admin/components/pipeline/WorkflowStrip.tsx` -- Remover botao "Executar Pipeline"

**Remover:**
- Botao que chama `runAgent`
- Import de `runAgent` e `isManualRunning`

**Manter:**
- Visualizacao dos nos do workflow (baseada em logs)
- Badge de estado

### 11. Edge Functions -- NAO apagar ficheiros

As Edge Functions (`news-agent`, `process-queue`, `rewrite-article`, `chat`, `trending-topics`) estao no Lovable Cloud e sao deployadas automaticamente. Apagar os ficheiros impediria o re-deploy, mas como queremos migrar para o Supabase externo, **mantemos os ficheiros por agora** para nao quebrar nada. Serao substituidos quando a nova arquitectura (Supabase externo + OpenAI) estiver pronta.

## Ficheiros a Modificar

| Ficheiro | Tipo de alteracao |
|---|---|
| `src/admin/hooks/usePipeline.ts` | Remover queue logic, manter CRUD |
| `src/admin/hooks/useWorkflowStatus.ts` | Remover `runAgent` |
| `src/admin/components/editor/ContentPanel.tsx` | Remover toolbar IA |
| `src/admin/components/pipeline/PipelineBoard.tsx` | Remover RewritingColumn e queue actions |
| `src/admin/components/pipeline/PipelineCard.tsx` | Remover props de queue |
| `src/admin/components/pipeline/WorkflowStrip.tsx` | Remover botao executar |
| `src/components/news/ArticleChat.tsx` | Desactivar chamadas chat |
| `src/pages/ChatPage.tsx` | Desactivar chamada chat |
| `src/hooks/useTrendingTopics.ts` | Retornar fallback estatico |

## Funcoes/Exports Removidos

- `addToQueue`, `skipQueue`, `forceRewrite`, `triggerProcessQueue` (usePipeline)
- `RewriteQueueItem` tipo (usePipeline)
- `runAgent`, `isManualRunning` (useWorkflowStatus)
- `handleAIAction` (ContentPanel)
- Todas as chamadas `supabase.functions.invoke()`

## Resultado

- Zero chamadas a Edge Functions do Lovable Cloud
- Zero dependencia de `rewrite_queue`
- Zero logica de auto-rewrite ou queue management
- Frontend funciona apenas com CRUD directo em `articles` via `supabase` client (que aponta para `cmxh...`)
- Logs continuam visiveis (leitura de `agent_logs`)
- UI mantida (3 colunas: Inbox, Pendentes, Publicadas)
- Pronto para reconstruir: Frontend -> Supabase externo -> Edge Functions (cmxh) -> OpenAI
