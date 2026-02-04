import { useState, useCallback, useEffect } from 'react';
import { articles, getArticlesByCategory } from '@/data/articles';
import { sponsoredAds } from '@/data/ads';
import { NewsCard } from './NewsCard';
import { SponsoredCard } from './SponsoredCard';
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
        <p className="text-muted-foreground">
          Ainda não há notícias aqui.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Experimente perguntar no chat sobre este tema.
        </p>
      </div>
    );
  }

  // Insert sponsored cards every 8-10 items
  const getAdIndex = (index: number) => Math.floor(index / 9) % sponsoredAds.length;

  return (
    <div className="mx-auto max-w-[600px] space-y-4">
      {/* Single column, vertical scroll feed */}
      <div className="flex flex-col gap-4">
        {displayedArticles.map((article, index) => (
          <div key={article.id}>
            <NewsCard
              article={article}
              isSaved={isSaved(article.id)}
              onToggleSave={() => toggleSave(article.id)}
            />
            
            {/* Insert sponsored card after every 8th item */}
            {(index + 1) % 8 === 0 && index < displayedArticles.length - 1 && (
              <div className="mt-4">
                <SponsoredCard 
                  ad={sponsoredAds[getAdIndex(index)]} 
                  variant="feed" 
                />
              </div>
            )}
          </div>
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
