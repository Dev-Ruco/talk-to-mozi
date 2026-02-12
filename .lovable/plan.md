
# Workflow Visual no Pipeline Existente

## Principio: Zero Redundancia

Nao criar tabelas novas, paginas novas, nem edge functions novas. Tudo ja existe -- falta apenas VISUALIZAR o fluxo de trabalho sobre o pipeline actual.

## O que ja existe e NAO deve ser duplicado

| Elemento | Onde esta | Accao |
|----------|-----------|-------|
| Configuracoes do agente (intervalos, threshold, auto-rewrite) | SettingsPage > Tab "Agente IA" | Manter como esta |
| Tabela `agent_settings` | Base de dados | Reutilizar |
| Tabela `agent_logs` | Base de dados (ja rastreia cada passo) | Reutilizar para animar workflow |
| Edge Function `news-agent` | Backend | Manter |
| Edge Function `process-queue` | Backend | Manter |
| Realtime em `articles` e `rewrite_queue` | usePipeline hook | Manter |
| Logs detalhados com JSON | AgentPage | Mover para dentro do Pipeline |

## O que muda

### 1. Pipeline Page -- Adicionar barra de workflow animada no topo

Acima do Kanban board, inserir uma faixa horizontal com os passos do agente, alimentada em tempo real pelos `agent_logs`:

```text
+----------------------------------------------------------------------+
|  [Executar Pipeline]              Estado: Activo | Ultima: Ha 3 min  |
+----------------------------------------------------------------------+
|                                                                      |
|  ( RSS )---->( Normalizar )---->( IA Reform. )---->( Validar )---->( Pendentes )
|   [OK]         [OK]              [A processar]      [espera]       [espera]
|                                                                      |
+----------------------------------------------------------------------+
|                                                                      |
|  [  INBOX  ] [ EM REFORMULACAO ] [  PENDENTES  ] [  PUBLICADAS  ]   |
|  (kanban board actual, sem alteracoes)                               |
+----------------------------------------------------------------------+
```

**Como funciona:**
- Subscrever `agent_logs` via Supabase Realtime (ja existe no AgentPage -- mover logica)
- Mapear cada `action` do log a um no do workflow:
  - `agent_start` / `fetch_start` / `fetch_complete` -> No "RSS Fetch"
  - `parse_rss` / `duplicate_check` -> No "Normalizar"
  - `ai_auto_rewrite` / `ai_auto_complete` -> No "IA Reformulacao"
  - `article_save` -> No "Validar"
  - `source_complete` / `agent_complete` -> No "Pendentes"
- Cada no mostra estado: `idle` (cinza), `running` (azul pulsante), `success` (verde), `error` (vermelho)
- Framer Motion para transicoes suaves entre estados

**Ficheiro: `src/admin/components/pipeline/WorkflowStrip.tsx`** (novo componente)

- Componente simples: uma linha horizontal de 5 circulos/cards conectados por linhas
- Recebe `latestLogs` como prop (ultimos logs do agente) e determina o estado de cada no
- Inclui botao "Executar Pipeline" que invoca `news-agent` (mover do AgentPage)
- Mostra ultima execucao e estado do agente (mover do AgentPage)

### 2. Pipeline Page -- Integrar logs resumidos

Abaixo do workflow strip (ou em collapsible), mostrar os ultimos 10-15 logs do agente em formato compacto (uma linha por log, sem JSON expandido). Quem quiser detalhes vai ao AgentPage.

**Ficheiro: `src/admin/components/pipeline/WorkflowLogs.tsx`** (novo componente)

- Collapsible: "Logs do agente (12)" -- expande para mostrar logs recentes
- Formato: `[HH:MM:SS] [accao] mensagem...`
- Realtime: novos logs aparecem com animacao fade-in
- Reutiliza a subscricao de `agent_logs` do WorkflowStrip

### 3. AgentPage -- Simplificar (apenas logs completos)

Remover os controlos duplicados (agente activo, frequencia) que ja existem em Settings. Manter apenas:
- Titulo "Logs do Agente IA"
- Estatisticas 24h (ja existem)
- Lista completa de logs com JSON expandivel (ja existe)
- Link para Settings: "Configurar agente"

### 4. Pipeline Page -- Hook de workflow

**Ficheiro: `src/admin/hooks/useWorkflowStatus.ts`** (novo hook)

- Busca os ultimos logs via `useQuery` (nao precisa de nova tabela)
- Subscreve `agent_logs` via Realtime para updates instantaneos
- Calcula o estado de cada no do workflow a partir dos logs
- Expoe: `nodeStatuses`, `isAgentRunning`, `lastExecution`, `recentLogs`, `runAgent()`

### 5. PipelinePage -- Integrar tudo

**Ficheiro: `src/admin/pages/PipelinePage.tsx`** (modificar)

- Importar `WorkflowStrip` e `WorkflowLogs`
- Colocar acima do `PipelineBoard`
- Remover o botao "Reiniciar Pipeline" do header (mover para dentro do workflow strip como accao secundaria)

## Ficheiros a Criar

| Ficheiro | Descricao |
|----------|-----------|
| `src/admin/components/pipeline/WorkflowStrip.tsx` | Barra visual de 5 nos com estado animado |
| `src/admin/components/pipeline/WorkflowLogs.tsx` | Lista compacta de logs recentes (collapsible) |
| `src/admin/hooks/useWorkflowStatus.ts` | Hook que le `agent_logs` com realtime e calcula estados |

## Ficheiros a Modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/admin/pages/PipelinePage.tsx` | Adicionar WorkflowStrip + WorkflowLogs acima do PipelineBoard |
| `src/admin/pages/AgentPage.tsx` | Remover controlos duplicados, manter apenas logs completos |

## Zero tabelas novas, Zero edge functions novas

Tudo funciona com a infraestrutura existente:
- `agent_logs` -> alimenta o workflow visual
- `agent_settings` -> configuracoes (em Settings)
- `rewrite_queue` -> alimenta a coluna "Em Reformulacao" (ja funciona)
- `news-agent` -> execucao do pipeline (ja funciona)
- `process-queue` -> reformulacao (ja funciona)

## Seccao Tecnica

### useWorkflowStatus -- Mapear logs a nos

```typescript
type NodeStatus = 'idle' | 'running' | 'success' | 'error';

const WORKFLOW_NODES = [
  { id: 'fetch', label: 'RSS Fetch', icon: Rss, actions: ['agent_start', 'fetch_start', 'fetch_complete'] },
  { id: 'normalize', label: 'Normalizar', icon: Filter, actions: ['parse_rss', 'duplicate_check'] },
  { id: 'rewrite', label: 'IA Reformulação', icon: Bot, actions: ['ai_auto_rewrite', 'ai_auto_complete', 'ai_auto_error'] },
  { id: 'validate', label: 'Validar', icon: CheckCircle, actions: ['article_save'] },
  { id: 'complete', label: 'Concluído', icon: Flag, actions: ['source_complete', 'agent_complete'] },
];

// Determinar estado de cada no baseado nos logs da ultima execucao:
// 1. Encontrar o ultimo 'agent_start' nos logs
// 2. Filtrar logs desde esse ponto
// 3. Para cada no, verificar se tem logs com status 'error', 'success' ou 'info'(running)
```

### WorkflowStrip -- Animacao Framer Motion

```typescript
// No activo pulsa
<motion.div
  animate={status === 'running' ? { 
    scale: [1, 1.05, 1],
    boxShadow: ['0 0 0 0 rgba(var(--primary), 0)', '0 0 0 8px rgba(var(--primary), 0.2)', '0 0 0 0 rgba(var(--primary), 0)']
  } : {}}
  transition={{ repeat: Infinity, duration: 1.5 }}
/>

// Linha de conexao entre nos
<div className={cn(
  'h-0.5 flex-1 transition-colors duration-500',
  leftNodeDone ? 'bg-green-500' : 'bg-muted'
)} />
```

### Executar Pipeline (botao no WorkflowStrip)

```typescript
const runAgent = async () => {
  setIsRunning(true);
  const { data, error } = await supabase.functions.invoke('news-agent');
  if (error) toast.error('Erro ao executar agente');
  else toast.success(`${data.articles_saved} artigos processados`);
  setIsRunning(false);
};
```
