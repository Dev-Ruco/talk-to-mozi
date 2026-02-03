import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw } from 'lucide-react';
import { Article, ChatMessage } from '@/types/news';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ArticleChatProps {
  article: Article;
}

const defaultSuggestions = [
  { id: '1', text: 'Explica isto de forma simples' },
  { id: '2', text: 'Qual o impacto na economia?' },
  { id: '3', text: 'Quem ganha e quem perde?' },
  { id: '4', text: 'Isto já aconteceu antes?' },
  { id: '5', text: 'Mostra notícias relacionadas' },
];

export function ArticleChat({ article }: ArticleChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateMockResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('simples') || lowerQuestion.includes('explica')) {
      return `Em resumo, ${article.summary.toLowerCase()} Esta é uma situação importante para o país porque afecta directamente a vida das pessoas. O mais importante a reter é que ${article.quickFacts[0]?.toLowerCase() || 'existem mudanças significativas em curso'}.`;
    }
    
    if (lowerQuestion.includes('economia') || lowerQuestion.includes('económico')) {
      return `Do ponto de vista económico, esta notícia tem implicações importantes. ${article.category === 'economia' ? article.summary : 'Embora não seja directamente uma notícia económica, pode afectar a economia através de vários canais.'} Os analistas estimam que os efeitos se farão sentir nos próximos meses.`;
    }
    
    if (lowerQuestion.includes('ganha') || lowerQuestion.includes('perde')) {
      return `Analisando os intervenientes:\n\n**Quem ganha:**\n- Cidadãos que beneficiam directamente das medidas\n- Sectores económicos relacionados\n\n**Quem pode perder:**\n- Grupos que dependiam do status quo\n- Actores que resistem às mudanças\n\nÉ importante notar que os impactos variam conforme a região e o contexto.`;
    }
    
    if (lowerQuestion.includes('antes') || lowerQuestion.includes('histórico')) {
      return `Historicamente, situações semelhantes já ocorreram em Moçambique. Nos últimos anos, temos visto desenvolvimentos parecidos, embora cada caso tenha as suas particularidades. O contexto actual é diferente devido às mudanças políticas e económicas recentes.`;
    }
    
    if (lowerQuestion.includes('relacionad')) {
      const related = article.relatedArticleIds.length > 0 
        ? 'Existem várias notícias relacionadas que pode explorar na secção abaixo deste chat.'
        : 'No momento, não há notícias directamente relacionadas no nosso sistema.';
      return `${related} Pode também pesquisar por temas específicos na página de pesquisa para encontrar mais contexto sobre este assunto.`;
    }
    
    // Default response
    return `Boa pergunta! Baseado na notícia "${article.title}", posso dizer-lhe que ${article.summary.toLowerCase()} \n\nOs factos principais são:\n${article.quickFacts.map(f => `• ${f}`).join('\n')}\n\nDeseja saber mais sobre algum aspecto específico?`;
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: generateMockResponse(messageText),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([]);
  };

  return (
    <div id="chat" className="rounded-xl border bg-gradient-to-br from-primary/5 to-background overflow-hidden">
      {/* Header */}
      <div className="border-b bg-background/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Conversar com a Notícia</h3>
            <p className="text-xs text-muted-foreground">Pergunte qualquer coisa</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={resetChat}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Reiniciar
          </Button>
        )}
      </div>

      {/* Messages or Suggestions */}
      <div className="min-h-[200px] max-h-[400px] overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Explore esta notícia através de perguntas:
            </p>
            <div className="flex flex-wrap gap-2">
              {defaultSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSend(suggestion.text)}
                  className="rounded-full border bg-background px-4 py-2 text-sm transition-colors hover:border-primary hover:bg-primary/5"
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
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary/40 animate-pulse" />
                    <span className="h-2 w-2 rounded-full bg-primary/40 animate-pulse [animation-delay:150ms]" />
                    <span className="h-2 w-2 rounded-full bg-primary/40 animate-pulse [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t bg-background/50 p-4">
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
