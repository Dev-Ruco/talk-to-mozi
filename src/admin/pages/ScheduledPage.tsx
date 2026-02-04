import { useState } from 'react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ArticleFilters, ArticleFiltersState } from '../components/pipeline/ArticleFilters';
import { ArticleList } from '../components/pipeline/ArticleList';
import { useArticles } from '../hooks/useArticles';

export default function ScheduledPage() {
  const [filters, setFilters] = useState<ArticleFiltersState>({
    search: '',
    sourceId: '',
    category: '',
    status: '',
    showDuplicates: false,
  });

  const { articles, isLoading, updateStatus } = useArticles({
    status: 'scheduled',
    search: filters.search || undefined,
    sourceId: filters.sourceId || undefined,
    category: filters.category || undefined,
    showDuplicates: filters.showDuplicates,
  });

  const handlePublish = async (id: string) => {
    try {
      await updateStatus(id, 'published');
      toast.success('Artigo publicado');
    } catch (error) {
      toast.error('Erro ao publicar artigo');
    }
  };

  return (
    <AdminLayout title="Agendadas">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Artigos agendados para publicação automática.
          </p>
          <span className="text-sm font-medium text-muted-foreground">
            {articles.length} agendadas
          </span>
        </div>

        <ArticleFilters onFilterChange={setFilters} />

        <ArticleList
          articles={articles}
          isLoading={isLoading}
          onPublish={handlePublish}
        />
      </div>
    </AdminLayout>
  );
}
