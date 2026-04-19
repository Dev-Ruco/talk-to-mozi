import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeaturedArticle } from '@/hooks/useFeaturedArticle';
import { useLatestArticles } from '@/hooks/usePublishedArticles';
import { getCategoryById } from '@/data/categories';
import { getValidImageUrl } from '@/lib/imageUtils';

function getTimeAgo(dateString: string): string {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 60) return `Há ${diff}s`;
  if (diff < 3600) return `Há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Há ${Math.floor(diff / 3600)}h`;
  return `Há ${Math.floor(diff / 86400)}d`;
}

export function FeaturedStory() {
  const { data: featured, isLoading: loadingFeatured } = useFeaturedArticle();
  const { data: latest, isLoading: loadingLatest } = useLatestArticles(1);

  const isLoading = loadingFeatured || loadingLatest;
  // Fallback: most recent article if no featured set
  const article = featured ?? latest?.[0] ?? null;

  if (isLoading) {
    return (
      <section className="grid gap-6 md:grid-cols-2">
        <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </section>
    );
  }

  if (!article) return null;

  const category = getCategoryById(article.category);

  return (
    <section className="grid gap-6 md:grid-cols-2 md:items-center">
      <Link
        to={`/artigo/${article.id}`}
        className="group block overflow-hidden rounded-2xl bg-muted"
      >
        <img
          src={getValidImageUrl(article.imageUrl)}
          alt={article.title}
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      </Link>

      <div className="space-y-4">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
          {category?.name || 'Destaque'}
        </span>

        <Link to={`/artigo/${article.id}`} className="block group">
          <h2 className="font-display text-2xl font-bold leading-tight transition-colors group-hover:text-primary md:text-3xl lg:text-4xl">
            {article.title}
          </h2>
        </Link>

        {article.summary && (
          <p className="text-base text-muted-foreground line-clamp-3">
            {article.summary}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {getTimeAgo(article.publishedAt)}
          </span>
          <span>·</span>
          <span>{article.readingTime} min de leitura</span>
        </div>

        <Link
          to={`/artigo/${article.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
        >
          Ler notícia
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
