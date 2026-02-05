import { useEffect, useState } from 'react';
import { Save, Globe, Bot, Bell, Palette, Clock, Zap, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useAgentSettings, useSaveAllAgentSettings } from '../hooks/useAgentSettings';

export default function SettingsPage() {
  // General settings (local state for now)
  const [siteName, setSiteName] = useState('B NEWS');
  const [siteUrl, setSiteUrl] = useState('https://bnews.co.mz');
  const [defaultLanguage, setDefaultLanguage] = useState('pt-MZ');
  
  // Agent settings from database
  const { data: dbSettings, isLoading: isLoadingSettings } = useAgentSettings();
  const { mutate: saveSettings, isPending: isSaving } = useSaveAllAgentSettings();
  
  // Local agent state
  const [agentEnabled, setAgentEnabled] = useState(true);
  const [captureInterval, setCaptureInterval] = useState('5');
  const [rewriteInterval, setRewriteInterval] = useState('2');
  const [maxRewrites, setMaxRewrites] = useState('3');
  const [autoRewrite, setAutoRewrite] = useState(true);
  const [duplicateThreshold, setDuplicateThreshold] = useState('0.85');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [notifyOnCapture, setNotifyOnCapture] = useState(false);
  const [notifyOnError, setNotifyOnError] = useState(true);
  
  // Display settings
  const [articlesPerPage, setArticlesPerPage] = useState('10');
  const [showReadingTime, setShowReadingTime] = useState(true);
  const [showAuthor, setShowAuthor] = useState(true);

  // Sync local state with database settings
  useEffect(() => {
    if (dbSettings) {
      setAgentEnabled(dbSettings.agent_enabled === 'true');
      setCaptureInterval(dbSettings.capture_interval_minutes);
      setRewriteInterval(dbSettings.rewrite_interval_minutes);
      setMaxRewrites(dbSettings.max_rewrites_per_run);
      setAutoRewrite(dbSettings.auto_rewrite_enabled === 'true');
      setDuplicateThreshold(dbSettings.duplicate_threshold);
    }
  }, [dbSettings]);

  const handleSaveAgentSettings = () => {
    saveSettings({
      agent_enabled: agentEnabled ? 'true' : 'false',
      capture_interval_minutes: captureInterval,
      rewrite_interval_minutes: rewriteInterval,
      max_rewrites_per_run: maxRewrites,
      auto_rewrite_enabled: autoRewrite ? 'true' : 'false',
      duplicate_threshold: duplicateThreshold,
    });
  };

  const handleSaveGeneral = () => {
    // TODO: Persist general settings to database
    toast.success('Definições gerais guardadas');
  };

  return (
    <AdminLayout title="Definições">
      <Tabs defaultValue="agent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agent">Agente IA</TabsTrigger>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="display">Apresentação</TabsTrigger>
        </TabsList>

        {/* Agent Settings */}
        <TabsContent value="agent" className="space-y-4">
          {isLoadingSettings ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    Estado do Agente
                  </CardTitle>
                  <CardDescription>
                    Controle o funcionamento do agente de captura automática
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Agente Activo</Label>
                      <p className="text-sm text-muted-foreground">
                        Activar captura automática de notícias
                      </p>
                    </div>
                    <Switch
                      checked={agentEnabled}
                      onCheckedChange={setAgentEnabled}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reformulação Automática</Label>
                      <p className="text-sm text-muted-foreground">
                        Usar IA para reformular artigos automaticamente após captura
                      </p>
                    </div>
                    <Switch
                      checked={autoRewrite}
                      onCheckedChange={setAutoRewrite}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Timing Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-primary" />
                    Ritmo do Agente
                  </CardTitle>
                  <CardDescription>
                    Configure os intervalos de operação do agente para evitar conflitos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Capture Interval */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Intervalo de Captura
                      </Label>
                      <Select value={captureInterval} onValueChange={setCaptureInterval}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 minuto</SelectItem>
                          <SelectItem value="5">5 minutos</SelectItem>
                          <SelectItem value="15">15 minutos</SelectItem>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="60">1 hora</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        A cada quantos minutos o agente verifica novas notícias nas fontes RSS
                      </p>
                    </div>

                    {/* Rewrite Interval */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Intervalo de Reformulação
                      </Label>
                      <Select value={rewriteInterval} onValueChange={setRewriteInterval}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 minuto</SelectItem>
                          <SelectItem value="2">2 minutos</SelectItem>
                          <SelectItem value="5">5 minutos</SelectItem>
                          <SelectItem value="10">10 minutos</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Intervalo entre cada processamento de artigos na fila de reformulação
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Max Rewrites */}
                    <div className="space-y-2">
                      <Label>Artigos por Execução</Label>
                      <Select value={maxRewrites} onValueChange={setMaxRewrites}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 artigo</SelectItem>
                          <SelectItem value="3">3 artigos</SelectItem>
                          <SelectItem value="5">5 artigos</SelectItem>
                          <SelectItem value="10">10 artigos</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Quantos artigos reformular em cada execução (evita timeouts)
                      </p>
                    </div>

                    {/* Duplicate Threshold */}
                    <div className="space-y-2">
                      <Label>Limiar de Duplicados</Label>
                      <Select value={duplicateThreshold} onValueChange={setDuplicateThreshold}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.70">70% (Relaxado)</SelectItem>
                          <SelectItem value="0.80">80% (Normal)</SelectItem>
                          <SelectItem value="0.85">85% (Recomendado)</SelectItem>
                          <SelectItem value="0.90">90% (Rigoroso)</SelectItem>
                          <SelectItem value="0.95">95% (Muito Rigoroso)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Artigos com similaridade acima deste valor são marcados como duplicados
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button for Agent Settings */}
              <div className="flex justify-end">
                <Button onClick={handleSaveAgentSettings} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'A guardar...' : 'Guardar Definições do Agente'}
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Definições Gerais
              </CardTitle>
              <CardDescription>
                Configurações básicas do site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nome do Site</Label>
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">URL do Site</Label>
                  <Input
                    id="siteUrl"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Idioma Padrão</Label>
                <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-MZ">Português (Moçambique)</SelectItem>
                    <SelectItem value="pt-PT">Português (Portugal)</SelectItem>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveGeneral}>
              <Save className="mr-2 h-4 w-4" />
              Guardar Definições Gerais
            </Button>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure como pretende receber alertas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações por email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificar ao Captar</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alerta quando novas notícias forem captadas
                  </p>
                </div>
                <Switch
                  checked={notifyOnCapture}
                  onCheckedChange={setNotifyOnCapture}
                  disabled={!emailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificar Erros</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alerta quando ocorrerem erros no agente
                  </p>
                </div>
                <Switch
                  checked={notifyOnError}
                  onCheckedChange={setNotifyOnError}
                  disabled={!emailNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Settings */}
        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Apresentação
              </CardTitle>
              <CardDescription>
                Configure a aparência do frontend público
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Artigos por Página</Label>
                <Select value={articlesPerPage} onValueChange={setArticlesPerPage}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 artigos</SelectItem>
                    <SelectItem value="10">10 artigos</SelectItem>
                    <SelectItem value="15">15 artigos</SelectItem>
                    <SelectItem value="20">20 artigos</SelectItem>
                    <SelectItem value="25">25 artigos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar Tempo de Leitura</Label>
                  <p className="text-sm text-muted-foreground">
                    Exibir estimativa de tempo de leitura nos artigos
                  </p>
                </div>
                <Switch
                  checked={showReadingTime}
                  onCheckedChange={setShowReadingTime}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar Autor</Label>
                  <p className="text-sm text-muted-foreground">
                    Exibir nome do autor nos artigos
                  </p>
                </div>
                <Switch
                  checked={showAuthor}
                  onCheckedChange={setShowAuthor}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
