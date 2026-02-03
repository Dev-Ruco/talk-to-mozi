import { useState, useMemo } from 'react';
import { Search, Sparkles, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { NewsCard } from '@/components/news/NewsCard';
import { CategoryChips } from '@/components/news/CategoryChips';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchArticles } from '@/data/articles';
import { useSavedArticles } from '@/hooks/useSavedArticles';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { isSaved, toggleSave } = useSavedArticles();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    let filtered = searchArticles(query);
    if (selectedCategory) {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    return filtered;
  }, [query, selectedCategory]);

  const suggestions = [
    'Mostra-me tudo sobre economia esta semana',
    'Qual foi a última decisão do governo?',
    'Notícias de desporto recentes',
    'O que aconteceu em Cabo Delgado?',
  ];

  return (
    <Layout>
      <div className="space-y-6 py-4">
        <header>
          <h1 className="font-display text-2xl font-bold md:text-3xl">
            Pesquisa
          </h1>
          <p className="mt-1 text-muted-foreground">
            Encontre notícias ou pergunte em modo chat
          </p>
        </header>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar ou perguntar..."
            className="h-14 pl-12 pr-12 text-lg"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Chat mode hint */}
        <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
          <Sparkles className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Dica:</span> Pode pesquisar em modo conversacional, como "Mostra-me tudo sobre inflação esta semana"
          </p>
        </div>

        {/* Category filter */}
        <CategoryChips 
          selectedCategory={selectedCategory} 
          onSelect={setSelectedCategory} 
        />

        {/* Results or suggestions */}
        {query.trim() ? (
          <section>
            <p className="mb-4 text-sm text-muted-foreground">
              {results.length} {results.length === 1 ? 'resultado' : 'resultados'} para "{query}"
            </p>
            {results.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {results.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    isSaved={isSaved(article.id)}
                    onToggleSave={() => toggleSave(article.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  Nenhum resultado encontrado. Tente outros termos.
                </p>
              </div>
            )}
          </section>
        ) : (
          <section>
            <h2 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Sugestões de pesquisa
            </h2>
            <div className="flex flex-col gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(suggestion)}
                  className="flex items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent"
                >
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{suggestion}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
