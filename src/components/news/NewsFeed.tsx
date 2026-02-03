import { useState, useCallback, useEffect } from 'react';
import { Article } from '@/types/news';
import { articles, getArticlesByCategory } from '@/data/articles';
import { NewsCard } from './NewsCard';
import { useSavedArticles } from '@/hooks/useSavedArticles';

interface NewsFeedProps {
  categoryFilter?: string | null;
  initialCount?: number;
}

export function NewsFeed({ categoryFilter, initialCount = 6 }: NewsFeedProps) {
  const [displayCount, setDisplayCount] = useState(initialCount);
  const { isSaved, toggleSave } = useSavedArticles();

  const filteredArticles = categoryFilter
    ? getArticlesByCategory(categoryFilter)
    : articles;

  const sortedArticles = [...filteredArticles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const displayedArticles = sortedArticles.slice(0, displayCount);
  const hasMore = displayCount < sortedArticles.length;

  // Reset display count when category changes
  useEffect(() => {
    setDisplayCount(initialCount);
  }, [categoryFilter, initialCount]);

  const loadMore = useCallback(() => {
    setDisplayCount(prev => Math.min(prev + 6, sortedArticles.length));
  }, [sortedArticles.length]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500
      ) {
        if (hasMore) {
          loadMore();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadMore]);

  if (displayedArticles.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Nenhuma notícia encontrada nesta categoria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {displayedArticles.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            isSaved={isSaved(article.id)}
            onToggleSave={() => toggleSave(article.id)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            A carregar mais notícias...
          </button>
        </div>
      )}
    </div>
  );
}
