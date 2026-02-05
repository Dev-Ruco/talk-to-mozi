
# Chat Contextual, Dinâmico e Inteligente

## Resumo das Alterações

Transformar o chat num sistema inteligente e contextual com 5 melhorias principais:

1. **Sugestões dinâmicas baseadas em temas trending** (últimas 24h)
2. **Perguntas contextuais geradas por IA** para cada artigo
3. **UX melhorada** - chat moderno com input fixo em baixo
4. **Cards inline no fluxo da conversa** - carrossel minimalista a cada 2 interações
5. **Backend actualizado** para gerar sugestões contextuais

---

## Alterações Detalhadas

### 1. Nova Edge Function para Trending Topics

**Ficheiro a criar:** `supabase/functions/trending-topics/index.ts`

Esta função analisa artigos publicados nas últimas 24h e extrai:
- Categorias mais frequentes
- Tags mais comuns
- Palavras-chave dos títulos

Retorna lista de temas dinâmicos para substituir os exemplos estáticos.

```text
Request: GET
Response: {
  topics: ["FSM", "taxa de juro", "Banco de Moçambique", "chuvas"],
  categories: ["economia", "politica"],
  generated_at: "2026-02-05T15:00:00Z"
}
```

---

### 2. Actualização da Edge Function `chat` 

**Ficheiro a modificar:** `supabase/functions/chat/index.ts`

Adicionar nova funcionalidade `generate_suggestions`:

```text
Request: {
  action: "generate_suggestions",
  article_id: "uuid" (opcional)
}

Response: {
  suggestions: [
    "Qual o impacto na economia moçambicana?",
    "Como isto afecta o cidadão comum?",
    "O Banco de Moçambique tomou medidas similares antes?"
  ]
}
```

Quando `article_id` é fornecido:
- Analisa título, lead e conteúdo do artigo
- Gera 4 perguntas contextuais específicas
- Usa IA para criar perguntas que fazem sentido para aquele artigo

---

### 3. Componente `ArticleChat.tsx` - Refactor Completo

**Ficheiro a modificar:** `src/components/news/ArticleChat.tsx`

#### 3.1 Sugestões Dinâmicas
```tsx
// Antes (estático):
const defaultSuggestions = [
  { id: '1', text: 'Explica isto de forma simples' },
  ...
];

// Depois (dinâmico):
const [suggestions, setSuggestions] = useState<string[]>([]);

useEffect(() => {
  // Fetch contextual suggestions from backend
  const fetchSuggestions = async () => {
    const { data } = await supabase.functions.invoke('chat', {
      body: { action: 'generate_suggestions', article_id: article.id }
    });
    setSuggestions(data?.suggestions || defaultFallback);
  };
  fetchSuggestions();
}, [article.id]);
```

#### 3.2 Layout Modernizado (ChatGPT-style)
```text
┌────────────────────────────────────────────────┐
│ ✨ Explore esta notícia       [Reiniciar]      │ ← Header fixo
├────────────────────────────────────────────────┤
│                                                 │
│  [Mensagens crescem para cima]                 │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Resposta do assistente...               │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │ ← Carrossel inline
│  │ 📰 │ 📰 │ 📰                             │   │   (a cada 2 interações)
│  └─────────────────────────────────────────┘   │
│                                                 │
│                    ┌───────────────────────┐   │
│                    │ Mensagem do utilizador│   │
│                    └───────────────────────┘   │
│                                                 │
├────────────────────────────────────────────────┤
│ [Escreva a sua pergunta...           ] [Enviar]│ ← Input SEMPRE em baixo
└────────────────────────────────────────────────┘
```

#### 3.3 Cards Inline no Chat
Novo componente para carrossel minimalista:
```tsx
// A cada 2 mensagens do assistente, inserir:
{(assistantMessageCount % 2 === 0) && (
  <InlineChatCarousel 
    articles={relatedArticles} 
    ads={contextualAds}
  />
)}
```

---

### 4. Componente `ChatPage.tsx` - Trending Topics

**Ficheiro a modificar:** `src/pages/ChatPage.tsx`

#### 4.1 Substituir Sugestões Estáticas
```tsx
// Antes (estático):
const suggestions = [
  'Mostra-me tudo sobre economia esta semana',
  ...
];

// Depois (dinâmico):
const [trendingSuggestions, setTrendingSuggestions] = useState<string[]>([]);

useEffect(() => {
  const fetchTrending = async () => {
    const { data } = await supabase.functions.invoke('trending-topics');
    // Gerar frases a partir dos topics
    const phrases = data?.topics?.map(t => `O que está a acontecer com ${t}?`) || [];
    setTrendingSuggestions(phrases);
  };
  fetchTrending();
}, []);
```

#### 4.2 Cards Inline Durante Conversa
Mesma lógica do ArticleChat - carrossel minimalista a cada 2 respostas.

---

### 5. Componente `HeroChat.tsx` - Quick Topics Dinâmicos

**Ficheiro a modificar:** `src/components/news/HeroChat.tsx`

```tsx
// Antes (estático):
const quickTopics = ['inflação', 'combustível', 'chuvas', 'política', 'dólar'];

// Depois (dinâmico):
const { data: trendingData } = useQuery({
  queryKey: ['trending-topics'],
  queryFn: async () => {
    const { data } = await supabase.functions.invoke('trending-topics');
    return data?.topics || [];
  },
  staleTime: 5 * 60 * 1000, // Cache 5 min
});

const quickTopics = trendingData?.length > 0 
  ? trendingData.slice(0, 7) 
  : ['inflação', 'combustível', 'chuvas']; // Fallback
```

---

### 6. Novo Componente: InlineChatCarousel

**Ficheiro a criar:** `src/components/news/InlineChatCarousel.tsx`

Carrossel minimalista inspirado no screenshot (Diário Económico):

```tsx
interface InlineChatCarouselProps {
  articles: Article[];
  ads?: SponsoredAd[];
}

export function InlineChatCarousel({ articles, ads = [] }: InlineChatCarouselProps) {
  // Mistura 1-2 artigos + 0-1 ads
  const items = [...articles.slice(0, 2), ...ads.slice(0, 1)];
  
  return (
    <div className="my-4 -mx-2">
      <Carousel opts={{ align: 'start' }}>
        <CarouselContent>
          {items.map((item, i) => (
            <CarouselItem key={i} className="basis-2/3 md:basis-1/3">
              <Link to={`/artigo/${item.id}`}>
                <div className="rounded-lg border overflow-hidden bg-card">
                  <img 
                    src={item.imageUrl} 
                    className="h-24 w-full object-cover"
                  />
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground">
                      {item.category}
                    </p>
                    <h4 className="text-sm font-medium line-clamp-2">
                      {item.title}
                    </h4>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
```

---

### 7. Novo Hook: useTrendingTopics

**Ficheiro a criar:** `src/hooks/useTrendingTopics.ts`

```tsx
export function useTrendingTopics() {
  return useQuery({
    queryKey: ['trending-topics'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('trending-topics');
      if (error) throw error;
      return {
        topics: data?.topics || [],
        categories: data?.categories || [],
        generatedAt: data?.generated_at
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
}
```

---

## Ficheiros a Modificar/Criar

| Ficheiro | Acção | Descrição |
|----------|-------|-----------|
| `supabase/functions/trending-topics/index.ts` | Criar | Analisa artigos 24h e extrai trending |
| `supabase/functions/chat/index.ts` | Modificar | Adiciona `generate_suggestions` action |
| `supabase/config.toml` | Modificar | Regista nova function |
| `src/components/news/ArticleChat.tsx` | Modificar | Sugestões dinâmicas + layout ChatGPT + cards inline |
| `src/pages/ChatPage.tsx` | Modificar | Trending topics + cards inline |
| `src/components/news/HeroChat.tsx` | Modificar | Quick topics dinâmicos |
| `src/components/news/InlineChatCarousel.tsx` | Criar | Carrossel minimalista para inline |
| `src/hooks/useTrendingTopics.ts` | Criar | Hook para trending topics |

---

## Fluxo de Dados

```text
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE DATABASE                           │
│                                                                   │
│    articles (published, last 24h)                                │
│    ┌─────────────────────────────────────────────────────────┐   │
│    │ category: "economia" (3x), "politica" (2x)              │   │
│    │ tags: ["FSM", "taxa de juro", "BdM", "chuvas"]          │   │
│    │ titles: "Banco de Moçambique reduz taxa..."             │   │
│    └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                EDGE FUNCTION: trending-topics                    │
│                                                                   │
│   1. SELECT de artigos publicados nas últimas 24h               │
│   2. Agregar tags mais frequentes                                │
│   3. Agregar categorias mais frequentes                          │
│   4. Extrair palavras-chave dos títulos                          │
│   5. Retornar top 7 topics                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                   │
│                                                                   │
│   HeroChat.tsx                                                    │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Exemplos: [FSM] [taxa de juro] [BdM] [chuvas]           │   │
│   │           (Dinâmico, baseado em artigos reais)          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│   ArticleChat.tsx                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ "Este artigo fala sobre taxa de juro do BdM..."         │   │
│   │                                                          │   │
│   │ Perguntas sugeridas (geradas por IA):                   │   │
│   │ • "Qual o impacto na inflação?"                         │   │
│   │ • "Quando foi a última alteração da taxa MIMO?"         │   │
│   │ • "Quais bancos comerciais vão beneficiar?"             │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Comportamento Visual Final

### Chat na Página de Artigo
```text
┌────────────────────────────────────────────────┐
│ ✨ Explore esta notícia       [Reiniciar]      │
├────────────────────────────────────────────────┤
│                                                 │
│ Mensagens anteriores (scroll para cima)        │
│                                                 │
│ ┌─────────────────────────────────────────┐    │
│ │ Resposta 2 do assistente...             │    │
│ └─────────────────────────────────────────┘    │
│                                                 │
│ ┌──────────────────────────────────────────┐   │
│ │ 📰 Card 1 │ 📰 Card 2 │ 📰 Ad            │   │ ← Carrossel inline
│ └──────────────────────────────────────────┘   │
│                                                 │
│                    ┌───────────────────────┐   │
│                    │ Pergunta 3 do user    │   │
│                    └───────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐    │
│ │ Resposta 3 do assistente...             │    │
│ └─────────────────────────────────────────┘    │
│                                                 │
├────────────────────────────────────────────────┤
│ [Escreva a sua pergunta...           ] [>]     │ ← SEMPRE FIXO EM BAIXO
└────────────────────────────────────────────────┘
```

### Carrossel Minimalista Inline
```text
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  [IMAGEM]   │ │  [IMAGEM]   │ │  [IMAGEM]   │
│ ─────────── │ │ ─────────── │ │ ─────────── │
│ 📈 Economia │ │ 📈 Economia │ │ 🏷️ Patrocínio│
│ Título do   │ │ Título do   │ │ Anúncio...  │
│ artigo...   │ │ artigo...   │ │             │
└─────────────┘ └─────────────┘ └─────────────┘
      ←                                   →
```

---

## Regras de Negócio

### Inserção de Cards
- Inserir carrossel após cada **2 respostas** do assistente
- Máximo de **3 cards** por carrossel
- Mistura: **2 artigos** + **1 publicidade** (quando disponível)
- Cards devem ser **contextuais** ao tema da conversa

### Sugestões Contextuais
- Se não houver artigos nas últimas 24h, usar categorias do site como fallback
- Perguntas do artigo devem mencionar entidades/nomes do próprio artigo
- Limite de 4-5 sugestões por contexto

### UX do Chat
- Scroll automático para última mensagem
- Input sempre visível na parte inferior
- Área de mensagens com scroll interno
- Animação suave ao adicionar mensagens
