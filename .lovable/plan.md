
# Redesenho do Pipeline Editorial Visual

## Análise do Sistema Actual

### Arquitectura Actual (Fragmentada)
O sistema actual tem 6 páginas separadas no sidebar:
- **Inbox** → Status `captured` + `rewritten`
- **Pendentes** → Status `pending`
- **Em Edição** → Status `approved` + `needs_image`
- **Agendadas** → Status `scheduled`
- **Publicadas** → Status `published`
- **Agente IA** → Página separada com logs

**Problemas identificados:**
1. Não existe visualização em tempo real do processamento da IA
2. O utilizador não consegue ver artigos a serem reformulados
3. A transição entre estados não é visível
4. Logs da IA estão numa página separada (desconectados do fluxo)
5. 23 artigos presos em `captured` sem reformulação automática

### Estados Disponíveis na Base de Dados
```text
captured    → Captado (ainda não reformulado)
rewritten   → Reformulado pela IA
pending     → Pendente de revisão humana
approved    → Aprovado para edição
needs_image → Falta imagem
scheduled   → Agendado
published   → Publicado
rejected    → Rejeitado
```

---

## Nova Arquitectura Proposta

### Vista Kanban Unificada

Criar uma página principal **Pipeline** (`/admin/pipeline`) que mostra 4 colunas em tempo real:

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           PIPELINE EDITORIAL                                      │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────────────┤
│                 │                 │                 │                             │
│     INBOX       │  REFORMULAÇÃO   │   PENDENTES     │        PUBLICADAS           │
│  (captured)     │  (rewriting)    │ (rewritten +    │       (published)           │
│                 │                 │  pending)       │                             │
│  ┌───────────┐  │  ┌───────────┐  │  ┌───────────┐  │  ┌───────────────────────┐  │
│  │ Artigo 1  │  │  │ Artigo X  │  │  │ Artigo A  │  │  │ Artigo Pub 1          │  │
│  │ Artigo 2  │  │  │  ⏳ 45%   │  │  │ Artigo B  │  │  │ Artigo Pub 2          │  │
│  │ Artigo 3  │──►│  │ A reformu-│──►│  │ Artigo C  │──►│ Artigo Pub 3          │  │
│  │ Artigo 4  │  │  │   lar...  │  │  │           │  │  │                       │  │
│  │           │  │  ├───────────┤  │  │           │  │  │                       │  │
│  │           │  │  │ FILA:     │  │  │           │  │  │                       │  │
│  │           │  │  │ Art. Y    │  │  │           │  │  │                       │  │
│  │           │  │  │ Art. Z    │  │  │           │  │  │                       │  │
│  └───────────┘  │  └───────────┘  │  └───────────┘  │  └───────────────────────┘  │
│                 │                 │                 │                             │
│  [Seleccionar]  │  [Furar fila]   │  [Editar]       │  [Ver no site]              │
│  [Reformular]   │                 │  [Reformular]   │  [Despublicar]              │
│  [Eliminar]     │                 │  [Publicar]     │                             │
│                 │                 │  [Agendar]      │                             │
│                 │                 │                 │                             │
├─────────────────┴─────────────────┴─────────────────┴─────────────────────────────┤
│  📊 23 no inbox  │  ⏳ 1 a reformular  │  📝 0 pendentes  │  ✅ 2 publicadas       │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementação Técnica

### Fase 1: Estado de "Em Reformulação" (Realtime)

**Problema:** Actualmente não existe forma de saber se um artigo está a ser reformulado.

**Solução:** Criar tabela ou usar campo para rastrear artigos em processamento:

```sql
-- Adicionar coluna para rastrear processamento da IA
ALTER TABLE articles ADD COLUMN IF NOT EXISTS 
  ai_processing_started_at TIMESTAMP WITH TIME ZONE;
```

Quando a IA começa a reformular:
1. Definir `ai_processing_started_at = now()`
2. Quando termina, limpar o campo e mudar status para `rewritten`

### Fase 2: Criar Componente PipelineBoard

**Ficheiro:** `src/admin/components/pipeline/PipelineBoard.tsx`

```typescript
interface PipelineColumn {
  id: string;
  title: string;
  statuses: ArticleStatus[];
  count: number;
  articles: Article[];
  isProcessing?: boolean;
  processingArticle?: Article;
  queue?: Article[];
}
```

**Colunas:**
1. **Inbox** - Artigos `captured` (não reformulados)
2. **Em Reformulação** - Artigos com `ai_processing_started_at` preenchido
3. **Pendentes** - Artigos `rewritten` + `pending`
4. **Publicadas** - Artigos `published`

### Fase 3: Componente PipelineCard (Artigo Individual)

**Ficheiro:** `src/admin/components/pipeline/PipelineCard.tsx`

Card compacto com:
- Título (truncado)
- Fonte + Credibilidade
- Tempo desde captura
- Indicador visual de estado
- Acções rápidas (hover)

### Fase 4: Coluna "Em Reformulação" com Animação

**Ficheiro:** `src/admin/components/pipeline/RewritingColumn.tsx`

Mostra:
- Artigo actualmente a ser reformulado (com spinner/progress)
- Fila de espera (artigos seleccionados para reformular)
- Botão "Furar fila" para priorizar artigo

### Fase 5: Sistema de Fila de Reformulação

**Nova tabela:** `rewrite_queue` (ou usar Realtime Presence)

```sql
CREATE TABLE rewrite_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id),
  priority INTEGER DEFAULT 0,
  queued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'queued' -- queued, processing, completed, failed
);
```

### Fase 6: Edge Function para Reformulação Individual

Criar endpoint para reformular artigo específico (fura a fila):

**Ficheiro:** `supabase/functions/rewrite-single/index.ts`

```typescript
// POST { article_id: string, priority: 'high' | 'normal' }
// Reformula artigo imediatamente ou adiciona à fila
```

### Fase 7: Actualizar Sidebar

Simplificar navegação:

```text
ANTES:                    DEPOIS:
─────────                 ───────
Dashboard                 Dashboard
Inbox                     Pipeline ← Nova página unificada
Pendentes                 ─────────
Em Edição                 Galeria
Agendadas                 Fontes
Publicadas                Publicidade
─────────                 Agente IA (logs + config)
Galeria                   ─────────
Fontes                    Equipa
...                       Definições
```

---

## Ficheiros a Criar/Modificar

| Ficheiro | Acção | Descrição |
|----------|-------|-----------|
| `src/admin/pages/PipelinePage.tsx` | **CRIAR** | Página principal do pipeline Kanban |
| `src/admin/components/pipeline/PipelineBoard.tsx` | **CRIAR** | Componente Kanban com 4 colunas |
| `src/admin/components/pipeline/PipelineCard.tsx` | **CRIAR** | Card de artigo compacto |
| `src/admin/components/pipeline/PipelineColumn.tsx` | **CRIAR** | Coluna individual do Kanban |
| `src/admin/components/pipeline/RewritingColumn.tsx` | **CRIAR** | Coluna especial com animação de IA |
| `src/admin/hooks/usePipeline.ts` | **CRIAR** | Hook com subscriptions realtime |
| `supabase/functions/rewrite-single/index.ts` | **CRIAR** | Edge function para reformular individualmente |
| `src/admin/components/layout/AdminSidebar.tsx` | **MODIFICAR** | Simplificar navegação |
| `src/App.tsx` | **MODIFICAR** | Adicionar rota `/admin/pipeline` |

---

## Fluxo de Interacções

### 1. Enviar para Reformulação (Inbox → Reformulação)
```text
Utilizador clica "Reformular" no artigo
    ↓
Artigo entra na fila de reformulação (com animação)
    ↓
Coluna "Em Reformulação" mostra o progresso
    ↓
Quando termina, artigo move para "Pendentes"
```

### 2. Furar a Fila
```text
Utilizador clica "Furar fila" em artigo na fila
    ↓
Artigo vai para o topo da fila
    ↓
Se não houver reformulação activa, começa imediatamente
```

### 3. Reformular Novamente (Pendentes)
```text
Utilizador clica "Reformular novamente"
    ↓
Artigo volta para fila de reformulação
    ↓
Após reformular, volta para "Pendentes"
```

### 4. Publicar
```text
Utilizador clica "Publicar" em artigo pendente
    ↓
Validação: tem imagem válida?
    ↓
Se sim: artigo move para "Publicadas"
Se não: modal para adicionar imagem
```

---

## Realtime e Animações

### Subscriptions Supabase

```typescript
// Hook usePipeline.ts
useEffect(() => {
  // Subscrição para mudanças nos artigos
  const articlesChannel = supabase
    .channel('pipeline_articles')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'articles' },
      handleArticleChange
    )
    .subscribe();

  // Subscrição para logs do agente (mostra processamento)
  const logsChannel = supabase
    .channel('pipeline_logs')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'agent_logs',
        filter: 'action=in.(ai_auto_rewrite,ai_auto_complete,ai_auto_error)' },
      handleLogUpdate
    )
    .subscribe();
}, []);
```

### Animações CSS

```css
/* Artigo a ser processado */
.processing-card {
  animation: pulse 2s ease-in-out infinite;
  border-color: var(--primary);
}

/* Artigo a entrar na coluna */
.entering-card {
  animation: slideIn 0.3s ease-out;
}

/* Artigo a sair da coluna */
.leaving-card {
  animation: slideOut 0.3s ease-in;
}
```

---

## Resultado Esperado

Após implementação:

| Antes | Depois |
|-------|--------|
| 6 páginas separadas | 1 página visual unificada |
| Não vê reformulação em tempo real | Vê artigo a ser reformulado com progresso |
| Navegação confusa | Fluxo visual claro da esquerda para direita |
| Logs separados | Processamento integrado no pipeline |
| Selecção individual | Selecção múltipla + acções em lote |
| Sem fila de prioridade | Fila com opção de "furar" |

---

## Considerações Técnicas

### Performance
- Usar React Query com staleTime para reduzir refetches
- Virtualização se houver muitos artigos (>100 por coluna)
- Debounce nas acções de drag-and-drop

### Mobile
- Em mobile, mostrar uma coluna de cada vez com tabs
- Swipe para navegar entre colunas

### Persistência de Estado
- Guardar preferências do utilizador (colunas colapsadas, filtros)
- LocalStorage para estado temporário

