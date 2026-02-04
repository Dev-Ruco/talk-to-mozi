import { Link, useNavigate } from 'react-router-dom';
import { Clock, MessageCircle, Bookmark } from 'lucide-react';
import { Article } from '@/types/news';
import { getCategoryById, getCategoryColor } from '@/data/categories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';

interface NewsCardProps {
  article: Article;
  isSaved?: boolean;
  onToggleSave?: () => void;
  variant?: 'default' | 'compact' | 'sidebar';
}

export function NewsCard({ article, isSaved, onToggleSave, variant = 'default' }: NewsCardProps) {
  const navigate = useNavigate();
  const category = getCategoryById(article.category);
  const timeAgo = getTimeAgo(article.publishedAt);
  const CategoryIcon = category?.icon;

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleSave?.();
  };

  const handleChat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/artigo/${article.id}#chat`);
  };

  // Sidebar variant - for RightSidebar trends
  if (variant === 'sidebar') {
    return (
      <Link
        to={`/artigo/${article.id}`}
        className="group flex gap-3"
      >
        <img
          src={article.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop'}
          alt={article.title}
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </p>
          <Badge 
            variant="secondary" 
            className={cn("mt-1.5 text-[10px]", getCategoryColor())}
          >
            {CategoryIcon && <CategoryIcon className="mr-1 h-3 w-3" />}
            {category?.name}
          </Badge>
        </div>
      </Link>
    );
  }

  // Compact variant for related articles
  if (variant === 'compact') {
    return (
      <Link
        to={`/artigo/${article.id}`}
        className="group flex gap-4 py-4 border-b last:border-0"
      >
        <img
          src={article.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop'}
          alt={article.title}
          className="h-20 w-20 shrink-0 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <Badge 
            variant="secondary" 
            className={cn("mb-2 text-[10px]", getCategoryColor())}
          >
            {CategoryIcon && <CategoryIcon className="mr-1 h-3 w-3" />}
            {category?.name}
          </Badge>
          <h3 className="font-display font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{timeAgo}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readingTime} min
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Default - Social media style card with large image
  return (
    <article className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      {/* Large Image */}
      <Link to={`/artigo/${article.id}`}>
        <AspectRatio ratio={16 / 9}>
          <img
            src={article.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop'}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </AspectRatio>
      </Link>
      
      {/* Content */}
      <div className="p-4">
        {/* Category + Time */}
        <div className="mb-3 flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className={cn("text-[10px]", getCategoryColor())}
          >
            {CategoryIcon && <CategoryIcon className="mr-1 h-3 w-3" />}
            {category?.name}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {article.readingTime} min
          </span>
        </div>
        
        {/* Title */}
        <Link to={`/artigo/${article.id}`}>
          <h3 className="font-display text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
            {article.title}
          </h3>
        </Link>
        
        {/* Summary */}
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {article.summary}
        </p>
        
        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            className="gap-1.5"
            onClick={handleChat}
          >
            <MessageCircle className="h-4 w-4" />
            Conversar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link to={`/artigo/${article.id}`}>
              Abrir
            </Link>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8"
            onClick={handleSave}
          >
            <Bookmark className={cn("h-4 w-4", isSaved && "fill-primary text-primary")} />
            <span className="sr-only">{isSaved ? 'Remover' : 'Guardar'}</span>
          </Button>
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
