import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getLatestArticles } from '@/data/articles';

export function HeroChat() {
  const [query, setQuery] = useState('');
  const latestArticles = getLatestArticles(4);

  const suggestions = latestArticles.map(article => ({
    id: article.id,
    text: generateSuggestion(article.title, article.category),
  }));

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-6 md:p-8">
      {/* Decorative elements */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
      
      <div className="relative">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary">Alimentado por IA</span>
        </div>
        
        <h1 className="font-display text-2xl font-bold leading-tight md:text-3xl lg:text-4xl">
          O que aconteceu hoje em{' '}
          <span className="text-primary">Moçambique</span>?
        </h1>
        
        <p className="mt-2 text-muted-foreground md:text-lg">
          Pergunte qualquer coisa sobre as notícias do dia
        </p>
        
        {/* Search input */}
        <div className="mt-6 flex gap-2">
          <div className="relative flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Qual o impacto da nova lei de descentralização?"
              className="h-12 pr-12 text-base"
            />
            <Button
              size="icon"
              className="absolute right-1 top-1 h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Suggestions */}
        <div className="mt-6 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Sugestões de hoje
          </p>
          <div className="flex flex-col gap-2 md:flex-row md:flex-wrap">
            {suggestions.map((suggestion) => (
              <Link
                key={suggestion.id}
                to={`/artigo/${suggestion.id}`}
                className="group flex items-center justify-between gap-2 rounded-xl border bg-background/60 px-4 py-3 text-sm transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <span className="line-clamp-1">{suggestion.text}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
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
      'Qual o impacto económico de — ',
      'Entenda em 2 minutos: ',
      'O que significa para a carteira: ',
    ],
    politica: [
      'Nova medida do Governo — ',
      'O que muda com: ',
      'Impacto da decisão: ',
    ],
    sociedade: [
      'Como afecta a população: ',
      'O que saber sobre: ',
      'Situação actual: ',
    ],
    entretenimento: [
      'Destaque cultural: ',
      'Em cena: ',
    ],
    tecnologia: [
      'Inovação em Moçambique: ',
      'Tecnologia: ',
    ],
    internacional: [
      'Moçambique e o mundo: ',
      'Relações internacionais: ',
    ],
    desporto: [
      'Desporto nacional: ',
      'Resultados: ',
    ],
  };

  const categoryTemplates = templates[category] || [''];
  const template = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
  
  // Shorten title if too long
  const shortTitle = title.length > 50 ? title.substring(0, 50) + '...' : title;
  
  return template + shortTitle;
}
