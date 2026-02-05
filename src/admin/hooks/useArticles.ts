 import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Article, ArticleStatus } from '../types/admin';

interface UseArticlesOptions {
  status?: ArticleStatus | ArticleStatus[];
  limit?: number;
  search?: string;
  sourceId?: string;
  category?: string;
  showDuplicates?: boolean;
}

export function useArticles(options: UseArticlesOptions = {}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { status, limit = 50, search, sourceId, category, showDuplicates = false } = options;
 
   // Serialize status to stable string for dependency comparison
   const statusKey = useMemo(() => {
     if (!status) return '';
     return Array.isArray(status) ? [...status].sort().join(',') : status;
   }, [Array.isArray(status) ? status.join(',') : status]);

   const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('articles')
        .select(`
          *,
          source:sources(id, name, credibility)
        `)
        .order('captured_at', { ascending: false })
        .limit(limit);

      // Filter by status
      if (status) {
        if (Array.isArray(status)) {
          query = query.in('status', status);
        } else {
          query = query.eq('status', status);
        }
      }

      // Filter by search
      if (search) {
        query = query.or(`title.ilike.%${search}%,original_title.ilike.%${search}%`);
      }

      // Filter by source
      if (sourceId) {
        query = query.eq('source_id', sourceId);
      }

      // Filter by category
      if (category) {
        query = query.eq('category', category);
      }

      // Filter duplicates
      if (!showDuplicates) {
        query = query.eq('is_duplicate', false);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      setArticles((data || []) as unknown as Article[]);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
   }, [statusKey, limit, search, sourceId, category, showDuplicates]);

  useEffect(() => {
    fetchArticles();
   }, [fetchArticles]);

  const updateStatus = async (articleId: string, newStatus: ArticleStatus) => {
    const updates: Partial<Article> = { status: newStatus };
    
    if (newStatus === 'published') {
      updates.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', articleId);

    if (error) throw error;
    
    // Refresh list
    fetchArticles();
  };

  const deleteArticle = async (articleId: string) => {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (error) throw error;
    
    // Refresh list
    fetchArticles();
  };

  return {
    articles,
    isLoading,
    error,
    refetch: fetchArticles,
    updateStatus,
    deleteArticle,
  };
}

export function useArticle(id: string | undefined) {
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id || id === 'new') {
      setIsLoading(false);
      return;
    }

    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const { data, error: queryError } = await supabase
        .from('articles')
        .select(`
          *,
          source:sources(id, name, url, credibility)
        `)
        .eq('id', id)
        .single();

      if (queryError) throw queryError;

      setArticle(data as unknown as Article);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateArticle = async (updates: Partial<Article>) => {
    if (!id) return;

    const { error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    // Refresh
    fetchArticle();
  };

  return {
    article,
    isLoading,
    error,
    refetch: fetchArticle,
    updateArticle,
  };
}
