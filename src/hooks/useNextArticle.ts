import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { adaptArticle } from '@/hooks/usePublishedArticles';

/**
 * Fetch the next published article (older than the current one).
 * Falls back to the most recent article that isn't the current one.
 */
export function useNextArticle(currentId: string | undefined, currentPublishedAt: string | undefined) {
  const qc = useQueryClient();

  return useQuery({
    queryKey: ['next-article', currentId],
    enabled: !!currentId,
    queryFn: async () => {
      if (!currentId) return null;

      // Try to get the next-older article first
      if (currentPublishedAt) {
        const { data } = await supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .lt('published_at', currentPublishedAt)
          .neq('id', currentId)
          .order('published_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          const article = adaptArticle(data);
          // Prefetch the article into the cache so navigation is instant
          qc.setQueryData(['article', article.id], article);
          return article;
        }
      }

      // Fallback: most recent article that isn't current
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .neq('id', currentId)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data) return null;
      const article = adaptArticle(data);
      qc.setQueryData(['article', article.id], article);
      return article;
    },
  });
}
