import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnonymousId } from '@/hooks/useAnonymousId';
import { useForYouArticles } from '@/hooks/useForYouArticles';
import { FeedPostCard } from './FeedPostCard';

export function ForYouFeed() {
  const { anonymousId } = useAnonymousId();
  const { data: articles = [], isLoading } = useForYouArticles({
    anonymousId,
    limit: 3,
  });

  // Graceful: nothing to show for new visitors → render nothing
  if (isLoading || articles.length === 0) return null;

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-semibold">Para si</h2>
        <span className="text-xs text-muted-foreground">
          · com base no que tem lido
        </span>
      </div>

      <div className="space-y-6">
        {articles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.15) }}
          >
            <FeedPostCard article={article} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
