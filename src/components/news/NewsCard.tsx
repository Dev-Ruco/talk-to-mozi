import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, MessageCircle, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [showBigHeart, setShowBigHeart] = useState(false);
  const lastTapRef = useRef<number>(0);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleSave?.();
  };

  const handleChat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/artigo/${article.id}#chat`);
  };

  // Double tap to like (Instagram style)
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isSaved) {
      onToggleSave?.();
      setShowBigHeart(true);
      setTimeout(() => setShowBigHeart(false), 600);
    }
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
    <motion.article 
      className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Large Image with double-click to like */}
      <div 
        className="relative cursor-pointer"
        onDoubleClick={handleDoubleClick}
      >
        <Link to={`/artigo/${article.id}`}>
          <AspectRatio ratio={16 / 9}>
            <img
              src={article.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop'}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </AspectRatio>
        </Link>
        
        {/* Big heart animation on double-click */}
        <AnimatePresence>
          {showBigHeart && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Heart className="h-24 w-24 fill-red-500 text-red-500 drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
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
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5"
              onClick={handleChat}
            >
              <MessageCircle className="h-4 w-4" />
              Conversar
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link to={`/artigo/${article.id}`}>
                Abrir
              </Link>
            </Button>
          </motion.div>
          
          <motion.button
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-md"
            onClick={handleLike}
            whileTap={{ scale: 0.9 }}
            animate={isSaved ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.2 }}
          >
            <Heart className={cn(
              "h-5 w-5 transition-colors",
              isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
            )} />
            <span className="sr-only">{isSaved ? 'Remover' : 'Amei'}</span>
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
