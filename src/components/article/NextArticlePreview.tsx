import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNextArticle } from '@/hooks/useNextArticle';
import { categories } from '@/data/categories';
import type { Article } from '@/types/news';

interface NextArticlePreviewProps {
  currentArticle: Article;
}

export function NextArticlePreview({ currentArticle }: NextArticlePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);
  const { data: next, isLoading, refetch } = useNextArticle(
    currentArticle.id,
    currentArticle.publishedAt
  );

  // Only trigger fetch once the preview enters viewport (prefetch on demand)
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          refetch();
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [refetch]);

  const category = next ? categories.find((c) => c.id === next.category) : null;

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Próximo artigo
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {isLoading && (
        <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
          <Skeleton className="aspect-[16/9] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>
      )}

      {next && (
        <Link
          to={`/artigo/${next.id}`}
          state={{ fromFeed: true }}
          className="group block overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:shadow-md"
        >
          {next.imageUrl && (
            <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
              <img
                src={next.imageUrl}
                alt={next.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          )}
          <div className="space-y-3 p-5">
            {category && (
              <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
                {category.name}
              </span>
            )}
            <h3 className="font-display text-xl font-bold leading-tight transition-colors group-hover:text-primary md:text-2xl">
              {next.title}
            </h3>
            {next.summary && (
              <p className="line-clamp-2 text-sm text-muted-foreground">{next.summary}</p>
            )}
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              Ler agora
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      )}
    </div>
  );
}
