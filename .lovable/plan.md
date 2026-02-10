

# Melhorias ao Pipeline Editorial

## Problemas Actuais

1. **Dashboard desactualizado** -- Os stat cards do Dashboard apontam para rotas antigas (`/admin/inbox`, `/admin/pending`, `/admin/published`) que ja nao existem como paginas independentes. O pipeline unificou tudo em `/admin/pipeline`, mas os links ficaram obsoletos.

2. **Dashboard nao reflecte a realidade em tempo real** -- Os stats usam `useEffect` + `useState` manual em vez de `useQuery`, nao actualizam automaticamente e o campo "Ultima execucao: Ha 5 min" do Agente IA e hardcoded (estatico).

3. **Rotas orfas no App.tsx** -- Existem paginas importadas no sidebar/routes que ja nao fazem sentido como destinos independentes (InboxPage, PendingPage, PublishedPage, EditingPage, ScheduledPage). O pipeline absorveu estas funcionalidades.

4. **Coluna Publicadas no pipeline sem accoes uteis** -- Os 6 artigos publicados mostram apenas "Despublicar" e "Eliminar", mas falta a accao "Ver no site" directamente no card (sem abrir o menu dropdown).

5. **Falta indicador visual de tipo de conteudo** -- Os PipelineCards nao mostram se o artigo e "Artigo" ou "Visual", o que e importante para a decisao editorial.

6. **Falta feedback de contagem no header do pipeline** -- O header da pagina Pipeline nao mostra um resumo rapido (ex: "12 inbox | 3 pendentes | 45 publicadas").

7. **Accoes rapidas do Dashboard apontam para paginas erradas** -- Os botoes "Ver Inbox" e "Rever Pendentes" apontam para `/admin/inbox` e `/admin/pending` (paginas independentes), quando deviam apontar para `/admin/pipeline`.

---

## Solucao

### Parte 1: Corrigir o Dashboard

**Ficheiro: `src/admin/pages/AdminDashboard.tsx`**

- Migrar de `useEffect + useState` para `useQuery` (reactivo e com cache)
- Corrigir todos os links dos stat cards para apontar para `/admin/pipeline` (Inbox, Pendentes) e `/admin/articles` (Publicadas)
- Remover o card "Agendadas" dos stats (o pipeline nao tem coluna de agendadas visivel)
- Buscar a ultima execucao real do agente IA da tabela `agent_logs` em vez do valor hardcoded
- Corrigir os botoes de "Accoes Rapidas" para apontar para `/admin/pipeline`

Stat cards corrigidos:
- **Inbox** -> `/admin/pipeline` 
- **Pendentes** -> `/admin/pipeline`
- **Publicadas hoje** -> `/admin/articles`
- **Total publicadas** -> `/admin/articles`

### Parte 2: Adicionar badge de tipo de conteudo ao PipelineCard

**Ficheiro: `src/admin/components/pipeline/PipelineCard.tsx`**

- Adicionar um pequeno badge/icone junto aos metadados para distinguir "Artigo" de "Visual"
- Usar icone `ImageIcon` para visual e `FileText` para artigo, inline com a source e categoria

### Parte 3: Adicionar resumo de contagens no header do Pipeline

**Ficheiro: `src/admin/pages/PipelinePage.tsx`**

- Buscar as contagens do `usePipeline` (inboxArticles.length, pendingArticles.length, publishedArticles.length)
- Mostrar como badges discretos ao lado do titulo: "Inbox 12 | Pendentes 3 | Publicadas 45"

### Parte 4: Limpar rotas orfas

**Ficheiro: `src/App.tsx`**

- Remover importacoes e rotas para paginas que ja nao sao usadas como destinos independentes mas que ainda podem existir como componentes internos:
  - Verificar se `/admin/inbox`, `/admin/pending`, `/admin/published`, `/admin/editing`, `/admin/scheduled` existem como rotas -- se sim, redirecionar para `/admin/pipeline`

**Nota**: As paginas InboxPage, PendingPage, etc. nao estao registadas no App.tsx actual, logo nao ha rotas orfas a limpar. Os links do Dashboard e que estao errados.

---

## Ficheiros a Modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/admin/pages/AdminDashboard.tsx` | Migrar para useQuery, corrigir links, buscar dados reais do agente |
| `src/admin/components/pipeline/PipelineCard.tsx` | Adicionar badge de tipo de conteudo (artigo/visual) |
| `src/admin/pages/PipelinePage.tsx` | Mostrar contagens resumidas no header |

---

## Seccao Tecnica

### Dashboard - Migracao para useQuery

```typescript
const { data: stats, isLoading } = useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: async () => {
    const [inboxRes, pendingRes, publishedRes, sourcesRes, todayRes, lastLogRes] = await Promise.all([
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'captured'),
      supabase.from('articles').select('id', { count: 'exact', head: true }).in('status', ['rewritten', 'pending', 'approved', 'needs_image']),
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('sources').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('articles').select('id', { count: 'exact', head: true })
        .eq('status', 'published')
        .gte('published_at', new Date().toISOString().split('T')[0]),
      supabase.from('agent_logs').select('executed_at').order('executed_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    return {
      inbox: inboxRes.count ?? 0,
      pending: pendingRes.count ?? 0,
      published: publishedRes.count ?? 0,
      sources: sourcesRes.count ?? 0,
      todayPublished: todayRes.count ?? 0,
      lastAgentRun: lastLogRes.data?.executed_at ?? null,
    };
  },
  refetchInterval: 60000, // Actualizar a cada minuto
});
```

### Dashboard - Ultima execucao do agente (real)

```typescript
// Em vez de "Ha 5 min" hardcoded:
{stats.lastAgentRun 
  ? formatDistanceToNow(new Date(stats.lastAgentRun), { addSuffix: true, locale: pt })
  : 'Sem dados'}
```

### PipelineCard - Badge de tipo

```typescript
// Junto aos badges de source e categoria, adicionar:
{article.content_type === 'visual' && (
  <Badge variant="outline" className="text-xs gap-1">
    <ImageIcon className="h-2.5 w-2.5" />
    Visual
  </Badge>
)}
```

### PipelinePage - Contagens no header

```typescript
const { inboxArticles, pendingArticles, publishedArticles } = usePipeline();

// No header, apos a descricao:
<div className="flex items-center gap-2 text-xs text-muted-foreground">
  <Badge variant="secondary">{inboxArticles.length} inbox</Badge>
  <Badge variant="secondary">{pendingArticles.length} pendentes</Badge>
  <Badge variant="secondary">{publishedArticles.length} publicadas</Badge>
</div>
```

