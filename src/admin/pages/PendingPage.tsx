import { useState } from 'react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ArticleFilters, ArticleFiltersState } from '../components/pipeline/ArticleFilters';
import { ArticleList } from '../components/pipeline/ArticleList';
import { useArticles } from '../hooks/useArticles';

export default function PendingPage() {
  const [filters, setFilters] = useState<ArticleFiltersState>({
    search: '',
    sourceId: '',
    category: '',
    status: '',
    showDuplicates: false,
  });

  const { articles, isLoading, updateStatus } = useArticles({
    status: 'pending',
    search: filters.search || undefined,
    sourceId: filters.sourceId || undefined,
    category: filters.category || undefined,
    showDuplicates: filters.showDuplicates,
  });

  const handleApprove = async (id: string) => {
    try {
      await updateStatus(id, 'approved');
      toast.success('Artigo aprovado');
    } catch (error) {
      toast.error('Erro ao aprovar artigo');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateStatus(id, 'rejected');
      toast.success('Artigo rejeitado');
    } catch (error) {
      toast.error('Erro ao rejeitar artigo');
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
    <AdminLayout title="Pendentes">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Artigos aguardando revisão humana antes da publicação.
          </p>
          <span className="text-sm font-medium text-muted-foreground">
            {articles.length} pendentes
          </span>
        </div>

        <ArticleFilters onFilterChange={setFilters} />

        <ArticleList
          articles={articles}
          isLoading={isLoading}
          onApprove={handleApprove}
          onReject={handleReject}
          onPublish={handlePublish}
        />
      </div>
    </AdminLayout>
  );
}
