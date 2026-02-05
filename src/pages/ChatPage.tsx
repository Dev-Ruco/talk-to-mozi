import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Sparkles, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { NewsCard } from '@/components/news/NewsCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLatestArticles } from '@/hooks/usePublishedArticles';
import { useTrendingSuggestions } from '@/hooks/useTrendingTopics';
import { InlineChatCarousel } from '@/components/news/InlineChatCarousel';
import { sponsoredAds } from '@/data/ads';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Article } from '@/types/news';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  relatedArticleIds?: string[];
}

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch latest articles from database
  const { data: latestArticles, isLoading: isLoadingLatest } = useLatestArticles(6);

  // Fetch trending suggestions
  const { suggestions: trendingSuggestions, isLoading: isLoadingTrending } = useTrendingSuggestions();

  // Get random ad for carousel
  const carouselAd = useMemo(() => 
    sponsoredAds[Math.floor(Math.random() * sponsoredAds.length)],
    []
  );

  // Count assistant messages for carousel insertion
  const assistantMessageCount = useMemo(() => 
    messages.filter(m => m.role === 'assistant').length,
    [messages]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to top on initial page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Handle initial query from URL
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleSubmit(initialQuery);
    }
  }, []);

  // Fetch articles by IDs
  const fetchArticlesByIds = async (ids: string[]): Promise<Article[]> => {
    if (!ids || ids.length === 0) return [];
    
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .in('id', ids)
      .eq('status', 'published');
    
    if (error) {
      console.error('[ChatPage] Error fetching articles:', error);
      return [];
    }
    
    return (data || []).map(article => ({
      id: article.id,
      title: article.title || '',
      summary: article.lead || '',
      content: article.content || '',
      category: (article.category || 'sociedade') as Article['category'],
      imageUrl: article.image_url || '/placeholder.svg',
      publishedAt: article.published_at || article.created_at || new Date().toISOString(),
      readingTime: article.reading_time || 3,
      author: article.author || 'Redacção B NEWS',
      quickFacts: article.quick_facts || [],
      relatedArticleIds: [],
      tags: article.tags || [],
    }));
  };

  const handleSubmit = async (query?: string) => {
    const text = query || input.trim();
    if (!text) return;

    setInput('');
    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Call the chat Edge Function
      const { data, error: fnError } = await supabase.functions.invoke('chat', {
        body: {
          question: text,
          conversation_history: messages.map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (fnError) {
        console.error('[ChatPage] Function error:', fnError);
        throw new Error(fnError.message || 'Erro ao processar a pergunta');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Fetch related articles
      const articles = await fetchArticlesByIds(data?.related_article_ids || []);
      setRelatedArticles(articles);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.response || 'Não consegui processar a sua pergunta.',
        relatedArticleIds: data?.related_article_ids || [],
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('[ChatPage] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar a pergunta';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Remove user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  // Determine if we should show carousel after a message
  const shouldShowCarouselAfterIndex = (msgIndex: number): boolean => {
    let assistantCount = 0;
    for (let i = 0; i <= msgIndex; i++) {
      if (messages[i]?.role === 'assistant') {
        assistantCount++;
      }
    }
    return messages[msgIndex]?.role === 'assistant' && assistantCount > 0 && assistantCount % 2 === 0;
  };

  // Use dynamic suggestions or fallback
  const displaySuggestions = trendingSuggestions.length > 0 
    ? trendingSuggestions 
    : [
        'Mostra-me tudo sobre economia esta semana',
        'Qual foi a última decisão do governo?',
        'O que está a acontecer com o dólar?',
        'Notícias sobre saúde em Moçambique',
      ];

  return (
    <Layout showSidebars={false}>
      <div className="mx-auto max-w-3xl py-4 flex flex-col" style={{ minHeight: 'calc(100vh - 120px)' }}>
        {/* Header */}
        <header className="mb-6 text-center flex-shrink-0">
          <h1 className="font-display text-2xl font-bold md:text-3xl">
            Pergunte algo sobre as notícias
          </h1>
          <p className="mt-1 text-muted-foreground">
            Conversar é pesquisar. Experimente qualquer tema.
          </p>
        </header>

        {/* Messages or suggestions - Scrollable area */}
        <div className="flex-1 overflow-y-auto mb-4">
          {/* Error message */}
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="space-y-6">
              {/* Suggestions */}
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Sugestões de pesquisa
                </p>
                <div className="flex flex-col gap-2">
                  {isLoadingTrending ? (
                    <>
                      <Skeleton className="h-14 w-full rounded-lg" />
                      <Skeleton className="h-14 w-full rounded-lg" />
                      <Skeleton className="h-14 w-full rounded-lg" />
                    </>
                  ) : (
                    displaySuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSubmit(suggestion)}
                        disabled={isLoading}
                        className="flex items-center gap-3 rounded-lg border bg-card p-4 text-left text-sm transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles className="h-4 w-4 text-primary shrink-0" />
                        <span>{suggestion}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Latest articles */}
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Últimas notícias
                </p>
                <div className="flex flex-col gap-3">
                  {isLoadingLatest ? (
                    <>
                      <Skeleton className="h-20 w-full rounded-lg" />
                      <Skeleton className="h-20 w-full rounded-lg" />
                      <Skeleton className="h-20 w-full rounded-lg" />
                    </>
                  ) : latestArticles && latestArticles.length > 0 ? (
                    latestArticles.slice(0, 4).map((article) => (
                      <NewsCard
                        key={article.id}
                        article={article}
                        variant="compact"
                      />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma notícia publicada ainda.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, msgIndex) => (
                <div key={message.id}>
                  <div className="space-y-4">
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
                            <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                          </div>
                        </div>

                        {/* Related articles - only show for the last assistant message */}
                        {msgIndex === messages.length - 1 && relatedArticles.length > 0 && (
                          <div className="ml-11 space-y-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Notícias relacionadas
                            </p>
                            <div className="flex flex-col gap-3">
                              {relatedArticles.map((article) => (
                                <NewsCard
                                  key={article.id}
                                  article={article}
                                  variant="compact"
                                />
                              ))}
                            </div>
                            
                            {/* Continue exploring */}
                            <p className="text-xs text-muted-foreground">
                              Quer explorar mais sobre este tema? Faça outra pergunta abaixo.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Inline carousel after every 2 assistant messages */}
                  {shouldShowCarouselAfterIndex(msgIndex) && latestArticles && latestArticles.length > 0 && (
                    <InlineChatCarousel 
                      articles={latestArticles.slice(0, 2)} 
                      ads={[carouselAd]}
                      className="ml-11"
                    />
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
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat input - Fixed at bottom */}
        <form onSubmit={handleFormSubmit} className="flex-shrink-0 sticky bottom-0 bg-background pt-2 pb-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escreva qualquer tema: inflação, chuvas, política, dólar…"
              className="h-14 flex-1 text-base"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="h-14 w-14 shrink-0"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
