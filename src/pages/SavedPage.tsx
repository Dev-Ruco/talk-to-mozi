import { Layout } from '@/components/layout/Layout';
import { NewsCard } from '@/components/news/NewsCard';
import { useLikedArticles } from '@/hooks/useLikedArticles';
import { getArticleById } from '@/data/articles';
import { Heart } from 'lucide-react';

export default function SavedPage() {
  const { likedIds } = useLikedArticles();

  const likedArticles = likedIds
    .map(id => getArticleById(id))
    .filter(Boolean);

  return (
    <Layout>
      <div className="space-y-6 py-4">
        <header>
          <h1 className="font-display text-2xl font-bold md:text-3xl">
            Amei
          </h1>
          <p className="mt-1 text-muted-foreground">
            As notícias que curtiu
          </p>
        </header>

        {likedArticles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {likedArticles.map((article) => (
              article && (
                <NewsCard
                  key={article.id}
                  article={article}
                />
              )
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">Nenhuma notícia curtida</h2>
            <p className="mt-1 text-muted-foreground">
              Clique no ícone de coração em qualquer notícia para adicioná-la aqui.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
