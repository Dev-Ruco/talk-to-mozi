import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TrendingTopicsData {
  topics: string[];
  categories: string[];
  generatedAt: string;
}

/**
 * Hook to fetch trending topics from published articles in the last 24h
 */
export function useTrendingTopics() {
  return useQuery<TrendingTopicsData>({
    queryKey: ['trending-topics'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('trending-topics');
      
      if (error) {
        console.error('[useTrendingTopics] Error:', error);
        throw error;
      }
      
      return {
        topics: data?.topics || [],
        categories: data?.categories || [],
        generatedAt: data?.generated_at || new Date().toISOString(),
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Generate search phrase suggestions based on trending topics
 */
export function useTrendingSuggestions() {
  const { data, isLoading, error } = useTrendingTopics();

  const suggestions = data?.topics?.slice(0, 4).map(topic => 
    `O que está a acontecer com ${topic}?`
  ) || [];

  return {
    suggestions,
    topics: data?.topics || [],
    categories: data?.categories || [],
    isLoading,
    error,
  };
}
