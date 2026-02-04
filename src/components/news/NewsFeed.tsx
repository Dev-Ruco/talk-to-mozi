import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { articles, getArticlesByCategory } from '@/data/articles';
import { sponsoredAds } from '@/data/ads';
import { NewsCard } from './NewsCard';
import { SponsoredCard } from './SponsoredCard';
import { useLikedArticles } from '@/hooks/useLikedArticles';
import { Skeleton } from '@/components/ui/skeleton';

interface NewsFeedProps {
  categoryFilter?: string | null;
  initialCount?: number;
}

export function NewsFeed({ categoryFilter, initialCount = 6 }: NewsFeedProps) {
  const [displayCount, setDisplayCount] = useState(initialCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { isLiked, toggleLike } = useLikedArticles();
  const loadingRef = useRef<HTMLDivElement>(null);

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
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    
    // Small delay for loading animation
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + 6, sortedArticles.length));
      setIsLoadingMore(false);
    }, 300);
  }, [sortedArticles.length, isLoadingMore]);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
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
          <motion.div 
            key={article.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.2) }}
          >
            <NewsCard
              article={article}
              isSaved={isLiked(article.id)}
              onToggleSave={() => toggleLike(article.id)}
            />
            
            {/* Insert sponsored card after every 8th item */}
            {(index + 1) % 8 === 0 && index < displayedArticles.length - 1 && (
              <motion.div 
                className="mt-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SponsoredCard 
                  ad={sponsoredAds[getAdIndex(index)]} 
                  variant="feed" 
                />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Loading indicator */}
      <div ref={loadingRef} className="flex justify-center pt-4">
        {hasMore && (
          isLoadingMore ? (
            <div className="flex flex-col gap-4 w-full">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Scroll para carregar mais...
            </p>
          )
        )}
      </div>
    </div>
  );
}
