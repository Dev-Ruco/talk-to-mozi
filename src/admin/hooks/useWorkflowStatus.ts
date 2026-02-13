import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AgentLog } from '../types/admin';

export type NodeStatus = 'idle' | 'running' | 'success' | 'error';

export interface WorkflowNode {
  id: string;
  label: string;
  actions: string[];
  status: NodeStatus;
}

const NODE_DEFINITIONS = [
  { id: 'fetch', label: 'RSS Fetch', actions: ['agent_start', 'fetch_start', 'fetch_complete', 'fetch_rss'] },
  { id: 'normalize', label: 'Normalizar', actions: ['parse_rss', 'duplicate_check'] },
  { id: 'rewrite', label: 'IA Reformulação', actions: ['ai_rewrite', 'ai_complete', 'ai_auto_rewrite', 'ai_auto_complete', 'ai_auto_error'] },
  { id: 'validate', label: 'Validar', actions: ['article_save'] },
  { id: 'complete', label: 'Concluído', actions: ['source_complete', 'agent_complete'] },
];

function computeNodeStatuses(logs: AgentLog[]): WorkflowNode[] {
  // Find last agent_start
  const startIdx = logs.findIndex(l => l.action === 'agent_start');
  const currentRunLogs = startIdx >= 0 ? logs.slice(0, startIdx + 1) : [];

  return NODE_DEFINITIONS.map(def => {
    const nodeLogs = currentRunLogs.filter(l => def.actions.includes(l.action || ''));
    let status: NodeStatus = 'idle';

    if (nodeLogs.length > 0) {
      const hasError = nodeLogs.some(l => l.status === 'error');
      const hasRunning = nodeLogs.some(l => l.status === 'info');
      if (hasError) status = 'error';
      else if (hasRunning) status = 'running';
      else status = 'success';
    } else if (startIdx >= 0) {
      // Check if a later node is already active — if so, this one succeeded
      const nodeIdx = NODE_DEFINITIONS.indexOf(def);
      const laterActive = NODE_DEFINITIONS.slice(nodeIdx + 1).some(laterDef =>
        currentRunLogs.some(l => laterDef.actions.includes(l.action || ''))
      );
      if (laterActive) status = 'success';
    }

    return { ...def, status };
  });
}

export function useWorkflowStatus() {
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['workflow-agent-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_logs')
        .select('*, source:sources(name)')
        .order('executed_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as unknown as AgentLog[];
    },
    staleTime: 30000,
  });

  // Realtime subscription
  const refetchRef = useRef(() => queryClient.invalidateQueries({ queryKey: ['workflow-agent-logs'] }));
  useEffect(() => {
    refetchRef.current = () => queryClient.invalidateQueries({ queryKey: ['workflow-agent-logs'] });
  }, [queryClient]);

  useEffect(() => {
    const channel = supabase
      .channel('workflow_logs_rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_logs' }, () => {
        refetchRef.current();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const nodeStatuses = computeNodeStatuses(logs);

  const isAgentRunning = nodeStatuses.some(n => n.status === 'running');

  const lastExecution = logs.find(l => l.action === 'agent_complete' || l.action === 'agent_start');

  const recentLogs = logs.slice(0, 15);

  const runAgent = useCallback(async () => {
    setIsRunning(true);
    toast.info('A executar pipeline...');
    try {
      const { data, error } = await supabase.functions.invoke('news-agent');
      if (error) {
        toast.error('Erro ao executar agente: ' + error.message);
      } else {
        toast.success(
          `Pipeline executado: ${data?.articles_found || 0} encontradas, ${data?.articles_saved || 0} guardadas`
        );
      }
    } catch {
      toast.error('Erro de comunicação com o agente');
    } finally {
      setIsRunning(false);
    }
  }, []);

  return {
    nodeStatuses,
    isAgentRunning: isAgentRunning || isRunning,
    isManualRunning: isRunning,
    lastExecution,
    recentLogs,
    allLogs: logs,
    isLoading,
    runAgent,
  };
}
