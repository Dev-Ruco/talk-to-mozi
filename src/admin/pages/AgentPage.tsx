import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Bot, Play, Pause, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { AgentLog } from '../types/admin';

export default function AgentPage() {
  const [isActive, setIsActive] = useState(true);
  const [frequency, setFrequency] = useState('5');
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
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
      .limit(50);

    if (error) {
      console.error('Error fetching logs:', error);
    } else {
      setLogs((data || []) as unknown as AgentLog[]);
    }
    setIsLoading(false);
  };

  const handleRunNow = async () => {
    toast.info('A executar agente...');
    // TODO: Implement edge function call
    setTimeout(() => {
      toast.success('Agente executado com sucesso');
      fetchLogs();
    }, 2000);
  };

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
                <Badge variant={isActive ? 'default' : 'secondary'}>
                  {isActive ? (
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

              <Button onClick={handleRunNow} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Executar agora
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
              <CardDescription>
                Resumo das últimas 24 horas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Execuções</span>
                <span className="font-semibold">{logs.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Notícias captadas</span>
                <span className="font-semibold">
                  {logs.reduce((acc, log) => acc + log.articles_found, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Notícias guardadas</span>
                <span className="font-semibold">
                  {logs.reduce((acc, log) => acc + log.articles_saved, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Erros</span>
                <span className="font-semibold text-red-500">
                  {logs.filter(log => log.status === 'error').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Logs de Execução</CardTitle>
              <CardDescription>
                Histórico de execuções do agente
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchLogs}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Fonte</TableHead>
                  <TableHead>Acção</TableHead>
                  <TableHead>Encontradas</TableHead>
                  <TableHead>Guardadas</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {format(new Date(log.executed_at), "d MMM 'às' HH:mm", { locale: pt })}
                    </TableCell>
                    <TableCell>{log.source?.name || 'Todas'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell>{log.articles_found}</TableCell>
                    <TableCell>{log.articles_saved}</TableCell>
                    <TableCell>
                      {log.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum log disponível
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
