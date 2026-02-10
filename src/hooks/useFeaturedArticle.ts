import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { adaptArticle } from '@/hooks/usePublishedArticles';

export function useFeaturedArticle() {
  return useQuery({
    queryKey: ['featured-article'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .eq('highlight_type', 'hero')
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching featured article:', error);
        throw error;
      }

      return data ? adaptArticle(data) : null;
    },
  });
}
