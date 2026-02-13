import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Bot, RefreshCw, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Info, Settings } from 'lucide-react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { AgentLog } from '../types/admin';
import { useNavigate } from 'react-router-dom';

// Status icons
function StatusIcon({ status }: { status: string | null }) {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />;
    default:
      return <Info className="h-4 w-4 text-muted-foreground" />;
  }
}

// Action labels
const ACTION_LABELS: Record<string, string> = {
  agent_start: 'Agente Iniciado',
  fetch_start: 'A Obter Fonte',
  fetch_complete: 'Fetch Concluído',
  parse_rss: 'A Analisar RSS',
  duplicate_check: 'Verificação de Duplicados',
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

function LogItem({ log }: { log: AgentLog }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasDetails = log.details && Object.keys(log.details).length > 0;

  return (
    <div className={`border-l-2 pl-3 py-2 ${
      log.status === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' :
      log.status === 'success' ? 'border-green-500' :
      'border-blue-500'
    }`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2">
          <StatusIcon status={log.status} />
          <span className="text-xs text-muted-foreground">
            {format(new Date(log.executed_at), 'HH:mm:ss', { locale: pt })}
          </span>
          <span className="font-medium text-sm">
            {ACTION_LABELS[log.action || ''] || log.action}
          </span>
          {log.source && (
            <Badge variant="outline" className="text-xs">
              {log.source.name}
            </Badge>
          )}
          {(log.articles_found > 0 || log.articles_saved > 0) && (
            <span className="text-xs text-muted-foreground">
              {log.articles_found > 0 && `${log.articles_found} encontrados`}
              {log.articles_found > 0 && log.articles_saved > 0 && ' · '}
              {log.articles_saved > 0 && `${log.articles_saved} guardados`}
            </span>
          )}
          {hasDetails && (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto">
                {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
          )}
        </div>
        {log.error_message && (
          <p className="text-xs text-red-600 mt-1">{log.error_message}</p>
        )}
        {hasDetails && (
          <CollapsibleContent>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

export default function AgentPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLogs();
    
    const channel = supabase
      .channel('agent_logs_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_logs' },
        async (payload) => {
          const { data: newLog } = await supabase
            .from('agent_logs')
            .select('*, source:sources(name)')
            .eq('id', payload.new.id)
            .single();
          
          if (newLog) {
            setLogs(prev => [newLog as unknown as AgentLog, ...prev.slice(0, 99)]);
            if (scrollRef.current) scrollRef.current.scrollTop = 0;
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('agent_logs')
      .select('*, source:sources(name)')
      .order('executed_at', { ascending: false })
      .limit(100);

    if (!error) setLogs((data || []) as unknown as AgentLog[]);
    setIsLoading(false);
  };

  // Stats from logs
  const recentLogs = logs.filter(log => 
    new Date(log.executed_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
  );
  const completeLogs = recentLogs.filter(log => log.action === 'agent_complete' || log.action === 'source_complete');
  const totalFound = completeLogs.reduce((acc, log) => acc + (log.articles_found || 0), 0);
  const totalSaved = completeLogs.reduce((acc, log) => acc + (log.articles_saved || 0), 0);
  const errorCount = recentLogs.filter(log => log.status === 'error').length;

  return (
    <AdminLayout title="Logs do Agente IA">
      <div className="space-y-6">
        {/* Header with link to settings */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Histórico Completo de Logs</h2>
            <p className="text-sm text-muted-foreground">Acompanhe cada etapa da execução do agente</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/settings')} className="gap-2">
            <Settings className="h-4 w-4" />
            Configurar agente
          </Button>
        </div>

        {/* 24h Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{completeLogs.length}</p>
              <p className="text-xs text-muted-foreground">Execuções (24h)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{totalFound}</p>
              <p className="text-xs text-muted-foreground">Encontradas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{totalSaved}</p>
              <p className="text-xs text-muted-foreground">Guardadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-500">{errorCount}</p>
              <p className="text-xs text-muted-foreground">Erros</p>
            </CardContent>
          </Card>
        </div>

        {/* Full Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Logs em Tempo Real</CardTitle>
              <CardDescription>Todos os logs com detalhes expandíveis</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]" ref={scrollRef}>
              <div className="space-y-1">
                {logs.map((log) => (
                  <LogItem key={log.id} log={log} />
                ))}
                {logs.length === 0 && !isLoading && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum log disponível.
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
