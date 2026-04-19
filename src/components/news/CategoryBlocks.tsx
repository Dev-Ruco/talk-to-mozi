import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { adaptArticle } from '@/hooks/usePublishedArticles';
import { getCategoryById } from '@/data/categories';
import { getValidImageUrl } from '@/lib/imageUtils';
import type { CategoryId } from '@/types/news';

const FEATURED_CATEGORIES: CategoryId[] = ['economia', 'politica', 'sociedade'];

function useArticlesByCategory(category: CategoryId) {
  return useQuery({
    queryKey: ['category-articles', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .eq('category', category)
        .order('published_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return (data || []).map(adaptArticle);
    },
  });
}

function CategoryRow({ category }: { category: CategoryId }) {
  const { data: articles = [], isLoading } = useArticlesByCategory(category);
  const cat = getCategoryById(category);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[16/10] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!articles.length) return null;

  const Icon = cat?.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-xl font-bold">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          {cat?.name || category}
        </h3>
        <Link
          to={`/categoria/${category}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Ver mais
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {articles.map((a) => (
          <Link
            key={a.id}
            to={`/artigo/${a.id}`}
            className="group block overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="overflow-hidden">
              <img
                src={getValidImageUrl(a.imageUrl)}
                alt={a.title}
                className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
            <div className="space-y-1.5 p-3">
              <h4 className="font-display text-sm font-semibold leading-snug line-clamp-2 transition-colors group-hover:text-primary">
                {a.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CategoryBlocks() {
  return (
    <section className="space-y-8">
      {FEATURED_CATEGORIES.map((cat) => (
        <CategoryRow key={cat} category={cat} />
      ))}
    </section>
  );
}
