import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, TestTube, Download, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Source, CREDIBILITY_LABELS, SOURCE_TYPE_LABELS } from '../types/admin';
import { TagsInput } from '../components/ui/TagsInput';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const emptyForm = {
  name: '',
  url: '',
  feed_url: '',
  type: 'rss' as Source['type'],
  credibility: 'medium' as Source['credibility'],
  categories: [] as string[],
  include_keywords: [] as string[],
  exclude_keywords: [] as string[],
  language: 'pt',
  country: '',
  is_active: true,
  fetch_interval_minutes: 30,
};

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  // Preview / test state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Fetch all state
  const [fetchingAll, setFetchingAll] = useState(false);
  const [fetchingSourceId, setFetchingSourceId] = useState<string | null>(null);

  useEffect(() => { fetchSources(); }, []);

  const fetchSources = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .order('name');
    if (error) toast.error('Erro ao carregar fontes');
    else setSources((data || []) as Source[]);
    setIsLoading(false);
  };

  const handleOpenDialog = (source?: Source) => {
    if (source) {
      setEditingSource(source);
      setFormData({
        name: source.name,
        url: source.url,
        feed_url: source.feed_url || '',
        type: source.type,
        credibility: source.credibility,
        categories: source.categories || [],
        include_keywords: source.include_keywords || [],
        exclude_keywords: source.exclude_keywords || [],
        language: source.language || 'pt',
        country: source.country || '',
        is_active: source.is_active,
        fetch_interval_minutes: source.fetch_interval_minutes,
      });
    } else {
      setEditingSource(null);
      setFormData({ ...emptyForm });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const payload: any = {
      ...formData,
      feed_url: formData.feed_url || null,
      country: formData.country || null,
    };
    try {
      if (editingSource) {
        const { error } = await supabase.from('sources').update(payload).eq('id', editingSource.id);
        if (error) throw error;
        toast.success('Fonte actualizada');
      } else {
        const { error } = await supabase.from('sources').insert([payload]);
        if (error) throw error;
        toast.success('Fonte adicionada');
      }
      setIsDialogOpen(false);
      fetchSources();
    } catch {
      toast.error('Erro ao guardar fonte');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar esta fonte?')) return;
    try {
      const { error } = await supabase.from('sources').delete().eq('id', id);
      if (error) throw error;
      toast.success('Fonte eliminada');
      fetchSources();
    } catch {
      toast.error('Erro ao eliminar fonte');
    }
  };

  const toggleActive = async (source: Source) => {
    try {
      const { error } = await supabase.from('sources').update({ is_active: !source.is_active }).eq('id', source.id);
      if (error) throw error;
      toast.success(source.is_active ? 'Fonte desactivada' : 'Fonte activada');
      fetchSources();
    } catch {
      toast.error('Erro ao alterar estado');
    }
  };

  // ─── Test source (dry_run) ───
  const handleTest = async (source: Source) => {
    setPreviewLoading(true);
    setPreviewData(null);
    setPreviewOpen(true);
    const { data, error } = await supabase.functions.invoke('rss-fetch', {
      body: {
        source_id: source.id,
        dry_run: true,
        limit_items_per_source: 10,
      },
    });
    setPreviewLoading(false);
    if (error) {
      toast.error(`Erro ao testar: ${error.message}`);
      setPreviewOpen(false);
    } else {
      setPreviewData(data);
    }
  };

  // ─── Fetch one source ───
  const handleFetchOne = async (source: Source) => {
    setFetchingSourceId(source.id);
    const { data, error } = await supabase.functions.invoke('rss-fetch', { body: { source_id: source.id } });
    setFetchingSourceId(null);
    if (error) {
      toast.error(`Erro: ${error.message}`);
    } else {
      const r = data?.results?.[0];
      toast.success(`${source.name}: ${r?.inserted || 0} inseridos, ${r?.skipped_duplicates || 0} duplicados`);
      fetchSources();
    }
  };

  // ─── Fetch all ───
  const handleFetchAll = async () => {
    setFetchingAll(true);
    const { data, error } = await supabase.functions.invoke('rss-fetch', { body: {} });
    setFetchingAll(false);
    if (error) {
      toast.error(`Erro: ${error.message}`);
    } else {
      toast.success(`${data?.total_inserted || 0} artigos captados de ${data?.sources_processed || 0} fontes`);
      fetchSources();
    }
  };

  return (
    <AdminLayout title="Fontes">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm text-muted-foreground">
            Gerir fontes de notícias (RSS, websites, APIs).
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleFetchAll} disabled={fetchingAll}>
              {fetchingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Captar tudo
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" /> Nova fonte
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingSource ? 'Editar Fonte' : 'Nova Fonte'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: O País" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">URL base</Label>
                    <Input id="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://opais.co.mz" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feed_url">Feed URL <span className="text-muted-foreground text-xs">(vazio = discovery automático)</span></Label>
                    <Input id="feed_url" value={formData.feed_url} onChange={(e) => setFormData({ ...formData, feed_url: e.target.value })} placeholder="https://opais.co.mz/feed/" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as any })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rss">RSS</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Credibilidade</Label>
                      <Select value={formData.credibility} onValueChange={(v) => setFormData({ ...formData, credibility: v as any })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="low">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Língua</Label>
                      <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt">Português</SelectItem>
                          <SelectItem value="en">Inglês</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">País</Label>
                      <Input id="country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} placeholder="MZ" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Categorias</Label>
                    <TagsInput value={formData.categories} onChange={(v) => setFormData({ ...formData, categories: v })} placeholder="ex: economia, política" />
                  </div>
                  <div className="space-y-2">
                    <Label>Keywords de inclusão</Label>
                    <TagsInput value={formData.include_keywords} onChange={(v) => setFormData({ ...formData, include_keywords: v })} placeholder="Aceitar apenas se contiver..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Keywords de exclusão</Label>
                    <TagsInput value={formData.exclude_keywords} onChange={(v) => setFormData({ ...formData, exclude_keywords: v })} placeholder="Rejeitar se contiver..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interval">Intervalo de captura (min)</Label>
                    <Input id="interval" type="number" value={formData.fetch_interval_minutes} onChange={(e) => setFormData({ ...formData, fetch_interval_minutes: parseInt(e.target.value) || 30 })} min={1} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                    <Label htmlFor="active">Fonte activa</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSave}>Guardar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categorias</TableHead>
                <TableHead>Capturas</TableHead>
                <TableHead>Última captura</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{source.name}</span>
                      <span className="block text-xs text-muted-foreground truncate max-w-[200px]">{source.url}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(source.categories || []).slice(0, 3).map((c) => (
                        <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{source.articles_captured}</TableCell>
                  <TableCell>
                    {source.last_fetch_at
                      ? format(new Date(source.last_fetch_at), "d MMM 'às' HH:mm", { locale: pt })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Switch checked={source.is_active} onCheckedChange={() => toggleActive(source)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" title="Testar" onClick={() => handleTest(source)}>
                        <TestTube className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" title="Captar agora" disabled={fetchingSourceId === source.id} onClick={() => handleFetchOne(source)}>
                        {fetchingSourceId === source.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(source)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(source.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {sources.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">Nenhuma fonte configurada</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Preview — Teste de Fonte</DialogTitle>
          </DialogHeader>
          {previewLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">A descobrir feed e a analisar itens...</span>
            </div>
          ) : previewData ? (
            <ScrollArea className="max-h-[60vh]">
              {previewData.results?.map((r: any) => (
                <div key={r.source_id} className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant={r.error ? 'destructive' : 'default'}>{r.error ? 'Erro' : 'OK'}</Badge>
                    <span className="font-medium">{r.source_name}</span>
                    {r.feed_url && <span className="text-xs text-muted-foreground truncate max-w-[300px]">{r.feed_url}</span>}
                  </div>
                  {r.error && <p className="text-sm text-destructive">{r.error}</p>}
                  <p className="text-xs text-muted-foreground">
                    {r.items_found} encontrados · {r.inserted} aceites · {r.skipped_duplicates} duplicados · {r.skipped_filters} filtrados
                  </p>
                  <div className="space-y-2">
                    {(r.preview || []).map((item: any, i: number) => (
                      <div key={i} className={`rounded border p-2 text-sm ${item.accepted ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.title || '(sem título)'}</p>
                            {item.link && <a href={item.link} target="_blank" rel="noopener" className="text-xs text-primary hover:underline truncate block">{item.link}</a>}
                          </div>
                          <Badge variant={item.accepted ? 'default' : 'destructive'} className="text-xs shrink-0">
                            {item.accepted ? 'Aceite' : 'Rejeitado'}
                          </Badge>
                        </div>
                        {item.reason && <p className="text-xs text-muted-foreground mt-1">Motivo: {item.reason}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
