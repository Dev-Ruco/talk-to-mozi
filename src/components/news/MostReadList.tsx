import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { adaptArticle } from '@/hooks/usePublishedArticles';
import { getCategoryById } from '@/data/categories';

/**
 * "Em destaque" — temporary implementation while view_count is not tracked.
 * Picks the 5 most recent published articles, skipping the very latest
 * (which already appears in FeaturedStory + LatestNewsBlock) when possible.
 */
function useHighlightedArticles() {
  return useQuery({
    queryKey: ['highlighted-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(7, 11);

      if (error) throw error;
      return (data || []).map(adaptArticle);
    },
  });
}

export function MostReadList() {
  const { data: articles = [], isLoading } = useHighlightedArticles();

  if (isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-7 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!articles.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl font-bold">Em destaque</h2>
      </div>

      <ol className="space-y-2">
        {articles.map((article, index) => {
          const cat = getCategoryById(article.category);
          return (
            <li key={article.id}>
              <Link
                to={`/artigo/${article.id}`}
                className="group flex items-start gap-4 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="font-display text-3xl font-bold leading-none text-primary/30 transition-colors group-hover:text-primary md:text-4xl">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
                    {cat?.name || 'Notícia'}
                  </span>
                  <h3 className="font-display text-sm font-semibold leading-snug transition-colors group-hover:text-primary md:text-base">
                    {article.title}
                  </h3>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
