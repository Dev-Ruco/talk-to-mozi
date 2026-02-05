import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Article, ChatMessage, SponsoredAd } from '@/types/news';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLatestArticles } from '@/hooks/usePublishedArticles';
import { InlineChatCarousel } from './InlineChatCarousel';
import { sponsoredAds } from '@/data/ads';

interface ArticleChatProps {
  article: Article;
}

const defaultSuggestions = [
  'Explica isto de forma simples',
  'Qual o impacto disto?',
  'Quem ganha e quem perde?',
  'Isto já aconteceu antes?',
];

export function ArticleChat({ article }: ArticleChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(defaultSuggestions);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch latest articles for inline carousel
  const { data: latestArticles = [] } = useLatestArticles(6);

  // Filter out current article from carousel
  const carouselArticles = useMemo(() => 
    latestArticles.filter(a => a.id !== article.id),
    [latestArticles, article.id]
  );

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

  // Fetch contextual suggestions when article changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoadingSuggestions(true);
      try {
        const { data, error: fnError } = await supabase.functions.invoke('chat', {
          body: { action: 'generate_suggestions', article_id: article.id }
        });

        if (!fnError && data?.suggestions?.length > 0) {
          setSuggestions(data.suggestions);
        } else {
          setSuggestions(defaultSuggestions);
        }
      } catch (err) {
        console.error('[ArticleChat] Error fetching suggestions:', err);
        setSuggestions(defaultSuggestions);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [article.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    setError(null);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('chat', {
        body: {
          question: messageText,
          article_id: article.id,
          conversation_history: messages.map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (fnError) {
        console.error('[ArticleChat] Function error:', fnError);
        throw new Error(fnError.message || 'Erro ao processar a pergunta');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.response || 'Não consegui processar a sua pergunta. Tente novamente.',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('[ArticleChat] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar a pergunta';
      setError(errorMessage);
      toast.error(errorMessage);
      
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setError(null);
  };

  // Determine if we should show carousel after a message
  const shouldShowCarouselAfterIndex = (msgIndex: number): boolean => {
    // Count how many assistant messages are before this index
    let assistantCount = 0;
    for (let i = 0; i <= msgIndex; i++) {
      if (messages[i]?.role === 'assistant') {
        assistantCount++;
      }
    }
    // Show carousel after every 2nd assistant message
    return messages[msgIndex]?.role === 'assistant' && assistantCount > 0 && assistantCount % 2 === 0;
  };

  return (
    <div id="chat" className="rounded-xl border overflow-hidden flex flex-col" style={{ maxHeight: '600px' }}>
      {/* Header - Fixed */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-4 border-b flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold">Explore esta notícia</h3>
            <p className="text-sm text-muted-foreground">Faça perguntas sobre o conteúdo</p>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={resetChat} className="ml-auto">
              <RefreshCw className="h-4 w-4 mr-1" />
              Reiniciar
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area - Scrollable, grows upward */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-muted/20"
        style={{ minHeight: '180px' }}
      >
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {messages.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Perguntas sugeridas:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {isLoadingSuggestions ? (
                <>
                  <Skeleton className="h-9 w-32 rounded-full" />
                  <Skeleton className="h-9 w-40 rounded-full" />
                  <Skeleton className="h-9 w-36 rounded-full" />
                  <Skeleton className="h-9 w-28 rounded-full" />
                </>
              ) : (
                suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(suggestion)}
                    disabled={isLoading}
                    className="rounded-full border bg-background px-4 py-2 text-sm transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={message.id}>
                <div
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-background border rounded-bl-md'
                    )}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                </div>
                
                {/* Inline carousel after every 2 assistant messages */}
                {shouldShowCarouselAfterIndex(index) && carouselArticles.length > 0 && (
                  <InlineChatCarousel 
                    articles={carouselArticles.slice(0, 2)} 
                    ads={[carouselAd]}
                  />
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="bg-background border rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input - Fixed at bottom */}
      <div className="border-t bg-background p-4 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva a sua pergunta..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={() => handleSend()} disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
