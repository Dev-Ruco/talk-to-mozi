import { useState } from 'react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ArticleFilters, ArticleFiltersState } from '../components/pipeline/ArticleFilters';
import { ArticleList } from '../components/pipeline/ArticleList';
import { useArticles } from '../hooks/useArticles';

export default function EditingPage() {
  const [filters, setFilters] = useState<ArticleFiltersState>({
    search: '',
    sourceId: '',
    category: '',
    status: '',
    showDuplicates: false,
  });

  const { articles, isLoading, updateStatus } = useArticles({
    status: ['approved', 'needs_image'],
    search: filters.search || undefined,
    sourceId: filters.sourceId || undefined,
    category: filters.category || undefined,
    showDuplicates: filters.showDuplicates,
  });

  const handleSchedule = async (id: string) => {
    try {
      await updateStatus(id, 'scheduled');
      toast.success('Artigo agendado');
    } catch (error) {
      toast.error('Erro ao agendar artigo');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await updateStatus(id, 'published');
      toast.success('Artigo publicado');
    } catch (error) {
      toast.error('Erro ao publicar artigo');
    }
  };

  return (
    <AdminLayout title="Em Edição">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Artigos aprovados em fase de edição final.
          </p>
          <span className="text-sm font-medium text-muted-foreground">
            {articles.length} em edição
          </span>
        </div>

        <ArticleFilters 
          onFilterChange={setFilters}
          showStatusFilter
          statusOptions={['approved', 'needs_image']}
        />

        <ArticleList
          articles={articles}
          isLoading={isLoading}
          onSchedule={handleSchedule}
          onPublish={handlePublish}
        />
      </div>
    </AdminLayout>
  );
}
