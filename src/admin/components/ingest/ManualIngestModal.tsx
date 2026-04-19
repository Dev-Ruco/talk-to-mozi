import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, FileText, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { categories } from '@/data/categories';
import { useNavigate } from 'react-router-dom';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManualIngestModal({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Texto puro
  const [tTitle, setTTitle] = useState('');
  const [tLead, setTLead] = useState('');
  const [tContent, setTContent] = useState('');
  const [tCategory, setTCategory] = useState<string>('');
  const [tSourceName, setTSourceName] = useState('');
  const [tSourceUrl, setTSourceUrl] = useState('');

  // Link
  const [lUrl, setLUrl] = useState('');
  const [lCategory, setLCategory] = useState<string>('');
  const [lSourceName, setLSourceName] = useState('');

  const reset = () => {
    setTTitle(''); setTLead(''); setTContent(''); setTCategory(''); setTSourceName(''); setTSourceUrl('');
    setLUrl(''); setLCategory(''); setLSourceName('');
  };

  const submitText = async () => {
    if (!tTitle.trim() || !tContent.trim()) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('manual-ingest', {
        body: {
          mode: 'text',
          title: tTitle.trim(),
          lead: tLead.trim() || undefined,
          content: tContent.trim(),
          category: tCategory || undefined,
          source_name: tSourceName.trim() || undefined,
          source_url: tSourceUrl.trim() || undefined,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success('Notícia adicionada com sucesso');
      reset();
      onOpenChange(false);
      if (data?.article_id) navigate(`/admin/article/${data.article_id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao adicionar notícia');
    } finally {
      setSubmitting(false);
    }
  };

  const submitLink = async () => {
    if (!lUrl.trim()) {
      toast.error('URL é obrigatório');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('manual-ingest', {
        body: {
          mode: 'link',
          url: lUrl.trim(),
          category: lCategory || undefined,
          source_name: lSourceName.trim() || undefined,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.extract_error) {
        toast.warning(`Guardado, mas extracção falhou: ${data.extract_error}. Complete manualmente.`);
      } else {
        toast.success(`Notícia importada (${data?.extracted_chars || 0} caracteres extraídos)`);
      }
      reset();
      onOpenChange(false);
      if (data?.article_id) navigate(`/admin/article/${data.article_id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao importar link');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar notícia manualmente</DialogTitle>
          <DialogDescription>
            Importe uma notícia por texto puro ou por link. Os artigos manuais ficam disponíveis para edição imediata.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">
              <FileText className="mr-2 h-4 w-4" /> Texto puro
            </TabsTrigger>
            <TabsTrigger value="link">
              <Link2 className="mr-2 h-4 w-4" /> Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-3 pt-3">
            <div>
              <Label htmlFor="t-title">Título *</Label>
              <Input id="t-title" value={tTitle} onChange={e => setTTitle(e.target.value)}
                placeholder="Título da notícia" />
            </div>
            <div>
              <Label htmlFor="t-lead">Lead (opcional)</Label>
              <Textarea id="t-lead" value={tLead} onChange={e => setTLead(e.target.value)}
                rows={2} placeholder="Resumo de 1-2 frases" />
            </div>
            <div>
              <Label htmlFor="t-content">Conteúdo *</Label>
              <Textarea id="t-content" value={tContent} onChange={e => setTContent(e.target.value)}
                rows={8} placeholder="Corpo da notícia" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="t-cat">Categoria</Label>
                <Select value={tCategory} onValueChange={setTCategory}>
                  <SelectTrigger id="t-cat"><SelectValue placeholder="Escolher" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="t-src">Fonte (opcional)</Label>
                <Input id="t-src" value={tSourceName} onChange={e => setTSourceName(e.target.value)}
                  placeholder="Ex: Lusa" />
              </div>
            </div>
            <div>
              <Label htmlFor="t-url">URL original (opcional)</Label>
              <Input id="t-url" value={tSourceUrl} onChange={e => setTSourceUrl(e.target.value)}
                placeholder="https://..." />
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-3 pt-3">
            <div>
              <Label htmlFor="l-url">URL *</Label>
              <Input id="l-url" value={lUrl} onChange={e => setLUrl(e.target.value)}
                placeholder="https://exemplo.com/noticia" />
              <p className="mt-1 text-xs text-muted-foreground">
                Tentaremos extrair título e conteúdo. Se não for possível, guardaremos o link e poderá completar manualmente.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="l-cat">Categoria</Label>
                <Select value={lCategory} onValueChange={setLCategory}>
                  <SelectTrigger id="l-cat"><SelectValue placeholder="Escolher" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="l-src">Fonte (opcional)</Label>
                <Input id="l-src" value={lSourceName} onChange={e => setLSourceName(e.target.value)}
                  placeholder="Ex: Lusa" />
              </div>
            </div>
          </TabsContent>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancelar
            </Button>
            <TabsContent value="text" className="m-0">
              <Button onClick={submitText} disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Adicionar
              </Button>
            </TabsContent>
            <TabsContent value="link" className="m-0">
              <Button onClick={submitLink} disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Importar
              </Button>
            </TabsContent>
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
