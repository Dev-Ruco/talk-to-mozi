import { Bot, Loader2, Zap, Timer, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PipelineArticle, RewriteQueueItem } from '../../hooks/usePipeline';
import { PipelineCard } from './PipelineCard';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';
import { useAgentSettings } from '../../hooks/useAgentSettings';

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
  const [countdown, setCountdown] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<string>('0:00');
  const { data: agentSettings } = useAgentSettings();
  const totalCount = (processingArticle ? 1 : 0) + queuedItems.length;

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate elapsed time since processing started
  useEffect(() => {
    if (processingItem?.started_at) {
      const updateElapsed = () => {
        const startTime = new Date(processingItem.started_at!).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        setElapsedTime(formatTime(elapsedSeconds));
      };
      
      updateElapsed();
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedTime('0:00');
    }
  }, [processingItem?.started_at]);

  // Countdown timer for next processing
  useEffect(() => {
    if (!processingArticle && queuedItems.length > 0 && agentSettings) {
      const intervalMinutes = parseInt(agentSettings.rewrite_interval_minutes) || 2;
      const intervalSeconds = intervalMinutes * 60;
      
      setCountdown(intervalSeconds);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) return intervalSeconds;
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [processingArticle, queuedItems.length, agentSettings]);

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
                <PipelineCard
                  article={processingArticle}
                  isProcessing
                  showCheckbox={false}
                />
                <div className="space-y-1">
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Bot className="h-3 w-3 animate-pulse text-primary" />
                      Reformulando com IA...
                    </span>
                    <span className="font-mono">{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Next processing countdown */}
            {!processingArticle && queuedItems.length > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm border border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Timer className="h-4 w-4" />
                  <span>Próximo processamento em:</span>
                </div>
                <div className="flex items-center gap-1 font-mono font-semibold text-primary">
                  <span>{formatTime(countdown)}</span>
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
