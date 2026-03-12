import { Link, useNavigate } from 'react-router-dom';
import { Clock, MessageCircle, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Article } from '@/types/news';
import { getCategoryById, getCategoryColor } from '@/data/categories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getValidImageUrl } from '@/lib/imageUtils';
import { toast } from 'sonner';
import { VisualCarousel } from './VisualCarousel';

interface NewsCardProps {
  article: Article;
  variant?: 'default' | 'compact' | 'sidebar';
}

export function NewsCard({ article, variant = 'default' }: NewsCardProps) {
  const navigate = useNavigate();
  const category = getCategoryById(article.category);
  const timeAgo = getTimeAgo(article.publishedAt);
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('pt-MZ', { day: 'numeric', month: 'short', year: 'numeric' });
  const CategoryIcon = category?.icon;

  const handleExplore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/artigo/${article.id}#chat`);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/artigo/${article.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, text: article.summary, url });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') await copyToClipboard(url);
      }
    } else {
      await copyToClipboard(url);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado!');
    } catch {
      toast.error('Não foi possível copiar o link');
    }
  };

  // Sidebar variant
  if (variant === 'sidebar') {
    return (
      <Link to={`/artigo/${article.id}`} className="group flex gap-3">
        <img
          src={getValidImageUrl(article.imageUrl)}
          alt={article.title}
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
          onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </p>
          <Badge variant="secondary" className={cn("mt-1.5 text-[10px] font-medium", getCategoryColor())}>
            {CategoryIcon && <CategoryIcon className="mr-1 h-3 w-3" />}
            {category?.name}
          </Badge>
          <p className="text-[10px] text-muted-foreground font-normal mt-1">{timeAgo} · {formattedDate}</p>
        </div>
      </Link>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <Link to={`/artigo/${article.id}`} className="group flex gap-4 py-4 border-b last:border-0">
        <img
          src={getValidImageUrl(article.imageUrl)}
          alt={article.title}
          className="h-20 w-20 shrink-0 rounded-lg object-cover"
          onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
        />
        <div className="flex-1 min-w-0">
          <Badge variant="secondary" className={cn("mb-2 text-[10px] font-medium", getCategoryColor())}>
            {CategoryIcon && <CategoryIcon className="mr-1 h-3 w-3" />}
            {category?.name}
          </Badge>
          <h3 className="font-display font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground font-normal">
            <span>{timeAgo} · {formattedDate}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readingTime} min
            </span>
          </div>
        </div>
      </Link>
    );
  }

  const isVisual = article.contentType === 'visual' && article.galleryUrls && article.galleryUrls.length > 0;

  // Default — uniform height card
  return (
    <motion.article
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image — fixed 180px */}
      <Link to={`/artigo/${article.id}`} className="block shrink-0">
        {isVisual ? (
          <div className="h-[180px] overflow-hidden">
            <VisualCarousel
              images={article.galleryUrls!}
              format={article.visualFormat || 'vertical'}
              autoplay
            />
          </div>
        ) : (
          <div className="h-[180px] overflow-hidden">
            <img
              src={getValidImageUrl(article.imageUrl)}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
            />
          </div>
        )}
      </Link>

      {/* Content — flex-1 with mt-auto actions */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category + Time */}
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary" className={cn("text-[10px] font-medium", getCategoryColor())}>
            {CategoryIcon && <CategoryIcon className="mr-1 h-3 w-3" />}
            {category?.name}
          </Badge>
          <span className="text-xs text-muted-foreground font-normal">
            {timeAgo} · {formattedDate}
          </span>
          {!isVisual && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-normal">
              <Clock className="h-3 w-3" />
              {article.readingTime} min
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/artigo/${article.id}`}>
          <h3 className="font-display text-lg font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
        </Link>

        {/* Summary */}
        {!isVisual && (
          <p className="mt-1.5 text-sm text-muted-foreground font-normal line-clamp-2">
            {article.summary}
          </p>
        )}

        {/* Actions — pushed to bottom */}
        <div className="mt-auto flex items-center justify-between pt-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="default" size="sm" className="gap-1.5" onClick={handleExplore}>
              <MessageCircle className="h-4 w-4" />
              Explorar a notícia
            </Button>
          </motion.div>
          <motion.button
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
            onClick={handleShare}
            whileTap={{ scale: 0.9 }}
          >
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Partilhar</span>
          </motion.button>
        </div>
      </div>
    </motion.article>
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
