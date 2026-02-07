import { useState, useCallback, useEffect } from 'react';
import { Upload, X, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUploadMedia } from '@/admin/hooks/useMedia';
import { toast } from 'sonner';

interface UploadItem {
  file: File;
  preview: string;
  title: string;
  caption: string;
  tags: string[];
  tagInput: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface MediaUploadModalProps {
  open: boolean;
  onClose: () => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

export function MediaUploadModal({ open, onClose }: MediaUploadModalProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [applyToAll, setApplyToAll] = useState(false);
  const [globalTitle, setGlobalTitle] = useState('');
  const [globalCaption, setGlobalCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadMedia = useUploadMedia();

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      items.forEach(item => URL.revokeObjectURL(item.preview));
    };
  }, []);

  const handleClose = () => {
    items.forEach(item => URL.revokeObjectURL(item.preview));
    setItems([]);
    setApplyToAll(false);
    setGlobalTitle('');
    setGlobalCaption('');
    setIsUploading(false);
    onClose();
  };

  const validateAndAddFiles = (files: File[]) => {
    const remaining = MAX_FILES - items.length;
    if (remaining <= 0) {
      toast.warning(`Máximo de ${MAX_FILES} ficheiros por lote`);
      return;
    }

    const toAdd: UploadItem[] = [];
    for (const file of files.slice(0, remaining)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" — formato não suportado. Use JPG, PNG ou WebP.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" — ficheiro demasiado grande (máx. 10MB)`);
        continue;
      }
      toAdd.push({
        file,
        preview: URL.createObjectURL(file),
        title: file.name.replace(/\.[^/.]+$/, ''),
        caption: '',
        tags: [],
        tagInput: '',
        status: 'pending',
      });
    }
    if (toAdd.length > 0) {
      setItems(prev => [...prev, ...toAdd]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    validateAndAddFiles(files);
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    validateAndAddFiles(files);
  }, [items.length]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const removeItem = (index: number) => {
    setItems(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateItem = (index: number, updates: Partial<UploadItem>) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
  };

  const addTag = (index: number) => {
    const item = items[index];
    if (!item.tagInput.trim() || item.tags.includes(item.tagInput.trim())) return;
    updateItem(index, {
      tags: [...item.tags, item.tagInput.trim()],
      tagInput: '',
    });
  };

  const removeTag = (index: number, tag: string) => {
    updateItem(index, {
      tags: items[index].tags.filter(t => t !== tag),
    });
  };

  const handleUpload = async () => {
    const pendingItems = items.filter(i => i.status === 'pending' || i.status === 'error');
    if (pendingItems.length === 0) return;

    // Validate titles
    for (const item of pendingItems) {
      const title = applyToAll ? globalTitle : item.title;
      if (!title.trim()) {
        toast.warning('Todos os ficheiros precisam de um título');
        return;
      }
    }

    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < items.length; i++) {
      if (items[i].status !== 'pending' && items[i].status !== 'error') continue;

      updateItem(i, { status: 'uploading', error: undefined });

      try {
        const title = applyToAll ? globalTitle : items[i].title;
        const description = applyToAll ? globalCaption : items[i].caption;
        const tags = items[i].tags;

        await uploadMedia.mutateAsync({
          file: items[i].file,
          title: title.trim(),
          description: description.trim() || undefined,
          tags,
        });

        updateItem(i, { status: 'success' });
        successCount++;
      } catch (error) {
        updateItem(i, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }

    setIsUploading(false);

    if (successCount > 0) {
      toast.success(`${successCount} imagem(ns) carregada(s) com sucesso`);
    }

    // If all succeeded, close
    const hasErrors = items.some(i => i.status === 'error');
    if (!hasErrors) {
      handleClose();
    }
  };

  const pendingCount = items.filter(i => i.status === 'pending' || i.status === 'error').length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Carregar Imagens</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-5 py-4">
            {/* Drop zone */}
            {items.length < MAX_FILES && (
              <label
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={() => setIsDragOver(false)}
                className={`flex flex-col items-center justify-center h-36 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/30 hover:border-primary/50'
                }`}
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Arraste imagens ou clique para seleccionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WebP até 10MB — máx. {MAX_FILES - items.length} ficheiro(s)
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            )}

            {/* Apply to all toggle */}
            {items.length > 1 && (
              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Aplicar mesmo título/legenda a todas</Label>
                  <Switch checked={applyToAll} onCheckedChange={setApplyToAll} />
                </div>
                {applyToAll && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Título para todas as imagens *"
                      value={globalTitle}
                      onChange={(e) => setGlobalTitle(e.target.value)}
                    />
                    <Input
                      placeholder="Legenda (opcional)"
                      value={globalCaption}
                      onChange={(e) => setGlobalCaption(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* File list */}
            {items.map((item, index) => (
              <div
                key={index}
                className={`flex gap-3 rounded-lg border p-3 ${
                  item.status === 'error' ? 'border-destructive/50 bg-destructive/5' :
                  item.status === 'success' ? 'border-green-500/50 bg-green-500/5 opacity-60' :
                  item.status === 'uploading' ? 'opacity-70' : ''
                }`}
              >
                {/* Thumbnail */}
                <img
                  src={item.preview}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-lg object-cover"
                />

                {/* Fields */}
                <div className="flex-1 min-w-0 space-y-2">
                  {!applyToAll && (
                    <>
                      <Input
                        placeholder="Título *"
                        value={item.title}
                        onChange={(e) => updateItem(index, { title: e.target.value })}
                        disabled={item.status !== 'pending' && item.status !== 'error'}
                        className="h-8 text-sm"
                      />
                      <Input
                        placeholder="Legenda (opcional)"
                        value={item.caption}
                        onChange={(e) => updateItem(index, { caption: e.target.value })}
                        disabled={item.status !== 'pending' && item.status !== 'error'}
                        className="h-8 text-sm"
                      />
                    </>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1">
                    {item.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs gap-1">
                        {tag}
                        <button onClick={() => removeTag(index, tag)}>
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ))}
                    <Input
                      placeholder="+ tag"
                      value={item.tagInput}
                      onChange={(e) => updateItem(index, { tagInput: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(index);
                        }
                      }}
                      disabled={item.status !== 'pending' && item.status !== 'error'}
                      className="h-6 w-20 text-xs border-0 shadow-none px-1"
                    />
                  </div>

                  {/* Status indicators */}
                  {item.status === 'uploading' && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      A carregar...
                    </div>
                  )}
                  {item.status === 'error' && (
                    <div className="flex items-center gap-2 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {item.error}
                      <button
                        onClick={() => updateItem(index, { status: 'pending', error: undefined })}
                        className="ml-auto flex items-center gap-1 text-primary hover:underline"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Tentar novamente
                      </button>
                    </div>
                  )}
                  {item.status === 'success' && (
                    <p className="text-xs text-green-600">✓ Carregada</p>
                  )}
                </div>

                {/* Remove button */}
                {(item.status === 'pending' || item.status === 'error') && (
                  <button
                    onClick={() => removeItem(index)}
                    className="shrink-0 self-start rounded-md p-1 hover:bg-accent"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={pendingCount === 0 || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A carregar...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Carregar ({pendingCount})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
