import { Layout } from '@/components/layout/Layout';
import { NewsCard } from '@/components/news/NewsCard';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { getArticleById } from '@/data/articles';
import { Bookmark } from 'lucide-react';

export default function SavedPage() {
  const { savedIds, isSaved, toggleSave } = useSavedArticles();

  const savedArticles = savedIds
    .map(id => getArticleById(id))
    .filter(Boolean);

  return (
    <Layout>
      <div className="space-y-6 py-4">
        <header>
          <h1 className="font-display text-2xl font-bold md:text-3xl">
            Guardados
          </h1>
          <p className="mt-1 text-muted-foreground">
            As notícias que guardou para ler mais tarde
          </p>
        </header>

        {savedArticles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {savedArticles.map((article) => (
              article && (
                <NewsCard
                  key={article.id}
                  article={article}
                  isSaved={isSaved(article.id)}
                  onToggleSave={() => toggleSave(article.id)}
                />
              )
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Bookmark className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">Nenhuma notícia guardada</h2>
            <p className="mt-1 text-muted-foreground">
              Clique no ícone de bookmark em qualquer notícia para guardá-la aqui.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
