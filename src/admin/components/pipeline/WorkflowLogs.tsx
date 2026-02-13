import { useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChevronDown, ChevronRight, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useWorkflowStatus } from '../../hooks/useWorkflowStatus';

const ACTION_LABELS: Record<string, string> = {
  agent_start: 'Agente Iniciado',
  fetch_start: 'A Obter Fonte',
  fetch_complete: 'Fetch Concluído',
  parse_rss: 'A Analisar RSS',
  duplicate_check: 'Verificação Duplicados',
  article_save: 'Artigo Guardado',
  source_complete: 'Fonte Concluída',
  agent_complete: 'Agente Concluído',
  ai_rewrite: 'IA a Reformular',
  ai_complete: 'Reformulação Concluída',
  ai_auto_rewrite: 'IA Auto-Reformular',
  ai_auto_complete: 'Auto-Reformulação OK',
  ai_auto_error: 'Erro Reformulação',
  fetch_rss: 'Fetch RSS',
};

function StatusIcon({ status }: { status: string | null }) {
  if (status === 'success') return <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />;
  if (status === 'error') return <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />;
  return <Info className="h-3 w-3 text-blue-500 flex-shrink-0" />;
}

export function WorkflowLogs() {
  const { recentLogs, isLoading } = useWorkflowStatus();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading || recentLogs.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground h-8 px-2">
          {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          Logs do agente ({recentLogs.length})
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="rounded-lg border bg-muted/30 p-3 mt-2 max-h-[200px] overflow-y-auto space-y-0.5">
          <AnimatePresence initial={false}>
            {recentLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex items-center gap-2 text-xs py-1 px-1.5 rounded',
                  log.status === 'error' && 'bg-red-500/10'
                )}
              >
                <StatusIcon status={log.status} />
                <span className="text-muted-foreground font-mono w-[60px] flex-shrink-0">
                  {format(new Date(log.executed_at), 'HH:mm:ss', { locale: pt })}
                </span>
                <span className="font-medium truncate">
                  {ACTION_LABELS[log.action || ''] || log.action}
                </span>
                {log.source && (
                  <span className="text-muted-foreground truncate">
                    — {typeof log.source === 'object' && 'name' in log.source ? log.source.name : ''}
                  </span>
                )}
                {log.error_message && (
                  <span className="text-red-500 truncate ml-auto">{log.error_message}</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
