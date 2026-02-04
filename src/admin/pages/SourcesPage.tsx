import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Source, CREDIBILITY_LABELS, SOURCE_TYPE_LABELS } from '../types/admin';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'rss' as Source['type'],
    credibility: 'medium' as Source['credibility'],
    is_active: true,
    fetch_interval_minutes: 5,
  });

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .order('name');

    if (error) {
      toast.error('Erro ao carregar fontes');
    } else {
      setSources((data || []) as Source[]);
    }
    setIsLoading(false);
  };

  const handleOpenDialog = (source?: Source) => {
    if (source) {
      setEditingSource(source);
      setFormData({
        name: source.name,
        url: source.url,
        type: source.type,
        credibility: source.credibility,
        is_active: source.is_active,
        fetch_interval_minutes: source.fetch_interval_minutes,
      });
    } else {
      setEditingSource(null);
      setFormData({
        name: '',
        url: '',
        type: 'rss',
        credibility: 'medium',
        is_active: true,
        fetch_interval_minutes: 5,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingSource) {
        const { error } = await supabase
          .from('sources')
          .update(formData)
          .eq('id', editingSource.id);

        if (error) throw error;
        toast.success('Fonte actualizada');
      } else {
        const { error } = await supabase
          .from('sources')
          .insert([formData]);

        if (error) throw error;
        toast.success('Fonte adicionada');
      }

      setIsDialogOpen(false);
      fetchSources();
    } catch (error) {
      toast.error('Erro ao guardar fonte');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar esta fonte?')) return;

    try {
      const { error } = await supabase
        .from('sources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Fonte eliminada');
      fetchSources();
    } catch (error) {
      toast.error('Erro ao eliminar fonte');
    }
  };

  const toggleActive = async (source: Source) => {
    try {
      const { error } = await supabase
        .from('sources')
        .update({ is_active: !source.is_active })
        .eq('id', source.id);

      if (error) throw error;
      toast.success(source.is_active ? 'Fonte desactivada' : 'Fonte activada');
      fetchSources();
    } catch (error) {
      toast.error('Erro ao alterar estado');
    }
  };

  return (
    <AdminLayout title="Fontes">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Gerir fontes de notícias (RSS, websites, APIs).
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Nova fonte
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSource ? 'Editar Fonte' : 'Nova Fonte'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Lusa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) => setFormData({ ...formData, type: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rss">RSS</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Credibilidade</Label>
                    <Select
                      value={formData.credibility}
                      onValueChange={(v) => setFormData({ ...formData, credibility: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interval">Intervalo de captura (min)</Label>
                  <Input
                    id="interval"
                    type="number"
                    value={formData.fetch_interval_minutes}
                    onChange={(e) => setFormData({ ...formData, fetch_interval_minutes: parseInt(e.target.value) })}
                    min={1}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="active">Fonte activa</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Credibilidade</TableHead>
                <TableHead>Capturas</TableHead>
                <TableHead>Última captura</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{SOURCE_TYPE_LABELS[source.type]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        source.credibility === 'high'
                          ? 'border-green-500 text-green-600'
                          : source.credibility === 'low'
                          ? 'border-red-500 text-red-600'
                          : 'border-yellow-500 text-yellow-600'
                      }
                    >
                      {CREDIBILITY_LABELS[source.credibility]}
                    </Badge>
                  </TableCell>
                  <TableCell>{source.articles_captured}</TableCell>
                  <TableCell>
                    {source.last_fetch_at
                      ? format(new Date(source.last_fetch_at), "d MMM 'às' HH:mm", { locale: pt })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={source.is_active}
                      onCheckedChange={() => toggleActive(source)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenDialog(source)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(source.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {sources.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhuma fonte configurada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
