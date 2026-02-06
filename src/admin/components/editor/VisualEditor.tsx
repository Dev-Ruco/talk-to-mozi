import { useState } from 'react';
import { Upload, X, GripVertical, Image as ImageIcon, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { VisualCarousel } from '@/components/news/VisualCarousel';
import { MediaPicker } from '@/admin/components/media/MediaPicker';
import { useImageUpload } from '@/admin/hooks/useImageUpload';
import { Article } from '../../types/admin';
import { cn } from '@/lib/utils';

interface VisualEditorProps {
  article: Article;
  onUpdate: (updates: Partial<Article>) => void;
}

export function VisualEditor({ article, onUpdate }: VisualEditorProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const images = article.gallery_urls || [];
  const format = article.visual_format || 'vertical';

  const { uploadImage, isUploading } = useImageUpload({
    onSuccess: (url) => {
      if (images.length < 6) {
        onUpdate({ gallery_urls: [...images, url] });
      }
    },
  });

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onUpdate({ gallery_urls: updated });
  };

  const handleMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onUpdate({ gallery_urls: updated });
  };

  const handleFileUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      const remaining = 6 - images.length;
      const toUpload = files.slice(0, remaining);
      for (const file of toUpload) {
        if (article.id) {
          await uploadImage(file, article.id);
        }
      }
    };
    input.click();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Format selector */}
      <div className="flex items-center gap-4 border-b border-border p-3 bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground">Formato:</span>
        <ToggleGroup
          type="single"
          value={format}
          onValueChange={(val) => {
            if (val) onUpdate({ visual_format: val as 'vertical' | 'horizontal' });
          }}
        >
          <ToggleGroupItem value="vertical" size="sm">
            📱 Vertical Imersivo
          </ToggleGroupItem>
          <ToggleGroupItem value="horizontal" size="sm">
            🖥️ Horizontal Clássico
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="visual-title">Título</Label>
            <Input
              id="visual-title"
              value={article.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Título da notícia visual..."
              className="text-lg font-semibold"
            />
          </div>

          {/* Image gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Galeria de Imagens ({images.length}/6)</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMediaPicker(true)}
                  disabled={images.length >= 6}
                >
                  <FolderOpen className="mr-1 h-3 w-3" />
                  Galeria
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFileUpload}
                  disabled={images.length >= 6 || isUploading}
                >
                  <Upload className="mr-1 h-3 w-3" />
                  Carregar
                </Button>
              </div>
            </div>

            {images.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setShowMediaPicker(true)}
              >
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Adicione até 6 imagens</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Imagem ${index + 1}`}
                      className={cn(
                        'w-full rounded-lg object-cover border',
                        format === 'vertical' ? 'aspect-[4/5]' : 'aspect-video'
                      )}
                    />
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="absolute bottom-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {index > 0 && (
                        <button
                          onClick={() => handleMoveImage(index, index - 1)}
                          className="rounded bg-background/80 px-1 py-0.5 text-xs shadow-sm"
                        >
                          ←
                        </button>
                      )}
                      {index < images.length - 1 && (
                        <button
                          onClick={() => handleMoveImage(index, index + 1)}
                          className="rounded bg-background/80 px-1 py-0.5 text-xs shadow-sm"
                        >
                          →
                        </button>
                      )}
                    </div>
                    <div className="absolute top-1 left-1 rounded-full bg-background/80 px-1.5 py-0.5 text-xs font-medium shadow-sm">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Preview */}
          {images.length > 0 && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="rounded-xl border bg-background p-4">
                <VisualCarousel
                  images={images}
                  format={format as 'vertical' | 'horizontal'}
                />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <MediaPicker
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(url) => {
          if (images.length < 6) {
            onUpdate({ gallery_urls: [...images, url] });
          }
        }}
      />
    </div>
  );
}
