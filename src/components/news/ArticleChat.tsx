import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Article, ChatMessage } from '@/types/news';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: latestArticles = [] } = useLatestArticles(6);
  const carouselArticles = useMemo(() => 
    latestArticles.filter(a => a.id !== article.id),
    [latestArticles, article.id]
  );
  const carouselAd = useMemo(() => 
    sponsoredAds[Math.floor(Math.random() * sponsoredAds.length)],
    []
  );

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

    // Chat functionality temporarily disabled — pending new backend
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'O chat está temporariamente indisponível. Estamos a migrar para um novo sistema.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 500);
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

  const shouldShowCarouselAfterIndex = (msgIndex: number): boolean => {
    let assistantCount = 0;
    for (let i = 0; i <= msgIndex; i++) {
      if (messages[i]?.role === 'assistant') assistantCount++;
    }
    return messages[msgIndex]?.role === 'assistant' && assistantCount > 0 && assistantCount % 2 === 0;
  };

  return (
    <div id="chat" className="rounded-xl border overflow-hidden flex flex-col" style={{ maxHeight: '600px' }}>
      {/* Header */}
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

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-muted/20" style={{ minHeight: '180px' }}>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {messages.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">Perguntas sugeridas:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {defaultSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(suggestion)}
                  disabled={isLoading}
                  className="rounded-full border bg-background px-4 py-2 text-sm transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={message.id}>
                <div className={cn("flex gap-3", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-background border rounded-bl-md'
                  )}>
                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                </div>
                {shouldShowCarouselAfterIndex(index) && carouselArticles.length > 0 && (
                  <InlineChatCarousel articles={carouselArticles.slice(0, 2)} ads={[carouselAd]} />
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

      {/* Input */}
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
