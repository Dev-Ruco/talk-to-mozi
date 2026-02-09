
# Gestao de Artigos Publicados e Limpeza Automatica do Pipeline

## Resumo

Criar uma pagina dedicada de gestao de artigos publicados (`/admin/articles`) com tabela completa, filtros avancados e accoes de edicao/eliminacao. Limitar o pipeline a mostrar apenas os 6 artigos publicados mais recentes (com link para a pagina completa). Adicionar limpeza automatica de artigos com mais de 12 horas nas colunas Inbox, Reformulacao e Pendentes. Adicionar botao "Reiniciar Pipeline" para esvaziar todas as colunas de trabalho.

---

## Parte 1: Nova Pagina de Artigos Publicados

### Novo ficheiro: `src/admin/pages/ArticlesPage.tsx`

Pagina completa de gestao de todos os artigos publicados com:

- Tabela com colunas: Titulo, Categoria, Data de publicacao (hora + data), Tipo (artigo/visual), Estado
- Accoes por artigo: Editar (abre editor), Eliminar permanentemente, Preview (abre no site publico)
- Filtros avancados:
  - Pesquisa por titulo
  - Filtro por categoria (dropdown)
  - Filtro por mes/ano (selectores separados)
  - Filtro por tipo de conteudo (artigo/visual)
- Paginacao: 20 artigos por pagina com botoes Anterior/Seguinte e indicador de pagina
- Eliminacao em lote: checkboxes + botao "Eliminar seleccionados" com confirmacao
- Contador total de artigos

### Modificar: `src/App.tsx`

- Adicionar rota `/admin/articles` para `ArticlesPage`
- Importar o novo componente

### Modificar: `src/admin/components/layout/AdminSidebar.tsx`

- Adicionar item "Artigos" no menu lateral com icone `FileText`, entre Pipeline e Galeria
- Rota: `/admin/articles`

---

## Parte 2: Pipeline - Limitar Publicados a 6

### Modificar: `src/admin/hooks/usePipeline.ts`

- Na query de artigos, manter o fetch de todos os estados necessarios
- Na organizacao por colunas (linha ~330), limitar `publishedArticles` aos 6 mais recentes:

```typescript
const publishedArticles = articles
  .filter(a => a.status === 'published')
  .slice(0, 6); // Apenas os 6 mais recentes
```

### Modificar: `src/admin/components/pipeline/PipelineBoard.tsx`

- Na coluna "Publicadas", adicionar um link "Ver todos os artigos" no final que navega para `/admin/articles`
- Texto: "Ver todos os artigos →"

---

## Parte 3: Limpeza Automatica (12 horas)

### Modificar: `src/admin/hooks/usePipeline.ts`

Adicionar filtragem no frontend para artigos nas colunas Inbox e Pendentes:

```typescript
const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

const inboxArticles = articles.filter(a => 
  a.status === 'captured' && a.captured_at > twelveHoursAgo
);
const pendingArticles = articles.filter(a => 
  ['rewritten', 'pending', 'approved', 'needs_image'].includes(a.status) && 
  a.captured_at > twelveHoursAgo
);
```

Adicionar uma mutation `cleanupOldArticles` que elimina artigos nao-publicados com mais de 12 horas:

```typescript
const cleanupOldArticles = useMutation({
  mutationFn: async () => {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from('articles')
      .delete()
      .in('status', ['captured', 'rewritten', 'pending', 'approved', 'needs_image'])
      .lt('captured_at', twelveHoursAgo);
    if (error) throw error;
  },
});
```

Executar `cleanupOldArticles` automaticamente ao carregar o pipeline (uma vez por sessao).

---

## Parte 4: Botao "Reiniciar Pipeline"

### Modificar: `src/admin/hooks/usePipeline.ts`

Adicionar mutation `resetPipeline`:

```typescript
const resetPipeline = useMutation({
  mutationFn: async () => {
    // 1. Limpar fila de reformulacao
    await supabase
      .from('rewrite_queue')
      .delete()
      .in('status', ['queued', 'processing']);
    
    // 2. Eliminar todos os artigos nao-publicados
    await supabase
      .from('articles')
      .delete()
      .in('status', ['captured', 'rewritten', 'pending', 'approved', 'needs_image', 'scheduled']);
  },
});
```

### Modificar: `src/admin/pages/PipelinePage.tsx`

- Adicionar botao "Reiniciar Pipeline" no header (icone `RotateCcw`), com dialog de confirmacao:
  - "Tem a certeza? Isto vai eliminar todos os artigos nao publicados do pipeline."
  - Botao destrutivo com confirmacao

### Modificar: `src/admin/components/pipeline/PipelineBoard.tsx`

- Receber e expor a funcao `resetPipeline` do hook

---

## Parte 5: Proteccao de Artigos Publicados

A logica de limpeza (12h e reset) NUNCA toca em artigos com `status = 'published'`. Estes ficam sempre protegidos e acessiveis na pagina `/admin/articles`.

---

## Ficheiros a Criar

| Ficheiro | Descricao |
|----------|-----------|
| `src/admin/pages/ArticlesPage.tsx` | Pagina completa de gestao de artigos publicados |

## Ficheiros a Modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/App.tsx` | Adicionar rota `/admin/articles` |
| `src/admin/components/layout/AdminSidebar.tsx` | Adicionar "Artigos" ao menu |
| `src/admin/hooks/usePipeline.ts` | Limitar publicados a 6, cleanup 12h, reset pipeline |
| `src/admin/components/pipeline/PipelineBoard.tsx` | Link "Ver todos", expor reset |
| `src/admin/pages/PipelinePage.tsx` | Botao "Reiniciar Pipeline" com confirmacao |

---

## Seccao Tecnica

### ArticlesPage - Paginacao

```typescript
const [page, setPage] = useState(1);
const PAGE_SIZE = 20;

// Query com paginacao
const query = supabase
  .from('articles')
  .select('*, source:sources(id, name)', { count: 'exact' })
  .eq('status', 'published')
  .order('published_at', { ascending: false })
  .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
```

### ArticlesPage - Filtros por mes/ano

```typescript
// Filtro por mes/ano usando published_at
if (month && year) {
  const start = new Date(year, month - 1, 1).toISOString();
  const end = new Date(year, month, 0, 23, 59, 59).toISOString();
  query = query.gte('published_at', start).lte('published_at', end);
} else if (year) {
  const start = new Date(year, 0, 1).toISOString();
  const end = new Date(year, 11, 31, 23, 59, 59).toISOString();
  query = query.gte('published_at', start).lte('published_at', end);
}
```

### Eliminacao permanente com confirmacao

```typescript
const handleDelete = async (ids: string[]) => {
  // Dialog de confirmacao
  // Apos confirmar:
  const { error } = await supabase
    .from('articles')
    .delete()
    .in('id', ids);
};
```
