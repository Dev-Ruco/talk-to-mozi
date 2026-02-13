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

function computeNodeStatuses(logs: AgentLog[]): { nodes: WorkflowNode[]; agentRunning: boolean } {
  // Logs are ordered DESC (newest first)
  const startIdx = logs.findIndex(l => l.action === 'agent_start');
  const completeIdx = logs.findIndex(l => l.action === 'agent_complete');

  // Agent is running only if agent_start exists and no agent_complete is more recent
  const agentRunning = startIdx >= 0 && (completeIdx < 0 || completeIdx > startIdx);

  // If agent is NOT running, all nodes idle
  if (!agentRunning) {
    return {
      agentRunning: false,
      nodes: NODE_DEFINITIONS.map(def => ({ ...def, status: 'idle' as NodeStatus })),
    };
  }

  // Agent IS running — use logs from newest down to (and including) agent_start
  const currentRunLogs = logs.slice(0, startIdx + 1);

  const nodes = NODE_DEFINITIONS.map(def => {
    const nodeLogs = currentRunLogs.filter(l => def.actions.includes(l.action || ''));
    let status: NodeStatus = 'idle';

    if (nodeLogs.length > 0) {
      const hasError = nodeLogs.some(l => l.status === 'error');
      // Most recent log for this node determines running vs success
      const mostRecent = nodeLogs[0];
      if (hasError) status = 'error';
      else if (mostRecent.status === 'success') status = 'success';
      else status = 'running';
    } else {
      // If a later node is already active, this one implicitly succeeded
      const nodeIdx = NODE_DEFINITIONS.indexOf(def);
      const laterActive = NODE_DEFINITIONS.slice(nodeIdx + 1).some(laterDef =>
        currentRunLogs.some(l => laterDef.actions.includes(l.action || ''))
      );
      if (laterActive) status = 'success';
    }

    return { ...def, status };
  });

  return { nodes, agentRunning: true };
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

  const { nodes: nodeStatuses, agentRunning: isAgentActive } = computeNodeStatuses(logs);

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
    isAgentRunning: isAgentActive || isRunning,
    isManualRunning: isRunning,
    lastExecution,
    recentLogs,
    allLogs: logs,
    isLoading,
    runAgent,
  };
}
