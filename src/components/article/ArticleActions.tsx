import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ArticleActionsProps {
  liked: boolean;
  onChat: () => void;
  onLike: () => void;
  onShare: () => void;
  sticky?: boolean;
}

export function ArticleActions({ liked, onChat, onLike, onShare, sticky = false }: ArticleActionsProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 py-2',
        sticky && 'lg:sticky lg:top-4 lg:z-30 lg:rounded-full lg:border lg:bg-background/80 lg:px-3 lg:py-2 lg:shadow-sm lg:backdrop-blur'
      )}
    >
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button size="sm" onClick={onChat} className="rounded-full shadow-sm">
          <MessageCircle className="mr-1 h-4 w-4" />
          Conversar
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={onLike}
          className={cn(
            'rounded-full',
            liked && 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
          )}
        >
          <Heart className={cn('mr-1 h-4 w-4', liked && 'fill-red-500 text-red-500')} />
          {liked ? 'Amei' : 'Curtir'}
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button variant="outline" size="sm" onClick={onShare} className="rounded-full">
          <Share2 className="mr-1 h-4 w-4" />
          Partilhar
        </Button>
      </motion.div>
    </div>
  );
}
