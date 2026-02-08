import { useState } from 'react';
import { Search, Upload, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { useMedia, useUploadMedia, MediaItem } from '@/admin/hooks/useMedia';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, media: MediaItem) => void;
}

export function MediaPicker({ open, onClose, onSelect }: MediaPickerProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { data: mediaItems = [], isLoading } = useMedia({ search: debouncedSearch });
  const uploadMedia = useUploadMedia();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    try {
      const media = await uploadMedia.mutateAsync({ file: uploadFile });
      onSelect(media.url, media);
      handleClose();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleSelectExisting = () => {
    const selected = mediaItems.find(m => m.id === selectedId);
    if (selected) {
      onSelect(selected.url, selected);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearch('');
    setSelectedId(null);
    setUploadFile(null);
    if (uploadPreview) {
      URL.revokeObjectURL(uploadPreview);
      setUploadPreview(null);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Seleccionar Imagem</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="library" className="flex-1 flex flex-col">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="library">Biblioteca</TabsTrigger>
              <TabsTrigger value="upload">Carregar Nova</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="library" className="flex-1 flex flex-col overflow-hidden px-6 pb-6 mt-4">
            {/* Search - fixed top */}
            <div className="relative mb-4 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por título, descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Media Grid - scrollable */}
            <ScrollArea className="flex-1 min-h-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : mediaItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mb-2" />
                  <p className="text-sm">
                    {search ? 'Nenhuma imagem encontrada' : 'Biblioteca vazia'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 pr-4">
                  {mediaItems.map((media) => (
                    <button
                      key={media.id}
                      onClick={() => setSelectedId(media.id)}
                      className={cn(
                        "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                        selectedId === media.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-muted-foreground/30"
                      )}
                    >
                      <img
                        src={media.url}
                        alt={media.alt_text || media.title || ''}
                        className="w-full h-full object-cover"
                      />
                      {selectedId === media.id && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check className="h-8 w-8 text-primary-foreground bg-primary rounded-full p-1" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-xs text-white truncate">
                          {media.title || media.file_name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Select Button - fixed bottom */}
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t shrink-0">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSelectExisting}
                disabled={!selectedId}
              >
                Inserir Imagem
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="flex-1 flex flex-col px-6 pb-6 mt-4">
            {/* Upload Area */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {uploadPreview ? (
                <div className="relative w-full max-w-md">
                  <img
                    src={uploadPreview}
                    alt="Preview"
                    className="w-full rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setUploadFile(null);
                      if (uploadPreview) URL.revokeObjectURL(uploadPreview);
                      setUploadPreview(null);
                    }}
                  >
                    Alterar
                  </Button>
                </div>
              ) : (
                <label className="w-full h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Clique ou arraste uma imagem
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, WebP até 10MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={!uploadFile || uploadMedia.isPending}
              >
                {uploadMedia.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A carregar...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Carregar e Inserir
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
