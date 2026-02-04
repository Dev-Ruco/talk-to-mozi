import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageCircle, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { NewsCard } from '@/components/news/NewsCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchArticles, getLatestArticles } from '@/data/articles';
import { useSavedArticles } from '@/hooks/useSavedArticles';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  relatedArticles?: ReturnType<typeof searchArticles>;
}

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isSaved, toggleSave } = useSavedArticles();

  const latestArticles = useMemo(() => getLatestArticles(4), []);

  const suggestions = [
    'Mostra-me tudo sobre economia esta semana',
    'Qual foi a última decisão do governo?',
    'O que está a acontecer com o dólar?',
    'Notícias sobre saúde em Moçambique',
  ];

  // Handle initial query from URL
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleSubmit(initialQuery);
    }
  }, []);

  const handleSubmit = async (query?: string) => {
    const text = query || input.trim();
    if (!text) return;

    setInput('');
    setIsLoading(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response with related articles
    setTimeout(() => {
      const relatedArticles = searchArticles(text);
      const response = generateMockResponse(text, relatedArticles);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        relatedArticles: relatedArticles.slice(0, 4),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <Layout showSidebars={false}>
      <div className="mx-auto max-w-3xl py-4">
        {/* Header */}
        <header className="mb-6 text-center">
          <div className="mb-2 inline-flex items-center gap-2 text-primary">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Pesquisa Inteligente</span>
          </div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">
            Pergunte algo sobre as notícias
          </h1>
          <p className="mt-1 text-muted-foreground">
            Conversar = Pesquisar. A IA encontra e explica.
          </p>
        </header>

        {/* Chat input */}
        <form onSubmit={handleFormSubmit} className="mb-6">
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escreva qualquer tema: inflação, chuvas, política, dólar…"
              className="h-14 pr-14 text-base"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>

        {/* Messages or suggestions */}
        {messages.length === 0 ? (
          <div className="space-y-6">
            {/* Suggestions */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Sugestões de pesquisa
              </p>
              <div className="flex flex-col gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubmit(suggestion)}
                    className="flex items-center gap-3 rounded-lg border bg-card p-4 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Latest articles */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Últimas notícias
              </p>
              <div className="flex flex-col gap-3">
                {latestArticles.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    variant="compact"
                    isSaved={isSaved(article.id)}
                    onToggleSave={() => toggleSave(article.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="space-y-4">
                {message.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* AI response text */}
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 rounded-2xl rounded-tl-md bg-muted/50 px-4 py-3">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>

                    {/* Related articles */}
                    {message.relatedArticles && message.relatedArticles.length > 0 && (
                      <div className="ml-11 space-y-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Notícias relacionadas
                        </p>
                        <div className="flex flex-col gap-3">
                          {message.relatedArticles.map((article) => (
                            <NewsCard
                              key={article.id}
                              article={article}
                              variant="compact"
                              isSaved={isSaved(article.id)}
                              onToggleSave={() => toggleSave(article.id)}
                            />
                          ))}
                        </div>
                        
                        {/* Continue exploring */}
                        <p className="text-xs text-muted-foreground">
                          Quer explorar mais sobre este tema? Faça outra pergunta acima.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Loading state */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <div className="flex-1 rounded-2xl rounded-tl-md bg-muted/50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function generateMockResponse(query: string, articles: ReturnType<typeof searchArticles>): string {
  const queryLower = query.toLowerCase();
  
  if (articles.length === 0) {
    return `Não encontrei notícias específicas sobre "${query}" na nossa base de dados. Tente reformular a pergunta ou explorar os temas disponíveis.`;
  }

  if (queryLower.includes('economia') || queryLower.includes('dólar') || queryLower.includes('inflação')) {
    return `Sobre economia, encontrei ${articles.length} notícias relevantes. As mais recentes abordam temas como taxas de câmbio, políticas do Banco de Moçambique e impactos no custo de vida. Veja os detalhes nas notícias abaixo.`;
  }

  if (queryLower.includes('política') || queryLower.includes('governo')) {
    return `Em relação à política, há ${articles.length} notícias recentes. Os principais temas incluem novas medidas governamentais, decisões parlamentares e relações institucionais.`;
  }

  if (queryLower.includes('saúde')) {
    return `Sobre saúde em Moçambique, encontrei ${articles.length} artigos que cobrem temas como programas de vacinação, infraestrutura hospitalar e políticas de saúde pública.`;
  }

  return `Encontrei ${articles.length} notícias relacionadas com "${query}". As mais relevantes estão listadas abaixo. Cada uma pode ser explorada em detalhe através do botão "Conversar".`;
}
