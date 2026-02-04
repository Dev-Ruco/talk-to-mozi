import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Bot, Play, RefreshCw, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { AgentLog } from '../types/admin';

// Action labels in Portuguese
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
  fetch_rss: 'Fetch RSS',
};

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

// Log item component
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
  const [isActive, setIsActive] = useState(true);
  const [frequency, setFrequency] = useState('5');
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLogs();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('agent_logs_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_logs' },
        async (payload) => {
          console.log('New log received:', payload);
          // Fetch the full log with source relation
          const { data: newLog } = await supabase
            .from('agent_logs')
            .select(`
              *,
              source:sources(name)
            `)
            .eq('id', payload.new.id)
            .single();
          
          if (newLog) {
            setLogs(prev => [newLog as unknown as AgentLog, ...prev.slice(0, 99)]);
            
            // Auto-scroll to top when new logs arrive
            if (scrollRef.current) {
              scrollRef.current.scrollTop = 0;
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('agent_logs')
      .select(`
        *,
        source:sources(name)
      `)
      .order('executed_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching logs:', error);
    } else {
      setLogs((data || []) as unknown as AgentLog[]);
    }
    setIsLoading(false);
  };

  const handleRunNow = async () => {
    setIsRunning(true);
    toast.info('A executar agente...');
    try {
      const { data, error } = await supabase.functions.invoke('news-agent');
      
      if (error) {
        toast.error('Erro ao executar agente: ' + error.message);
      } else {
        toast.success(
          `Agente executado: ${data.articles_found} encontradas, ${data.articles_saved} guardadas` +
          (data.duplicates_skipped ? ` (${data.duplicates_skipped} duplicados ignorados)` : '')
        );
      }
    } catch (err) {
      toast.error('Erro de comunicação com o agente');
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  // Calculate stats from logs
  const recentLogs = logs.filter(log => 
    new Date(log.executed_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
  );
  const completeLogs = recentLogs.filter(log => log.action === 'agent_complete' || log.action === 'source_complete');
  const totalFound = completeLogs.reduce((acc, log) => acc + (log.articles_found || 0), 0);
  const totalSaved = completeLogs.reduce((acc, log) => acc + (log.articles_saved || 0), 0);
  const errorCount = recentLogs.filter(log => log.status === 'error').length;

  return (
    <AdminLayout title="Agente IA">
      <div className="space-y-6">
        {/* Status Card */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Estado do Agente
              </CardTitle>
              <CardDescription>
                Controle o agente de recolha automática de notícias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="agent-active">Agente activo</Label>
                </div>
                <Switch
                  id="agent-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Frequência</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 minuto</SelectItem>
                    <SelectItem value="5">5 minutos</SelectItem>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado</span>
                <Badge variant={isRunning ? 'default' : isActive ? 'secondary' : 'outline'}>
                  {isRunning ? (
                    <>
                      <span className="mr-1.5 h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                      A Executar...
                    </>
                  ) : isActive ? (
                    <>
                      <span className="mr-1.5 h-2 w-2 rounded-full bg-green-400" />
                      Activo
                    </>
                  ) : (
                    <>
                      <span className="mr-1.5 h-2 w-2 rounded-full bg-gray-400" />
                      Pausado
                    </>
                  )}
                </Badge>
              </div>

              <Button onClick={handleRunNow} className="w-full" disabled={isRunning}>
                <Play className="mr-2 h-4 w-4" />
                {isRunning ? 'A executar...' : 'Executar agora'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas (24h)</CardTitle>
              <CardDescription>
                Resumo das últimas 24 horas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Execuções</span>
                <span className="font-semibold">{completeLogs.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Notícias encontradas</span>
                <span className="font-semibold">{totalFound}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Notícias guardadas</span>
                <span className="font-semibold">{totalSaved}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Erros</span>
                <span className="font-semibold text-red-500">{errorCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Realtime Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Logs em Tempo Real</CardTitle>
              <CardDescription>
                Acompanhe cada etapa da execução do agente
              </CardDescription>
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
                    Nenhum log disponível. Execute o agente para ver os logs aqui.
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
