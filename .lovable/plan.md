

# Fix: Alargar os cards do feed

O feed está limitado a `max-w-2xl` (672px). Os cards preenchem essa largura mas o container é estreito demais para o viewport actual (888px).

## Alteração

**`src/components/news/NewsFeed.tsx`** (linha 101):
- Mudar `max-w-2xl` para `max-w-3xl` (768px) — dá mais espaço aos cards sem ultrapassar o viewport com sidebar

Isto alarga todos os cards do feed e da publicidade proporcionalmente.

