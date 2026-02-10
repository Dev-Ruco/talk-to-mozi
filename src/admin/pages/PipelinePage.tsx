import { useState } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { PipelineBoard } from '../components/pipeline/PipelineBoard';
import { Workflow, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePipeline } from '../hooks/usePipeline';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function PipelinePage() {
  const { resetPipeline, isResetting, inboxArticles, pendingArticles, publishedArticles } = usePipeline();
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Workflow className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pipeline Editorial</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Acompanhe o fluxo de artigos em tempo real
                </p>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-xs">{inboxArticles.length} inbox</Badge>
                  <Badge variant="secondary" className="text-xs">{pendingArticles.length} pendentes</Badge>
                  <Badge variant="secondary" className="text-xs">{publishedArticles.length} publicadas</Badge>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetOpen(true)}
            disabled={isResetting}
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          >
            {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Reiniciar Pipeline
          </Button>
        </div>

        {/* Pipeline Board */}
        <PipelineBoard />
      </div>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reiniciar Pipeline?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza? Isto vai eliminar todos os artigos não publicados do pipeline.
              Artigos já publicados não serão afectados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { resetPipeline(); setResetOpen(false); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reiniciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
