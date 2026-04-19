import { useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePublishedArticles } from '@/hooks/usePublishedArticles';
import { FeedPostCard } from './FeedPostCard';
import { FeedLoadingSkeleton } from './FeedLoadingSkeleton';
import { Button } from '@/components/ui/button';

export function SocialNewsFeed() {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = usePublishedArticles({ limit: 8 });

  const articles = data?.pages.flatMap((p) => p.articles) ?? [];

  const loadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1, rootMargin: '300px' }
    );
    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-2xl space-y-6">
        {[...Array(3)].map((_, i) => (
          <FeedLoadingSkeleton key={i} />
        ))}
      </section>
    );
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-2xl">
        <div className="rounded-2xl border bg-card p-8 text-center">
          <p className="text-base font-medium">Erro ao carregar notícias.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Verifique a sua ligação e tente novamente.
          </p>
          <Button onClick={() => refetch()} className="mt-4" variant="outline">
            Tentar novamente
          </Button>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className="mx-auto max-w-2xl">
        <div className="rounded-2xl border bg-card p-8 text-center">
          <p className="text-base font-medium">Ainda não há notícias publicadas.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Experimente perguntar à Pesquisa IA sobre um tema.
          </p>
          <Button asChild className="mt-4">
            <Link to="/chat">Fazer uma pergunta</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      {articles.map((article, index) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }}
        >
          <FeedPostCard article={article} />
        </motion.div>
      ))}

      <div ref={sentinelRef} className="pt-2">
        {isFetchingNextPage && (
          <div className="space-y-6">
            <FeedLoadingSkeleton />
            <FeedLoadingSkeleton />
          </div>
        )}
        {!hasNextPage && articles.length > 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Chegou ao fim do feed.
          </p>
        )}
      </div>
    </section>
  );
}
