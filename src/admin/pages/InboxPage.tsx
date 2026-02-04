import { useState } from 'react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ArticleFilters, ArticleFiltersState } from '../components/pipeline/ArticleFilters';
import { ArticleList } from '../components/pipeline/ArticleList';
import { useArticles } from '../hooks/useArticles';

export default function InboxPage() {
  const [filters, setFilters] = useState<ArticleFiltersState>({
    search: '',
    sourceId: '',
    category: '',
    status: '',
    showDuplicates: false,
  });

  const { articles, isLoading, updateStatus, refetch } = useArticles({
    status: ['captured', 'rewritten'],
    search: filters.search || undefined,
    sourceId: filters.sourceId || undefined,
    category: filters.category || undefined,
    showDuplicates: filters.showDuplicates,
  });

  const handleApprove = async (id: string) => {
    try {
      await updateStatus(id, 'pending');
      toast.success('Artigo enviado para revisão');
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

  return (
    <AdminLayout title="Inbox">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Notícias captadas automaticamente pelo agente. Reveja e envie para edição.
          </p>
          <span className="text-sm font-medium text-muted-foreground">
            {articles.length} notícias
          </span>
        </div>

        <ArticleFilters 
          onFilterChange={setFilters}
        />

        <ArticleList
          articles={articles}
          isLoading={isLoading}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </AdminLayout>
  );
}
