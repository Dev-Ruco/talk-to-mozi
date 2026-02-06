import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import type { Article, CategoryId } from '@/types/news';

import { getValidImageUrl } from '@/lib/imageUtils';

export type PublishedArticle = Tables<'articles'>;

/**
 * Adapts a database article to the frontend Article type
 * Validates image URLs and uses placeholder for invalid ones
 */
export function adaptArticle(dbArticle: PublishedArticle): Article {
  return {
    id: dbArticle.id,
    title: dbArticle.title || '',
    summary: dbArticle.lead || '',
    content: dbArticle.content || '',
    category: (dbArticle.category || 'sociedade') as CategoryId,
    imageUrl: getValidImageUrl(dbArticle.image_url),
    publishedAt: dbArticle.published_at || dbArticle.created_at || new Date().toISOString(),
    readingTime: dbArticle.reading_time || 3,
    author: dbArticle.author || 'Redacção B NEWS',
    quickFacts: dbArticle.quick_facts || [],
    relatedArticleIds: [],
    tags: dbArticle.tags || [],
    contentType: (dbArticle as any).content_type || 'article',
    visualFormat: (dbArticle as any).visual_format || undefined,
    galleryUrls: (dbArticle as any).gallery_urls || [],
  };
}

interface UsePublishedArticlesOptions {
  category?: string | null;
  limit?: number;
  highlightType?: 'hero' | 'trending' | 'normal';
}

/**
 * Hook to fetch published articles with infinite scroll support
 */
export function usePublishedArticles(options: UsePublishedArticlesOptions = {}) {
  const { category, limit = 10 } = options;

  return useInfiniteQuery({
    queryKey: ['published-articles', category, limit],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(pageParam, pageParam + limit - 1);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching articles:', error);
        throw error;
      }

      return {
        articles: (data || []).map(adaptArticle),
        nextCursor: data && data.length === limit ? pageParam + limit : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });
}

/**
 * Hook to fetch a single article by ID
 */
export function useArticle(id: string | undefined) {
  return useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - article not found
          return null;
        }
        console.error('Error fetching article:', error);
        throw error;
      }

      return data ? adaptArticle(data) : null;
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch the latest N articles for the hero slider
 */
export function useLatestArticles(count: number = 4) {
  return useQuery({
    queryKey: ['latest-articles', count],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(count);

      if (error) {
        console.error('Error fetching latest articles:', error);
        throw error;
      }

      return (data || []).map(adaptArticle);
    },
  });
}

/**
 * Hook to fetch related articles by category
 */
export function useRelatedArticles(category: CategoryId | undefined, excludeId: string, count: number = 4) {
  return useQuery({
    queryKey: ['related-articles', category, excludeId, count],
    queryFn: async () => {
      if (!category) return [];

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .eq('category', category)
        .neq('id', excludeId)
        .order('published_at', { ascending: false })
        .limit(count);

      if (error) {
        console.error('Error fetching related articles:', error);
        throw error;
      }

      return (data || []).map(adaptArticle);
    },
    enabled: !!category,
  });
}
