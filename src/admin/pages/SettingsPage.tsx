import { useState } from 'react';
import { Save, Settings, Globe, Bot, Bell, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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

export default function SettingsPage() {
  // General settings
  const [siteName, setSiteName] = useState('B NEWS');
  const [siteUrl, setSiteUrl] = useState('https://bnews.co.mz');
  const [defaultLanguage, setDefaultLanguage] = useState('pt-MZ');
  
  // Agent settings
  const [agentEnabled, setAgentEnabled] = useState(true);
  const [agentInterval, setAgentInterval] = useState('5');
  const [autoRewrite, setAutoRewrite] = useState(false);
  const [duplicateThreshold, setDuplicateThreshold] = useState('0.85');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [notifyOnCapture, setNotifyOnCapture] = useState(false);
  const [notifyOnError, setNotifyOnError] = useState(true);
  
  // Display settings
  const [articlesPerPage, setArticlesPerPage] = useState('10');
  const [showReadingTime, setShowReadingTime] = useState(true);
  const [showAuthor, setShowAuthor] = useState(true);

  const handleSave = () => {
    // TODO: Save to database or edge config
    toast.success('Definições guardadas com sucesso');
  };

  return (
    <AdminLayout title="Definições">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="agent">Agente IA</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="display">Apresentação</TabsTrigger>
        </TabsList>

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
        </TabsContent>

        {/* Agent Settings */}
        <TabsContent value="agent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Configurações do Agente IA
              </CardTitle>
              <CardDescription>
                Controle o comportamento do agente de captura automática
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
              
              <div className="space-y-2">
                <Label>Intervalo de Execução</Label>
                <Select value={agentInterval} onValueChange={setAgentInterval}>
                  <SelectTrigger className="w-48">
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
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reescrita Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Usar IA para reescrever artigos automaticamente
                  </p>
                </div>
                <Switch
                  checked={autoRewrite}
                  onCheckedChange={setAutoRewrite}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Limiar de Detecção de Duplicados</Label>
                <Select value={duplicateThreshold} onValueChange={setDuplicateThreshold}>
                  <SelectTrigger className="w-48">
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
                  Artigos com similaridade acima deste valor serão marcados como duplicados
                </p>
              </div>
            </CardContent>
          </Card>
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

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Definições
        </Button>
      </div>
    </AdminLayout>
  );
}
