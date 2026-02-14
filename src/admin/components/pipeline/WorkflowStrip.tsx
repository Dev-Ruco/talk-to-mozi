import { Rss, Filter, Bot, CheckCircle, Flag, RotateCcw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorkflowStatus, NodeStatus } from '../../hooks/useWorkflowStatus';

const NODE_ICONS: Record<string, React.ElementType> = {
  fetch: Rss,
  normalize: Filter,
  rewrite: Bot,
  validate: CheckCircle,
  complete: Flag,
};

const STATUS_COLORS: Record<NodeStatus, string> = {
  idle: 'border-muted-foreground/30 bg-muted/50 text-muted-foreground',
  running: 'border-primary bg-primary/10 text-primary',
  success: 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400',
  error: 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400',
};

const STATUS_LABELS: Record<NodeStatus, string> = {
  idle: 'Espera',
  running: 'A processar',
  success: 'OK',
  error: 'Erro',
};

interface WorkflowStripProps {
  onReset?: () => void;
  isResetting?: boolean;
}

export function WorkflowStrip({ onReset, isResetting }: WorkflowStripProps) {
  const { nodeStatuses, isAgentRunning, lastExecution } = useWorkflowStatus();

  const lastTime = lastExecution?.executed_at
    ? formatDistanceToNow(new Date(lastExecution.executed_at), { addSuffix: true, locale: pt })
    : null;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {onReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={isResetting}
              className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              Reiniciar
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant={isAgentRunning ? 'default' : 'secondary'}>
            {isAgentRunning ? (
              <><span className="mr-1.5 h-2 w-2 rounded-full bg-yellow-400 animate-pulse inline-block" />A executar</>
            ) : (
              <><span className="mr-1.5 h-2 w-2 rounded-full bg-green-400 inline-block" />Pronto</>
            )}
          </Badge>
          {lastTime && (
            <span className="text-xs text-muted-foreground">Última: {lastTime}</span>
          )}
        </div>
      </div>

      {/* Workflow nodes */}
      <div className="flex items-center gap-0 overflow-x-auto py-2">
        {nodeStatuses.map((node, i) => {
          const Icon = NODE_ICONS[node.id] || CheckCircle;
          return (
            <div key={node.id} className="flex items-center">
              {i > 0 && (
                <div className={cn(
                  'h-0.5 w-6 sm:w-10 transition-colors duration-500 flex-shrink-0',
                  nodeStatuses[i - 1].status === 'success' ? 'bg-green-500' : 'bg-muted'
                )} />
              )}
              <motion.div
                animate={node.status === 'running' ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={node.status === 'running' ? { repeat: Infinity, duration: 1.5 } : {}}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 sm:p-3 min-w-[80px] sm:min-w-[100px] transition-colors duration-300',
                  STATUS_COLORS[node.status]
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">{node.label}</span>
                <span className={cn(
                  'text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                  node.status === 'running' && 'bg-primary/20',
                  node.status === 'success' && 'bg-green-500/20',
                  node.status === 'error' && 'bg-red-500/20',
                )}>
                  {STATUS_LABELS[node.status]}
                </span>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
