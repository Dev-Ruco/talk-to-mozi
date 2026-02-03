import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CategoryChips } from '@/components/news/CategoryChips';
import { NewsFeed } from '@/components/news/NewsFeed';
import { getCategoryById } from '@/data/categories';

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = getCategoryById(categoryId || '');

  if (!category) {
    return (
      <Layout>
        <div className="py-12 text-center">
          <h1 className="text-2xl font-bold">Categoria não encontrada</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 py-4">
        <header>
          <h1 className="font-display text-2xl font-bold md:text-3xl">
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Todas as notícias de {category.name.toLowerCase()}
          </p>
        </header>

        <CategoryChips selectedCategory={categoryId} />

        <NewsFeed categoryFilter={categoryId} initialCount={10} />
      </div>
    </Layout>
  );
}
