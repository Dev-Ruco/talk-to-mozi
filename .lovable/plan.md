
# Auditoria Técnica Completa do Pipeline Editorial

## Resumo Executivo

A auditoria identificou **6 falhas críticas** e **4 problemas menores** que afectam a sincronização, navegação e coerência visual do pipeline editorial.

---

## Falhas Críticas Identificadas

### Falha #1: Redireccionamento 404 Após Publicar

**Problema:** Ao publicar um artigo no editor (`ArticleEditorPage.tsx`), o sistema redireciona para `/admin/published` que já não existe.

| Ficheiro | Linha | Código Actual | Problema |
|----------|-------|---------------|----------|
| `src/admin/pages/ArticleEditorPage.tsx` | 123 | `navigate('/admin/published')` | Rota inexistente |
| `src/admin/pages/ArticleEditorPage.tsx` | 149 | `navigate('/admin/scheduled')` | Rota inexistente |
| `src/admin/pages/ArticleEditorPage.tsx` | 169 | Link para `/admin/inbox` | Rota inexistente |
| `src/admin/pages/ArticleEditorPage.tsx` | 193 | Link para `/admin/inbox` | Rota inexistente |

**Causa:** A consolidação do sidebar removeu as rotas antigas (`/admin/published`, `/admin/scheduled`, `/admin/inbox`), mas os redireccionamentos não foram actualizados.

**Correcção:** Substituir todos os redireccionamentos para `/admin/pipeline`.

---

### Falha #2: Realtime NÃO Activo na Tabela `articles`

**Problema:** Os artigos não aparecem imediatamente nas colunas porque a tabela `articles` não tem Realtime habilitado.

**Análise:**
```sql
-- Tabelas COM realtime activo:
✅ rewrite_queue (migration 20260205110807)
✅ agent_logs (migration 20260204210206)

-- Tabela SEM realtime:
❌ articles (FALTA MIGRAÇÃO!)
```

**Impacto:** O hook `usePipeline.ts` subscreve a `postgres_changes` na tabela `articles`, mas os eventos nunca chegam porque a publicação não existe.

**Correcção:** Criar migração SQL:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;
```

---

### Falha #3: Artigos Presos no Inbox Sem Reformulação Automática

**Problema:** Existem **23 artigos** com status `captured` que nunca entraram na fila de reformulação automática.

**Análise da Base de Dados:**
| Status | Contagem |
|--------|----------|
| captured | 23 |
| rewritten | 0 |
| pending | 0 |
| published | 3 |

**Causa Provável:** O agente `news-agent` tem um limite de `MAX_AUTO_REWRITES = 5` por execução, mas se houver erros ou timeouts, alguns artigos ficam sem reformular.

**Correcção:** 
1. Adicionar botão "Reformular Todos" no Inbox
2. Implementar retry automático para artigos presos em `captured` há mais de X horas

---

### Falha #4: Imagens com URLs `blob:` Inválidas

**Problema:** Artigos publicados têm `image_url` com valores `blob:` que não carregam.

**Dados Actuais:**
```
id: a48bc92e-969b-4e8b-acb1-934480889d1c
image_url: blob:https://talk-to-mozi.lovable.app/74dd5dc5...
status: published
```

**Impacto:** As imagens aparecem quebradas no site público.

**Já Corrigido:** O `PublishPanel.tsx` agora bloqueia publicação com imagens `blob:`, mas artigos anteriores precisam de correcção manual.

**Correcção Adicional:** 
1. Criar query para identificar artigos com `blob:` URLs
2. Forçar re-upload antes de republicar

---

### Falha #5: Falta de Feedback Visual de Transição

**Problema:** Quando a IA termina a reformulação, o artigo não "anima" para a coluna seguinte - simplesmente aparece/desaparece.

**Causa:** O componente `PipelineCard` não tem animação de entrada/saída integrada com Framer Motion.

**Correcção:** Adicionar animações de transição:
```tsx
<AnimatePresence mode="popLayout">
  {articles.map(article => (
    <motion.div
      key={article.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      layout
    >
      <PipelineCard article={article} />
    </motion.div>
  ))}
</AnimatePresence>
```

---

### Falha #6: Progresso da IA é Simulado (Não Real)

**Problema:** A barra de progresso na coluna "Em Reformulação" usa um intervalo simulado que não reflecte o progresso real.

**Código Actual (`RewritingColumn.tsx`, linha 27-41):**
```tsx
// Simulate progress animation
const interval = setInterval(() => {
  setProgress(prev => Math.min(95, prev + (100 - prev) / 20));
}, 500);
```

**Causa:** A Edge Function `process-queue` não emite eventos de progresso durante a reformulação.

**Correcção de Longo Prazo:** Implementar progresso real via Supabase Realtime Presence ou updates incrementais na tabela `rewrite_queue`.

**Correcção Imediata:** Manter animação simulada mas torná-la mais responsiva (acelerar quando recebe evento de conclusão).

---

## Problemas Menores

### Problema #7: QueryClient Instável

**Ficheiro:** `src/App.tsx`, linha 27
```tsx
const queryClient = new QueryClient();
```

**Risco:** O `queryClient` é recriado em cada render do App, o que pode causar perda de cache.

**Correcção:** Mover para fora do componente ou usar `useMemo`.

---

### Problema #8: Stale Time Muito Curto

**Ficheiro:** `src/admin/hooks/usePipeline.ts`
- Linha 42: `staleTime: 10000` (10 segundos para artigos)
- Linha 59: `staleTime: 5000` (5 segundos para fila)

**Risco:** Muitos refetches desnecessários quando o Realtime já está a actualizar os dados.

**Correcção:** Aumentar `staleTime` para 30-60 segundos quando Realtime estiver activo.

---

### Problema #9: Subscrição Realtime Duplicada

**Ficheiro:** `src/admin/hooks/usePipeline.ts`, linhas 63-96

**Problema:** `refetchArticles` e `refetchQueue` são incluídos no array de dependências do `useEffect`, causando potenciais re-subscrições.

**Correcção:** Usar `useCallback` para estabilizar as funções ou remover do array de dependências.

---

### Problema #10: Falta de Loading State no Publish

**Ficheiro:** `src/admin/components/pipeline/PipelineBoard.tsx`

**Problema:** Ao clicar "Publicar" no menu de contexto do `PipelineCard`, não há feedback visual enquanto aguarda a resposta da base de dados.

**Correcção:** Adicionar estado `isPublishing` específico por artigo.

---

## Plano de Correcção

### Ficheiros a Modificar

| Ficheiro | Alterações |
|----------|-----------|
| `src/admin/pages/ArticleEditorPage.tsx` | Corrigir redireccionamentos para `/admin/pipeline` |
| `src/admin/hooks/usePipeline.ts` | Estabilizar callbacks, aumentar staleTime |
| `src/admin/components/pipeline/PipelineBoard.tsx` | Adicionar estados de loading por artigo |
| `src/admin/components/pipeline/PipelineColumn.tsx` | Adicionar AnimatePresence para transições |
| `src/admin/components/pipeline/PipelineCard.tsx` | Integrar com motion.div |
| `src/App.tsx` | Mover QueryClient para fora do componente |

### Migração SQL Necessária

```sql
-- Habilitar realtime na tabela articles para sincronização instantânea
ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;
```

---

## Verificação de Coerência Estado-Interface

| Componente | Estado BD | Interface | Acção Utilizador | Resposta IA | Coerente? |
|------------|-----------|-----------|------------------|-------------|-----------|
| Inbox → Reformulação | `captured` → queue `queued` | Card move para fila | Clicar "Reformular" | N/A | ✅ |
| Reformulação → Pendentes | `rewritten` | Card aparece em Pendentes | N/A | Completa tarefa | ⚠️ Delay |
| Pendentes → Publicadas | `published` | Redireciona 404 | Clicar "Publicar" | N/A | ❌ Erro |
| Publicadas → Site | `published` | Abre `/artigo/:id` | Clicar "Ver no site" | N/A | ✅ |

---

## Resultado Esperado Após Correcções

| Antes | Depois |
|-------|--------|
| 404 ao publicar | Redireciona para Pipeline |
| Delay de 10+ segundos na transição | Actualização instantânea via Realtime |
| Imagens `blob:` quebradas | Bloqueio preventivo + alertas visuais |
| Sem feedback de loading | Spinners em cada acção |
| Transições abruptas | Animações suaves entre colunas |
| 23 artigos presos no Inbox | Opção de reformular em lote |
