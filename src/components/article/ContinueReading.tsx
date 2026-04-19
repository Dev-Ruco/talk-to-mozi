import { FeedPostCard } from '@/components/news/FeedPostCard';
import type { Article } from '@/types/news';

interface ContinueReadingProps {
  articles: Article[];
}

export function ContinueReading({ articles }: ContinueReadingProps) {
  if (articles.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-bold">Continuar a ler</h2>
      <div className="space-y-4">
        {articles.map((article) => (
          <FeedPostCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
