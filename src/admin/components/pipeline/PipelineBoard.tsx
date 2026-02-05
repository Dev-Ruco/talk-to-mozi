import { useState } from 'react';
import { 
  Inbox, 
  FileCheck, 
  CheckCircle, 
  Trash2, 
  Sparkles,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { usePipeline, PipelineArticle } from '../../hooks/usePipeline';
import { PipelineColumn } from './PipelineColumn';
import { PipelineCard } from './PipelineCard';
import { RewritingColumn } from './RewritingColumn';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export function PipelineBoard() {
  const {
    inboxArticles,
    pendingArticles,
    publishedArticles,
    queuedArticles,
    processingArticle,
    processingItem,
    isLoading,
    addToQueue,
    skipQueue,
    deleteArticles,
    publishArticle,
    unpublishArticle,
    isAddingToQueue,
    isDeleting,
    refetch,
  } = usePipeline();

  const [selectedInbox, setSelectedInbox] = useState<Set<string>>(new Set());
  const [selectedPending, setSelectedPending] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articlesToDelete, setArticlesToDelete] = useState<string[]>([]);

  const toggleSelection = (set: Set<string>, id: string, setter: (s: Set<string>) => void) => {
    const newSet = new Set(set);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setter(newSet);
  };

  const handleBulkRewrite = () => {
    if (selectedInbox.size === 0) {
      toast.warning('Seleccione artigos para reformular');
      return;
    }
    selectedInbox.forEach(id => addToQueue({ articleId: id }));
    setSelectedInbox(new Set());
  };

  const handleBulkDelete = (source: 'inbox' | 'pending') => {
    const ids = source === 'inbox' ? Array.from(selectedInbox) : Array.from(selectedPending);
    if (ids.length === 0) {
      toast.warning('Seleccione artigos para eliminar');
      return;
    }
    setArticlesToDelete(ids);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteArticles(articlesToDelete);
    setSelectedInbox(new Set());
    setSelectedPending(new Set());
    setDeleteDialogOpen(false);
    setArticlesToDelete([]);
  };

  const queuedArticleIds = new Set(queuedArticles.map(q => q.article_id));

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[calc(100vh-12rem)] gap-4 overflow-x-auto pb-4">
        {/* Inbox Column */}
        <PipelineColumn
          title="Inbox"
          icon={Inbox}
          count={inboxArticles.length}
          emptyMessage="Nenhum artigo captado"
          actions={
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkRewrite}
                disabled={selectedInbox.size === 0 || isAddingToQueue}
                className="h-7 gap-1 text-xs"
              >
                <Sparkles className="h-3 w-3" />
                Reformular ({selectedInbox.size})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkDelete('inbox')}
                disabled={selectedInbox.size === 0}
                className="h-7 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          }
        >
          {inboxArticles.map(article => (
            <PipelineCard
              key={article.id}
              article={article}
              isSelected={selectedInbox.has(article.id)}
              onSelect={() => toggleSelection(selectedInbox, article.id, setSelectedInbox)}
              onRewrite={() => addToQueue({ articleId: article.id })}
              onDelete={() => {
                setArticlesToDelete([article.id]);
                setDeleteDialogOpen(true);
              }}
              isQueued={queuedArticleIds.has(article.id)}
            />
          ))}
        </PipelineColumn>

        {/* Rewriting Column */}
        <RewritingColumn
          processingArticle={processingArticle || null}
          processingItem={processingItem || null}
          queuedItems={queuedArticles}
          onSkipQueue={skipQueue}
        />

        {/* Pending Column */}
        <PipelineColumn
          title="Pendentes"
          icon={FileCheck}
          count={pendingArticles.length}
          color="warning"
          emptyMessage="Nenhum artigo pendente"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkDelete('pending')}
              disabled={selectedPending.size === 0}
              className="h-7 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          }
        >
          {pendingArticles.map(article => (
            <PipelineCard
              key={article.id}
              article={article}
              isSelected={selectedPending.has(article.id)}
              onSelect={() => toggleSelection(selectedPending, article.id, setSelectedPending)}
              onRewrite={() => addToQueue({ articleId: article.id })}
              onPublish={() => publishArticle(article.id)}
              onDelete={() => {
                setArticlesToDelete([article.id]);
                setDeleteDialogOpen(true);
              }}
              isQueued={queuedArticleIds.has(article.id)}
            />
          ))}
        </PipelineColumn>

        {/* Published Column */}
        <PipelineColumn
          title="Publicadas"
          icon={CheckCircle}
          count={publishedArticles.length}
          color="success"
          emptyMessage="Nenhum artigo publicado"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              className="h-7"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          }
        >
          {publishedArticles.map(article => (
            <PipelineCard
              key={article.id}
              article={article}
              showCheckbox={false}
              onUnpublish={() => unpublishArticle(article.id)}
              onDelete={() => {
                setArticlesToDelete([article.id]);
                setDeleteDialogOpen(true);
              }}
            />
          ))}
        </PipelineColumn>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar artigos?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que pretende eliminar {articlesToDelete.length} artigo(s)?
              Esta acção não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
