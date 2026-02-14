## Plano revisto completo — Agente RSS limpo e independente (Só Supabase cmxh…)

### Objectivo

- **Frontend (Lovable)** apenas como UI.
- **Backend 100% no teu Supabase**: `cmxhvptjfezxjjrrlwgx`.
- Captação de notícias por fontes geridas no frontend.
- **Sem duplicados**.
- Filtros por categoria + keywords por fonte.
- Logs em `pipeline_logs`.

---

# FASE 1 — Base de dados (cmxh…)

## 1) Tabela `sources` (ALTER, não quebrar o que existe)

Manter colunas actuais e adicionar:

- `feed_url text` (opcional)
- `base_url text` (se já tens `url`, podes manter e usar `url` como base)
- `language text default 'pt'`
- `country text`
- `include_keywords text[] default '{}'`
- `exclude_keywords text[] default '{}'`
- `updated_at timestamptz default now()`

**Categorias**: usar o `categories` que já tens (text[]).

✅ **Trigger updated_at** (opcional, mas bom):

- trigger para actualizar `updated_at` em updates.

## 2) Tabela `articles` (anti-duplicados obrigatório)

Adicionar (se faltar):

- `source_id uuid` (fk [sources.id](http://sources.id))
- `source_name text`
- `source_url text`
- `raw_title text` (ou mapear para `original_title`)
- `raw_body text` (ou mapear para `original_content`)
- `raw_published_at timestamptz`
- `state text` (INBOX/PENDENTE/PUBLICADA/ERRO) ou usar a coluna existente `status`

✅ **Anti-duplicados:**

- criar índice unique:
  - `UNIQUE(source_url)` (partial se necessário: `WHERE source_url IS NOT NULL`)

> Isto garante que mesmo que a function tente inserir duplicado, a BD bloqueia.

## 3) Logs

Usar a tua tabela existente `pipeline_logs` (não recriar).  
Só confirmar que tem colunas pelo menos:

- `node`, `level`, `message`, `meta`, `source_id`, `article_id`, `created_at`.

---

# FASE 2 — Edge Functions no teu Supabase (cmxh…)

## 4) Edge Function `rss-fetch` (captação real)

Criar no teu Supabase: `supabase/functions/rss-fetch/index.ts`

### Entrada

```json
{
  "source_id": "opcional",
  "limit_sources": 10,
  "limit_items_per_source": 20,
  "dry_run": false
}

```

### Comportamento

1. Seleccionar fontes:

- se `source_id` existir → só essa fonte
- senão → todas `is_active=true`

2. Resolver feed:

- se `feed_url` existir → usar
- senão → tentar discovery (por ordem):
  - `${base}/feed/`
  - `${base}/rss`
  - `${base}/feed`
  - `${base}/?feed=rss2`

3. Parse RSS/Atom:

- extrair itens: `title`, `link`, `pubDate`, `description/content`

4. Aplicar filtros por fonte:

- `include_keywords`: aceitar só se pelo menos 1 keyword aparecer (título+resumo, case-insensitive)
- `exclude_keywords`: rejeitar se aparecer
- `categories`:
  - se o RSS tiver categorias/tags → mapear e comparar
  - fallback: heurística por keywords (economia/política/desporto/etc.)

5. Anti-duplicados:

- se `link` vazio → ignorar (ou gerar fingerprint opcional)
- se `source_url` já existe → ignorar
- na inserção, confiar também no `UNIQUE(source_url)`

6. Inserir em `articles`:

- `state='INBOX'` (ou `status='captured'`)
- gravar `source_id`, `source_name`, `source_url`, `raw_title`, `raw_body/raw_excerpt`, `raw_published_at`

7. `dry_run=true`:

- não inserir
- devolver preview com:
  - itens aceites/rejeitados + motivo

8. Logs:

- gravar em `pipeline_logs` com node=`RSS_FETCH`

### Segurança

- **Não usar** `verify_jwt=false`**.**
- Função exige login (JWT), porque é backoffice.
- Dentro da function usa `SUPABASE_SERVICE_ROLE_KEY` para escrever sem problemas de RLS.

## 5) Edge Function `rss-preview` (opcional)

Podes dispensar: usar `rss-fetch` com `dry_run=true`.

---

# FASE 3 — Frontend (Lovable) ligado ao cmxh…

## 6) Página `/admin/sources` (gestão completa)

Actualizar UI para:

- criar/editar fonte
- activar/desactivar
- definir:
  - `feed_url` (opcional)
  - `categories` (tags/multi)
  - `include_keywords` (tags)
  - `exclude_keywords` (tags)
  - `fetch_interval_minutes`
  - language/country (opcional)

Botões:

- **Testar** → chama `supabase.functions.invoke('rss-fetch', { body: { source_id, dry_run: true } })`
- **Captar agora** → chama `rss-fetch` com `{ source_id }`
- **Captar tudo** → chama `rss-fetch` sem `source_id`

Após captar:

- refetch da lista de `articles` (para encher INBOX)

## 7) Pipeline/Inbox

- Coluna INBOX mostra artigos captados
- Cada card tem botão “Processar” (chama `pipeline-run`)

---

# FASE 4 — Seed de fontes iniciais (cmxh…)

## 8) Inserir fontes base (SQL seed)

Inserir as 5 fontes com:

- `name`
- `url/base_url`
- `feed_url` vazio (para discovery) ou preenchido se souberes
- `categories` como sugerido

Fontes:

- [opais.co.mz](http://opais.co.mz)
- [diarioeconomico.co.mz](http://diarioeconomico.co.mz)
- [aimnews.org](http://aimnews.org)
- lusa.pt/lusofonia
- [dailymaverick.co.za](http://dailymaverick.co.za)

---

# FASE 5 — Testes (curtos)

1. Criar 1 fonte no UI e clicar **Testar** → deve mostrar preview
2. Clicar **Captar agora** → deve inserir artigos e não duplicar
3. Clicar **Captar agora** outra vez → deve inserir 0 (só logs de duplicados)
4. Abrir 1 artigo INBOX → clicar **Processar** → `pipeline-run` → PENDENTE

---

# Entregáveis

- SQL de ALTERs + índice unique em `articles.source_url`
- Edge Function `rss-fetch` (cmxh…)
- Actualização UI `/admin/sources` com Testar/Captar
- Logs em `pipeline_logs`

---

Se este plano corresponde ao que queres, podes considerar **aprovado**.