import { useState } from 'react';
import { 
  Search, 
  Upload, 
  Trash2, 
  Edit2, 
  Image as ImageIcon, 
  Loader2,
  X,
  Save
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { AdminLayout } from '../components/layout/AdminLayout';
import { useMedia, useUploadMedia, useUpdateMedia, useDeleteMedia, MediaItem } from '../hooks/useMedia';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function MediaPage() {
  const [search, setSearch] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [editMedia, setEditMedia] = useState<MediaItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');

  const debouncedSearch = useDebounce(search, 300);
  const { data: mediaItems = [], isLoading } = useMedia({ search: debouncedSearch });
  const uploadMedia = useUploadMedia();
  const updateMedia = useUpdateMedia();
  const deleteMedia = useDeleteMedia();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      try {
        await uploadMedia.mutateAsync({ file });
        toast.success(`"${file.name}" carregada com sucesso`);
      } catch (error) {
        toast.error(`Erro ao carregar "${file.name}"`);
      }
    }

    e.target.value = '';
  };

  const handleSaveEdit = async () => {
    if (!editMedia) return;

    try {
      await updateMedia.mutateAsync({
        id: editMedia.id,
        updates: {
          title: editMedia.title,
          description: editMedia.description,
          alt_text: editMedia.alt_text,
          tags: editMedia.tags,
        },
      });
      toast.success('Imagem actualizada');
      setEditMedia(null);
    } catch (error) {
      toast.error('Erro ao actualizar imagem');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMedia.mutateAsync(deleteId);
      toast.success('Imagem eliminada');
      setDeleteId(null);
      setSelectedMedia(null);
    } catch (error) {
      toast.error('Erro ao eliminar imagem');
    }
  };

  const addTag = () => {
    if (!editMedia || !newTag.trim()) return;
    if (editMedia.tags.includes(newTag.trim())) return;
    
    setEditMedia({
      ...editMedia,
      tags: [...editMedia.tags, newTag.trim()],
    });
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    if (!editMedia) return;
    setEditMedia({
      ...editMedia,
      tags: editMedia.tags.filter(t => t !== tag),
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AdminLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Galeria de Imagens</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Arquivo fotográfico central do portal
              </p>
            </div>
            <label>
              <Button disabled={uploadMedia.isPending}>
                {uploadMedia.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Carregar Imagens
              </Button>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Search */}
          <div className="relative mt-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por título, descrição, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : mediaItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <ImageIcon className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">
                {search ? 'Nenhuma imagem encontrada' : 'Galeria vazia'}
              </p>
              <p className="text-sm mt-1">
                {search ? 'Tente outra pesquisa' : 'Carregue a primeira imagem'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {mediaItems.map((media) => (
                <button
                  key={media.id}
                  onClick={() => setSelectedMedia(media)}
                  className="group relative aspect-square rounded-lg overflow-hidden border bg-muted hover:ring-2 hover:ring-primary/50 transition-all"
                >
                  <img
                    src={media.url}
                    alt={media.alt_text || media.title || ''}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white truncate">
                      {media.title || media.file_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Media Detail Dialog */}
        <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedMedia?.title || selectedMedia?.file_name}</DialogTitle>
            </DialogHeader>

            {selectedMedia && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.alt_text || ''}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Título</Label>
                    <p className="font-medium">{selectedMedia.title || '—'}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Descrição</Label>
                    <p className="text-sm">{selectedMedia.description || '—'}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedMedia.tags.length > 0 ? (
                        selectedMedia.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Sem tags</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Dimensões</Label>
                      <p>
                        {selectedMedia.width && selectedMedia.height
                          ? `${selectedMedia.width} × ${selectedMedia.height}`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Tamanho</Label>
                      <p>{formatFileSize(selectedMedia.file_size)}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Data</Label>
                      <p>{format(new Date(selectedMedia.created_at), "d 'de' MMMM 'de' yyyy", { locale: pt })}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">URL</Label>
                    <Input
                      value={selectedMedia.url}
                      readOnly
                      className="text-xs font-mono"
                      onClick={(e) => {
                        (e.target as HTMLInputElement).select();
                        navigator.clipboard.writeText(selectedMedia.url);
                        toast.success('URL copiada');
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button 
                variant="outline"
                onClick={() => {
                  setEditMedia(selectedMedia);
                  setSelectedMedia(null);
                }}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  setDeleteId(selectedMedia?.id || null);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editMedia} onOpenChange={() => setEditMedia(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Imagem</DialogTitle>
            </DialogHeader>

            {editMedia && (
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden max-w-xs mx-auto">
                  <img
                    src={editMedia.url}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={editMedia.title || ''}
                    onChange={(e) => setEditMedia({ ...editMedia, title: e.target.value })}
                    placeholder="Título da imagem"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={editMedia.description || ''}
                    onChange={(e) => setEditMedia({ ...editMedia, description: e.target.value })}
                    placeholder="Descrição da fotografia..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Texto Alternativo</Label>
                  <Input
                    value={editMedia.alt_text || ''}
                    onChange={(e) => setEditMedia({ ...editMedia, alt_text: e.target.value })}
                    placeholder="Descrição para acessibilidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Adicionar tag..."
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      Adicionar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {editMedia.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button onClick={() => removeTag(tag)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditMedia(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={updateMedia.isPending}>
                {updateMedia.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar imagem?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acção não pode ser desfeita. A imagem será permanentemente eliminada.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMedia.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
