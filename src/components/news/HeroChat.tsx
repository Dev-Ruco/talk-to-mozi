import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getLatestArticles } from '@/data/articles';

export function HeroChat() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const latestArticles = getLatestArticles(4);

  const suggestions = latestArticles.map(article => ({
    id: article.id,
    text: generateSuggestion(article.title, article.category),
  }));

  const quickTopics = ['inflação', 'combustível', 'chuvas', 'política', 'dólar', 'saúde', 'educação'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/chat?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (text: string) => {
    navigate(`/chat?q=${encodeURIComponent(text)}`);
  };

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-8 md:min-h-[60vh] md:py-12">
      <div className="w-full max-w-2xl space-y-8 text-center">
        {/* Main title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-primary">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Alimentado por IA</span>
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
            O que aconteceu hoje em{' '}
            <span className="text-primary">Moçambique</span>?
          </h1>
        </div>
        
        {/* Chat input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escreva qualquer tema: inflação, chuvas, política, dólar…"
              className="h-14 pr-14 text-base md:h-16 md:text-lg"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 md:h-12 md:w-12"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Quick topics */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Exemplos do que pode perguntar:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {quickTopics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleSuggestionClick(topic)}
                  className="rounded-full border bg-background px-3 py-1 text-xs transition-colors hover:border-primary hover:text-primary"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </form>
        
        {/* Dynamic suggestions */}
        <div className="space-y-3 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Sugestões de hoje
          </p>
          <div className="flex flex-col gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="group flex items-center justify-between gap-3 rounded-lg border bg-background px-4 py-3 text-left text-sm transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <span className="line-clamp-1">{suggestion.text}</span>
                <MessageCircle className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function generateSuggestion(title: string, category: string): string {
  const templates: Record<string, string[]> = {
    economia: [
      'Economia: ',
      'Impacto económico de ',
    ],
    politica: [
      'Nova medida do Governo — ',
      'Política: ',
    ],
    sociedade: [
      'Sociedade: ',
      'O que saber sobre: ',
    ],
    entretenimento: [
      'Destaque cultural: ',
    ],
    tecnologia: [
      'Tecnologia: ',
    ],
    internacional: [
      'Internacional: ',
    ],
    desporto: [
      'Desporto: ',
    ],
  };

  const categoryTemplates = templates[category] || [''];
  const template = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
  
  const shortTitle = title.length > 45 ? title.substring(0, 45) + '...' : title;
  
  return template + shortTitle;
}
