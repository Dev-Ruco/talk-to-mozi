import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Article } from '@/types/news';
import { categories } from '@/data/categories';

interface FeedPostCardProps {
  article: Article;
}

export function FeedPostCard({ article }: FeedPostCardProps) {
  const category = categories.find((c) => c.id === article.category);

  let timeAgo = '';
  try {
    timeAgo = formatDistanceToNow(new Date(article.publishedAt), {
      addSuffix: true,
      locale: pt,
    });
  } catch {
    timeAgo = '';
  }

  return (
    <Link
      to={`/artigo/${article.id}`}
      className="group block overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:shadow-md"
    >
      {article.imageUrl && (
        <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
          <img
            src={article.imageUrl}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      )}

      <div className="space-y-3 p-5">
        {category && (
          <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
            {category.name}
          </span>
        )}

        <h2 className="font-display text-xl font-bold leading-tight transition-colors group-hover:text-primary md:text-2xl">
          {article.title}
        </h2>

        {article.summary && (
          <p className="line-clamp-3 text-sm text-muted-foreground md:text-base">
            {article.summary}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {timeAgo && <span>{timeAgo}</span>}
          {article.readingTime && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.readingTime} min de leitura
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
