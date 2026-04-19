import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { adaptArticle } from './usePublishedArticles';
import type { Article } from '@/types/news';

interface UseForYouArticlesOptions {
  anonymousId: string;
  excludeIds?: string[];
  limit?: number;
}

/**
 * Returns personalized articles based on the visitor's top categories.
 * Returns empty array if there's not enough signal yet (graceful empty state).
 */
export function useForYouArticles({
  anonymousId,
  excludeIds = [],
  limit = 4,
}: UseForYouArticlesOptions) {
  return useQuery<Article[]>({
    queryKey: ['for-you', anonymousId, limit, excludeIds.length],
    enabled: !!anonymousId,
    staleTime: 60_000,
    queryFn: async () => {
      // 1. Get top categories for this anonymous_id
      const { data: topCats, error: catsError } = await supabase.rpc(
        'get_user_top_categories' as any,
        { _anonymous_id: anonymousId, _limit: 3 } as any
      );

      if (catsError) {
        console.warn('[useForYouArticles] get_user_top_categories failed', catsError.message);
        return [];
      }

      const cats = (topCats || []) as Array<{ category: string; score: number }>;
      // Need at least one category with meaningful score
      if (cats.length === 0) return [];

      // 2. Recently viewed articles to exclude
      const { data: viewed } = await supabase
        .from('user_events')
        .select('article_id')
        .eq('anonymous_id', anonymousId)
        .in('event_type', ['view', 'read_complete'])
        .gte(
          'created_at',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        )
        .limit(100);

      const viewedIds = new Set(
        (viewed || [])
          .map((r) => r.article_id)
          .filter((id): id is string => !!id)
      );
      excludeIds.forEach((id) => viewedIds.add(id));

      // 3. Fetch published articles in the top categories
      const categoryNames = cats.map((c) => c.category);
      const { data: articles, error: artsError } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .in('category', categoryNames)
        .order('published_at', { ascending: false })
        .limit(limit + viewedIds.size);

      if (artsError) {
        console.warn('[useForYouArticles] articles fetch failed', artsError.message);
        return [];
      }

      const filtered = (articles || []).filter((a) => !viewedIds.has(a.id));
      return filtered.slice(0, limit).map(adaptArticle);
    },
  });
}
