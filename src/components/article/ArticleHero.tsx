import { Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getCategoryById, getCategoryColor } from '@/data/categories';
import type { Article } from '@/types/news';

interface ArticleHeroProps {
  article: Article;
}

export function ArticleHero({ article }: ArticleHeroProps) {
  const category = getCategoryById(article.category);

  return (
    <header className="space-y-5">
      {article.imageUrl && (
        <div className="overflow-hidden rounded-2xl bg-muted">
          <img
            src={article.imageUrl}
            alt={article.title}
            loading="eager"
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      )}

      {category && (
        <Badge variant="secondary" className={cn('text-xs', getCategoryColor())}>
          {category.icon && <category.icon className="mr-1 h-3 w-3" />}
          {category.name}
        </Badge>
      )}

      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-[2.75rem]">
        {article.title}
      </h1>

      {article.summary && (
        <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
          {article.summary}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{article.author}</span>
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(article.publishedAt).toLocaleDateString('pt-MZ', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {article.readingTime} min de leitura
        </span>
      </div>
    </header>
  );
}
