import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Article, ChatMessage } from '@/types/news';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ArticleChatProps {
  article: Article;
}

const defaultSuggestions = [
  { id: '1', text: 'Explica isto de forma simples' },
  { id: '2', text: 'Qual o impacto disto?' },
  { id: '3', text: 'Quem ganha e quem perde?' },
  { id: '4', text: 'Isto já aconteceu antes?' },
];

export function ArticleChat({ article }: ArticleChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      // Call the chat Edge Function with article context
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
      
      // Remove the user message if there was an error
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

  return (
    <div id="chat" className="rounded-xl border overflow-hidden">
      {/* Highlight header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-4 border-b">
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

      {/* Messages or Suggestions */}
      <div className="min-h-[180px] max-h-[400px] overflow-y-auto p-4 bg-muted/20">
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
              {defaultSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSend(suggestion.text)}
                  disabled={isLoading}
                  className="rounded-full border bg-background px-4 py-2 text-sm transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
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
      <div className="border-t bg-background p-4">
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
