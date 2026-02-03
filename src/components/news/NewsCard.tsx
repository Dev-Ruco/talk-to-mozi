import { Link } from 'react-router-dom';
import { Clock, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { Article } from '@/types/news';
import { getCategoryById, getCategoryColor } from '@/data/categories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NewsCardProps {
  article: Article;
  isSaved?: boolean;
  onToggleSave?: () => void;
  variant?: 'default' | 'compact';
}

export function NewsCard({ article, isSaved, onToggleSave, variant = 'default' }: NewsCardProps) {
  const category = getCategoryById(article.category);
  const timeAgo = getTimeAgo(article.publishedAt);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      await navigator.share({
        title: article.title,
        text: article.summary,
        url: `${window.location.origin}/artigo/${article.id}`,
      });
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleSave?.();
  };

  if (variant === 'compact') {
    return (
      <Link
        to={`/artigo/${article.id}`}
        className="group flex gap-4 py-4 border-b last:border-0"
      >
        <div className="flex-1 min-w-0">
          <Badge 
            variant="secondary" 
            className={cn("mb-2 text-[10px]", getCategoryColor(article.category))}
          >
            {category?.name}
          </Badge>
          <h3 className="font-display font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {article.summary}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{timeAgo}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readingTime} min
            </span>
          </div>
        </div>
        {article.imageUrl && (
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg">
            <img
              src={article.imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
      </Link>
    );
  }

  return (
    <article className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg">
      <Link to={`/artigo/${article.id}`}>
        {article.imageUrl && (
          <div className="aspect-video overflow-hidden">
            <img
              src={article.imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
      </Link>
      
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className={cn("text-[10px]", getCategoryColor(article.category))}
          >
            {category?.name}
          </Badge>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        
        <Link to={`/artigo/${article.id}`}>
          <h3 className="font-display text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
        </Link>
        
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {article.summary}
        </p>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{article.readingTime} min de leitura</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              asChild
            >
              <Link to={`/artigo/${article.id}#chat`}>
                <MessageCircle className="h-4 w-4" />
                <span className="sr-only">Conversar</span>
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleSave}
            >
              <Bookmark className={cn("h-4 w-4", isSaved && "fill-primary text-primary")} />
              <span className="sr-only">{isSaved ? 'Remover' : 'Guardar'}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Partilhar</span>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Agora';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  
  return date.toLocaleDateString('pt-MZ', { day: 'numeric', month: 'short' });
}
