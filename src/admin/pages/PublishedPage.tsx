import { useState } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ArticleFilters, ArticleFiltersState } from '../components/pipeline/ArticleFilters';
import { ArticleList } from '../components/pipeline/ArticleList';
import { useArticles } from '../hooks/useArticles';

export default function PublishedPage() {
  const [filters, setFilters] = useState<ArticleFiltersState>({
    search: '',
    sourceId: '',
    category: '',
    status: '',
    showDuplicates: false,
  });

  const { articles, isLoading } = useArticles({
    status: 'published',
    search: filters.search || undefined,
    sourceId: filters.sourceId || undefined,
    category: filters.category || undefined,
    showDuplicates: filters.showDuplicates,
  });

  return (
    <AdminLayout title="Publicadas">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Notícias já publicadas no portal.
          </p>
          <span className="text-sm font-medium text-muted-foreground">
            {articles.length} publicadas
          </span>
        </div>

        <ArticleFilters onFilterChange={setFilters} />

        <ArticleList
          articles={articles}
          isLoading={isLoading}
          showActions={false}
        />
      </div>
    </AdminLayout>
  );
}
