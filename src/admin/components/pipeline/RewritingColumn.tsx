import { Bot, Loader2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PipelineArticle, RewriteQueueItem } from '../../hooks/usePipeline';
import { PipelineCard } from './PipelineCard';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';

interface RewritingColumnProps {
  processingArticle: PipelineArticle | null;
  processingItem: RewriteQueueItem | null;
  queuedItems: Array<RewriteQueueItem & { article?: PipelineArticle }>;
  onSkipQueue: (articleId: string) => void;
}

export function RewritingColumn({
  processingArticle,
  processingItem,
  queuedItems,
  onSkipQueue,
}: RewritingColumnProps) {
  const [progress, setProgress] = useState(0);
  const totalCount = (processingArticle ? 1 : 0) + queuedItems.length;

  // Simulate progress animation when processing
  useEffect(() => {
    if (processingItem?.started_at) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          // Slow down as we approach 100%
          const increment = Math.max(1, (100 - prev) / 20);
          return Math.min(95, prev + increment);
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [processingItem?.started_at]);

  return (
    <div className="flex h-full min-w-[280px] flex-col rounded-xl border border-primary/30 bg-primary/5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-primary/30 p-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Em Reformulação</h3>
          <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
            {totalCount}
          </Badge>
        </div>
        {processingArticle && (
          <div className="flex items-center gap-1 text-xs text-primary">
            <Loader2 className="h-3 w-3 animate-spin" />
            A processar...
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-2">
        {totalCount === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <Bot className="h-8 w-8 opacity-50" />
            <p>Nenhum artigo na fila</p>
            <p className="text-xs">Seleccione artigos no Inbox para reformular</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Currently processing */}
            {processingArticle && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  A REFORMULAR AGORA
                </div>
                <PipelineCard
                  article={processingArticle}
                  isProcessing
                  showCheckbox={false}
                />
                <div className="space-y-1">
                  <Progress value={progress} className="h-1.5" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Reformulando...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Queue */}
            {queuedItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  FILA DE ESPERA ({queuedItems.length})
                </div>
                {queuedItems.map((item, index) => (
                  item.article && (
                    <PipelineCard
                      key={item.id}
                      article={item.article}
                      isQueued
                      queuePosition={index + 1}
                      showCheckbox={false}
                      onSkipQueue={() => onSkipQueue(item.article_id)}
                    />
                  )
                ))}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
