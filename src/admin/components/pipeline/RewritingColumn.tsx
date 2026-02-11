import { Bot, Loader2, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PipelineArticle, RewriteQueueItem } from '../../hooks/usePipeline';
import { PipelineCard } from './PipelineCard';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';

const ESTIMATED_DURATION_SECONDS = 90;

interface RewritingColumnProps {
  processingArticle: PipelineArticle | null;
  processingItem: RewriteQueueItem | null;
  queuedItems: Array<RewriteQueueItem & { article?: PipelineArticle }>;
  onSkipQueue: (articleId: string) => void;
  onForceRewrite: (articleId: string) => void;
  onTriggerProcessQueue: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function RewritingColumn({
  processingArticle,
  processingItem,
  queuedItems,
  onSkipQueue,
  onForceRewrite,
}: RewritingColumnProps) {
  const [realProgress, setRealProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState('0:00');
  const totalCount = (processingArticle ? 1 : 0) + queuedItems.length;

  // Real progress based on started_at from DB
  useEffect(() => {
    if (!processingItem?.started_at) {
      setRealProgress(0);
      setElapsedTime('0:00');
      return;
    }

    const updateProgress = () => {
      const startTime = new Date(processingItem.started_at!).getTime();
      const elapsed = (Date.now() - startTime) / 1000;
      const pct = Math.min(95, (elapsed / ESTIMATED_DURATION_SECONDS) * 100);
      setRealProgress(pct);
      setElapsedTime(formatTime(Math.floor(elapsed)));
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [processingItem?.started_at]);

  // When processing completes (item disappears via realtime), jump to 100%
  useEffect(() => {
    if (!processingItem) {
      setRealProgress(prev => (prev > 0 ? 100 : 0));
    }
  }, [processingItem]);

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
              <div className="space-y-2 rounded-lg bg-primary/10 p-3 border border-primary/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-primary">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    A REFORMULAR AGORA
                  </div>
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono">{elapsedTime}</span>
                  </div>
                </div>

                {/* Article title */}
                <p className="text-sm font-medium line-clamp-2">
                  "{processingArticle.title}"
                </p>

                <PipelineCard
                  article={processingArticle}
                  isProcessing
                  showCheckbox={false}
                />
                <div className="space-y-1">
                  <Progress value={realProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Bot className="h-3 w-3 animate-pulse text-primary" />
                      Reformulando com IA...
                    </span>
                    <span className="font-mono">{Math.round(realProgress)}%</span>
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
                      onForceRewrite={() => onForceRewrite(item.article_id)}
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
