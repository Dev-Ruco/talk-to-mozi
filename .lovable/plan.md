

# Auditoria Completa e Correcções do Sistema B NEWS

## Problemas Identificados

### 1. Bug Crítico: `process-queue` Edge Function
O ficheiro `supabase/functions/process-queue/index.ts` tem um bug de scope: a função `processArticle` recebe o parâmetro `LOVABLE_API_KEY` (linha 32), mas internamente usa a variável `OPENAI_API_KEY` (linha 84) que não existe nesse escopo. Isto causa falha silenciosa em todas as reformulações automáticas do pipeline.

### 2. Pipeline Editorial — Fluxo Inbox → Pendentes
O fluxo actual é: `rss-fetch` capta artigos como `captured` (Inbox) → `process-queue` ou `news-agent` reformula para `rewritten` (Pendentes) → Editor publica. O bug acima bloqueia a transição de Inbox para Pendentes via automação.

### 3. Carrossel Hero — Card de Publicidade
A `HeroChat.tsx` (linha 89-94) insere um `SponsoredCard` no carrossel de "Últimas Notícias de Hoje". Deve ser removido conforme pedido.

### 4. Secção "Últimas Notícias de Hoje" — Painel Visual
O carrossel não tem um painel contentor com cor da marca (roxo B NEWS: `--primary: 271 81% 50%`). Deve ser envolvido num painel rectangular com fundo baseado nesta cor.

### 5. IA do Chat — Funcional mas sem Markdown
O chat funciona correctamente (usa `supabase.functions.invoke('chat')` → OpenAI API). As respostas são renderizadas com `whitespace-pre-line` mas sem suporte a Markdown, limitando a formatação das respostas da IA.

---

## Plano de Correcções

### Tarefa 1: Corrigir bug no `process-queue/index.ts`
- Renomear parâmetro `LOVABLE_API_KEY` para `OPENAI_API_KEY` na função `processArticle` (linha 32)
- Remover comentário legacy "Call Lovable AI Gateway" (linha 80)
- Re-deploy da function

### Tarefa 2: Remover publicidade do carrossel Hero + adicionar painel
**Ficheiro: `src/components/news/HeroChat.tsx`**
- Remover a importação de `sponsoredAds` e `SponsoredCard`
- Alterar `carouselItems` (linhas 89-94) para conter apenas artigos, sem o item `ad`
- Envolver a secção do carrossel num painel com fundo `bg-primary/10` (roxo claro da marca), bordas arredondadas e padding

### Tarefa 3: Remover publicidade do feed (secção "Últimas Notícias de Hoje")
**Ficheiro: `src/components/news/NewsFeed.tsx`**
- Remover importação de `sponsoredAds` e `SponsoredCard`
- Remover a lógica de inserção de `SponsoredCard` a cada 8 artigos (linhas 97-127)
- Manter o feed limpo, apenas com cards de notícias

### Tarefa 4: Adicionar renderização Markdown ao chat
**Ficheiros: `src/components/news/ArticleChat.tsx` e `src/pages/ChatPage.tsx`**
- Instalar `react-markdown` se não disponível
- Substituir `<p className="whitespace-pre-line">` por `<ReactMarkdown>` nas respostas do assistente
- Aplicar estilos `prose prose-sm` para formatação limpa

### Tarefa 5: Deploy e verificação
- Deploy do `process-queue` corrigido
- Verificar que o pipeline completo funciona: captar → reformular → publicar

---

## Ficheiros Alterados

| Ficheiro | Alteração |
|---|---|
| `supabase/functions/process-queue/index.ts` | Fix bug de scope da API key |
| `src/components/news/HeroChat.tsx` | Remover ad do carrossel + painel roxo |
| `src/components/news/NewsFeed.tsx` | Remover ads intercalados no feed |
| `src/components/news/ArticleChat.tsx` | Markdown nas respostas IA |
| `src/pages/ChatPage.tsx` | Markdown nas respostas IA |

