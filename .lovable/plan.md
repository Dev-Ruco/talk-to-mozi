
# Auditoria: Relação Chat ↔ Artigos Publicados

## Resumo Executivo

A auditoria identificou **3 falhas críticas** que impedem o chat de funcionar como um agente de conhecimento baseado nos artigos publicados. Actualmente, o sistema utiliza **dados mock estáticos** em vez da base de dados real.

---

## Estado Actual: Problema Crítico

### Arquitectura Actual (Quebrada)

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                            │
│                                                                              │
│  ┌──────────────────────┐      ┌──────────────────────┐                     │
│  │   ArticleChat.tsx    │      │     ChatPage.tsx     │                     │
│  │   (Chat na notícia)  │      │   (Pesquisa global)  │                     │
│  └──────────┬───────────┘      └──────────┬───────────┘                     │
│             │                             │                                  │
│             ▼                             ▼                                  │
│  ┌──────────────────────┐      ┌──────────────────────┐                     │
│  │  generateMockResponse │     │   searchArticles()   │ ◄─── PROBLEMA!     │
│  │  (Respostas fixas)    │     │   (Dados estáticos)  │                     │
│  └──────────────────────┘      └──────────────────────┘                     │
│             │                             │                                  │
│             ▼                             ▼                                  │
│       ❌ NÃO USA IA              ❌ USA src/data/articles.ts                │
│       ❌ NÃO CONSULTA BD            (17 artigos MOCK fixos)                 │
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘

                    ⛔ DESCONECTADO DA BASE DE DADOS ⛔

┌────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                            │
│                                                                              │
│      ┌───────────────────────────────────────────────────────────────┐      │
│      │                    Tabela: articles                            │      │
│      │   • 4 artigos publicados (REAIS)                               │      │
│      │   • Campos: title, lead, content, quick_facts, tags, category  │      │
│      │   • 23 artigos captured (aguardando)                           │      │
│      └───────────────────────────────────────────────────────────────┘      │
│                                                                              │
│      ┌───────────────────────────────────────────────────────────────┐      │
│      │  Hook: usePublishedArticles ✓                                  │      │
│      │  (Existe e funciona - usado no feed e hero)                    │      │
│      │  MAS NÃO É USADO NO CHAT!                                      │      │
│      └───────────────────────────────────────────────────────────────┘      │
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Falhas Identificadas

### Falha #1: ChatPage.tsx Usa Dados Mock

| Aspecto | Problema |
|---------|----------|
| **Ficheiro** | `src/pages/ChatPage.tsx` |
| **Linha 8** | `import { searchArticles, getLatestArticles } from '@/data/articles';` |
| **Linha 27** | `const latestArticles = useMemo(() => getLatestArticles(4), []);` |
| **Linha 60** | `const relatedArticles = searchArticles(text);` |
| **Impacto** | Pesquisa em 17 artigos mock fixos, ignora os 4 artigos reais publicados |

**Dados Mock vs Reais:**
| Fonte | Quantidade | Status |
|-------|------------|--------|
| `src/data/articles.ts` | 17 artigos | Ficção/Mock |
| Supabase `articles` (published) | 4 artigos | Reais |

---

### Falha #2: ArticleChat.tsx Não Usa IA Real

| Aspecto | Problema |
|---------|----------|
| **Ficheiro** | `src/components/news/ArticleChat.tsx` |
| **Linhas 33-54** | Função `generateMockResponse()` com respostas fixas |
| **Linhas 71-72** | `await new Promise(resolve => setTimeout(...))` - Simula delay falso |
| **Impacto** | Respostas genéricas que ignoram o contexto real do artigo |

**Exemplo de Resposta Mock (Linha 37):**
```javascript
return `Em resumo, ${article.summary.toLowerCase()} Esta é uma situação 
importante para o país porque afecta directamente a vida das pessoas...`
```

Esta resposta é **genérica e fabricada**, não usa IA para analisar o artigo.

---

### Falha #3: Não Existe Edge Function de Chat

| Edge Functions Existentes | Propósito |
|---------------------------|-----------|
| `news-agent` | Captura notícias de fontes RSS |
| `process-queue` | Processa fila de reformulação |
| `rewrite-article` | Reformula artigos com IA |
| **`chat` ❌** | NÃO EXISTE |

**Impacto:** Sem uma Edge Function dedicada, o chat não pode:
- Consultar todos os artigos publicados
- Enviar contexto à IA
- Gerar respostas fundamentadas

---

## Arquitectura Proposta (Corrigida)

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                            │
│                                                                              │
│  ┌──────────────────────┐      ┌──────────────────────┐                     │
│  │   ArticleChat.tsx    │      │     ChatPage.tsx     │                     │
│  │   (Chat na notícia)  │      │   (Pesquisa global)  │                     │
│  └──────────┬───────────┘      └──────────┬───────────┘                     │
│             │                             │                                  │
│             ▼                             ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    supabase.functions.invoke('chat')                  │   │
│  │                                                                        │   │
│  │   Body: { question, article_id (opcional), conversation_history }      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                     │                                        │
└─────────────────────────────────────┼────────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     SUPABASE EDGE FUNCTION: chat                            │
│                                                                              │
│   1. Recebe pergunta + contexto (article_id opcional)                        │
│                                                                              │
│   2. Consulta artigos publicados:                                            │
│      ┌───────────────────────────────────────────────────────────────┐      │
│      │  SELECT title, lead, content, quick_facts, category, tags      │      │
│      │  FROM articles WHERE status = 'published'                       │      │
│      │  ORDER BY published_at DESC LIMIT 50                           │      │
│      └───────────────────────────────────────────────────────────────┘      │
│                                                                              │
│   3. Constrói contexto para IA:                                              │
│      - Se article_id: foco no artigo específico                              │
│      - Se pesquisa global: inclui todos os artigos relevantes               │
│                                                                              │
│   4. Chama Lovable AI Gateway (gemini-3-flash-preview):                      │
│      ┌───────────────────────────────────────────────────────────────┐      │
│      │  System: "És um assistente do B NEWS. Responde APENAS com     │      │
│      │          base nos artigos fornecidos. Se não tiveres          │      │
│      │          informação, diz que não encontraste notícias."       │      │
│      │                                                                │      │
│      │  User: "[Artigos publicados]\n\nPergunta: {question}"         │      │
│      └───────────────────────────────────────────────────────────────┘      │
│                                                                              │
│   5. Retorna resposta + IDs de artigos relacionados                          │
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Plano de Correcção

### Ficheiros a Criar

| Ficheiro | Propósito |
|----------|-----------|
| `supabase/functions/chat/index.ts` | Edge Function que processa perguntas com IA |

### Ficheiros a Modificar

| Ficheiro | Alterações |
|----------|-----------|
| `src/pages/ChatPage.tsx` | Substituir mock por chamada à Edge Function `chat` |
| `src/components/news/ArticleChat.tsx` | Substituir mock por chamada à Edge Function `chat` |
| `src/hooks/usePublishedArticles.ts` | Adicionar hook `useSearchArticles` para pesquisa textual |

---

## Detalhes Técnicos

### 1. Nova Edge Function: `supabase/functions/chat/index.ts`

**Funcionalidades:**
- Recebe `question`, `article_id` (opcional), `conversation_history`
- Consulta artigos publicados via Supabase Service Role
- Filtra artigos relevantes por palavras-chave ou categoria
- Envia contexto + pergunta ao Lovable AI Gateway
- Retorna resposta + lista de `article_ids` relacionados

**Prompt do Sistema:**
```
És um assistente inteligente do B NEWS, portal de notícias de Moçambique.

REGRAS OBRIGATÓRIAS:
1. Responde APENAS com base nos artigos que te forneço
2. Se a informação não existir nos artigos, diz "Não encontrei notícias sobre esse tema"
3. Usa português de Moçambique (pt-MZ)
4. Cita factos específicos dos artigos quando relevante
5. Sugere artigos relacionados pelo ID

FORMATO DE RESPOSTA (JSON):
{
  "response": "Resposta em linguagem natural",
  "related_article_ids": ["uuid1", "uuid2"],
  "confidence": "high" | "medium" | "low"
}
```

### 2. Modificação: `ChatPage.tsx`

**Antes (Mock):**
```tsx
const relatedArticles = searchArticles(text);
const response = generateMockResponse(text, relatedArticles);
```

**Depois (Real):**
```tsx
const { data, error } = await supabase.functions.invoke('chat', {
  body: { 
    question: text,
    conversation_history: messages.map(m => ({ role: m.role, content: m.content }))
  }
});

// Fetch artigos relacionados pelos IDs retornados
const relatedArticles = await fetchArticlesByIds(data.related_article_ids);
```

### 3. Modificação: `ArticleChat.tsx`

**Antes (Mock):**
```tsx
const assistantMessage = {
  content: generateMockResponse(messageText),
};
```

**Depois (Real):**
```tsx
const { data, error } = await supabase.functions.invoke('chat', {
  body: { 
    question: messageText,
    article_id: article.id, // Foco neste artigo
    conversation_history: messages
  }
});

const assistantMessage = {
  content: data.response,
};
```

### 4. Novo Hook: `useSearchArticles`

Adicionar ao `usePublishedArticles.ts`:

```tsx
export function useSearchArticles(query: string) {
  return useQuery({
    queryKey: ['search-articles', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,lead.ilike.%${query}%,content.ilike.%${query}%`)
        .order('published_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return (data || []).map(adaptArticle);
    },
    enabled: query.length >= 2,
  });
}
```

---

## Fluxo de Dados Corrigido

### Chat na Página do Artigo

```text
Utilizador: "Qual o impacto desta notícia?"
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│ Frontend: ArticleChat.tsx                            │
│ supabase.functions.invoke('chat', {                  │
│   question: "Qual o impacto desta notícia?",         │
│   article_id: "b994a0db-9d7c-4e2c-941c-5349e87ea540" │
│ })                                                   │
└─────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│ Edge Function: chat                                  │
│                                                      │
│ 1. Busca artigo específico:                          │
│    "Banco de Moçambique confirma autenticidade..."   │
│                                                      │
│ 2. Constrói prompt:                                  │
│    ARTIGO: [título, lead, conteúdo, quick_facts]     │
│    PERGUNTA: Qual o impacto desta notícia?           │
│                                                      │
│ 3. Chama Lovable AI Gateway                          │
└─────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│ Resposta da IA (Contextualizada):                    │
│                                                      │
│ "A confirmação do Banco de Moçambique tem impacto    │
│  directo na confiança do público na moeda nacional.  │
│  Os cidadãos com notas sem número de série devem     │
│  dirigir-se aos bancos para troca gratuita. O facto  │
│  de o BdM reagir rapidamente demonstra transparência │
│  da autoridade monetária."                           │
│                                                      │
│ Artigos relacionados: [id do artigo sobre economia]  │
└─────────────────────────────────────────────────────┘
```

### Chat Global (Pesquisa)

```text
Utilizador: "O que aconteceu com os corredores logísticos?"
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│ Frontend: ChatPage.tsx                               │
│ supabase.functions.invoke('chat', {                  │
│   question: "O que aconteceu com os corredores..."   │
│ })                                                   │
└─────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│ Edge Function: chat                                  │
│                                                      │
│ 1. Busca TODOS os artigos publicados (4 actuais)     │
│                                                      │
│ 2. Filtra por relevância (corredores, logística)     │
│    → Encontra: "Corredores logísticos são activos    │
│      estratégicos para Moçambique..."                │
│                                                      │
│ 3. Envia contexto completo à IA                      │
└─────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│ Resposta (Baseada em Artigo Real):                   │
│                                                      │
│ "O Primeiro-Ministro Adriano Maleiane defendeu que   │
│  os portos e corredores logísticos são activos       │
│  estratégicos para atrair investimentos, sobretudo   │
│  nos sectores de energia e economia azul. Esta       │
│  declaração foi feita na Cimeira Global de           │
│  Investimento sobre África, no Dubai."               │
│                                                      │
│ related_article_ids: ["35a53aaa-0a78-4c8e-ba4f-..."] │
└─────────────────────────────────────────────────────┘
```

---

## Recursos Necessários

| Recurso | Estado |
|---------|--------|
| Lovable AI Gateway | ✅ Disponível (LOVABLE_API_KEY configurado) |
| Supabase Client | ✅ Configurado |
| Artigos Publicados | ✅ 4 artigos na base de dados |
| Edge Functions | ✅ Infraestrutura funcional |

---

## Resultado Esperado Após Correcções

| Antes | Depois |
|-------|--------|
| Respostas genéricas/fabricadas | Respostas baseadas em artigos reais |
| Pesquisa em 17 artigos mock | Pesquisa em artigos publicados (Supabase) |
| Sem IA | Com IA via Lovable Gateway |
| Chat não sabe nada | Chat conhece todas as notícias publicadas |
| Dados desactualizados | Dados em tempo real |
