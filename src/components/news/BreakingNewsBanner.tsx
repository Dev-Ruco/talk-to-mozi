import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY_PREFIX = 'dismissed-breaking-';

export function BreakingNewsBanner() {
  const navigate = useNavigate();
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  const { data: article } = useQuery({
    queryKey: ['breaking-news'],
    queryFn: async () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('articles')
        .select('id, title')
        .eq('status', 'published')
        .contains('tags', ['ultima-hora'])
        .gte('published_at', twoHoursAgo)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching breaking news:', error);
        return null;
      }
      return data;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (article?.id) {
      const isDismissed = sessionStorage.getItem(`${SESSION_KEY_PREFIX}${article.id}`);
      if (isDismissed) setDismissedId(article.id);
    }
  }, [article?.id]);

  if (!article || dismissedId === article.id) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem(`${SESSION_KEY_PREFIX}${article.id}`, '1');
    setDismissedId(article.id);
  };

  const handleClick = () => {
    navigate(`/artigo/${article.id}`);
  };

  return (
    <div
      className="w-full bg-[hsl(0_84%_50%)] text-white animate-slide-down"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 px-4 py-3 md:py-2 min-h-[44px]">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>

        <button
          onClick={handleClick}
          className="flex-1 text-left text-sm font-medium line-clamp-1 hover:underline focus:outline-none focus:underline"
        >
          <span className="font-bold uppercase tracking-wide mr-2">Última Hora:</span>
          {article.title}
        </button>

        <button
          onClick={handleDismiss}
          aria-label="Dispensar notícia de última hora"
          className="shrink-0 rounded-full p-1.5 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
