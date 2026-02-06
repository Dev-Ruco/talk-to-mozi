import { useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Upload, Calendar as CalendarIcon, Check, Clock, Image as ImageIcon, Loader2, AlertCircle, FolderOpen } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Article, ArticleStatus, STATUS_LABELS, STATUS_COLORS } from '../../types/admin';
import { categories } from '@/data/categories';
import { cn } from '@/lib/utils';
import { useImageUpload } from '@/admin/hooks/useImageUpload';
import { isValidImageUrl } from '@/lib/imageUtils';
import { MediaPicker } from '@/admin/components/media/MediaPicker';

interface PublishPanelProps {
  article: Article;
  onUpdate: (updates: Partial<Article>) => void;
  onSave: () => void;
  onPublish: () => void;
  onSchedule: (date: Date) => void;
  isSaving: boolean;
}

export function PublishPanel({ 
  article, 
  onUpdate, 
  onSave, 
  onPublish, 
  onSchedule,
  isSaving 
}: PublishPanelProps) {
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(
    article.scheduled_at ? new Date(article.scheduled_at) : undefined
  );
  const [scheduleTime, setScheduleTime] = useState(
    article.scheduled_at 
      ? format(new Date(article.scheduled_at), 'HH:mm') 
      : '09:00'
  );
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Check if image is valid (not a blob: URL)
  const hasValidImage = isValidImageUrl(article.image_url);
  const hasBlobImage = article.image_url?.startsWith('blob:');

  const { uploadImage, isUploading, progress } = useImageUpload({
    onSuccess: (url) => {
      onUpdate({ image_url: url });
    },
  });

  const handleSchedule = () => {
    if (scheduleDate) {
      const [hours, minutes] = scheduleTime.split(':').map(Number);
      const scheduledAt = new Date(scheduleDate);
      scheduledAt.setHours(hours, minutes, 0, 0);
      onSchedule(scheduledAt);
    }
  };

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && article.id) {
        await uploadImage(file, article.id);
      }
    };
    input.click();
  };

  return (
    <div className="flex h-full flex-col border-l border-border">
      <div className="border-b border-border p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Publicação</h3>
        <Badge className={`${STATUS_COLORS[article.status]} text-white mt-2`}>
          {STATUS_LABELS[article.status]}
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4">
          {/* Content Type Selector */}
          <div className="space-y-2">
            <Label>Tipo de Conteúdo</Label>
            <Select
              value={article.content_type || 'article'}
              onValueChange={(value) => onUpdate({ 
                content_type: value as 'article' | 'visual',
                visual_format: value === 'visual' ? (article.visual_format || 'vertical') : null,
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="article">📰 Artigo Normal</SelectItem>
                <SelectItem value="visual">📸 Notícia Visual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label>Imagem de Capa</Label>
            {article.image_url ? (
              <div className="relative">
                <img 
                  src={article.image_url} 
                  alt="Capa" 
                  className="w-full aspect-video rounded-lg object-cover"
                />
                {hasBlobImage && (
                  <div className="absolute inset-0 bg-destructive/20 rounded-lg flex items-center justify-center">
                    <div className="bg-background/90 rounded-md p-2 text-center">
                      <AlertCircle className="h-5 w-5 text-destructive mx-auto mb-1" />
                      <p className="text-xs text-destructive font-medium">
                        Imagem temporária
                      </p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowMediaPicker(true)}
                    disabled={isUploading}
                  >
                    <FolderOpen className="mr-1 h-3 w-3" />
                    Galeria
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleImageUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Upload className="mr-1 h-3 w-3" />
                    )}
                    Carregar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full h-32 border-dashed"
                  onClick={() => setShowMediaPicker(true)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <FolderOpen className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Seleccionar da Galeria
                    </span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleImageUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A carregar... {progress}%
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Ou carregar do computador
                    </>
                  )}
                </Button>
              </div>
            )}
            {isUploading && (
              <Progress value={progress} className="h-1" />
            )}
            {hasBlobImage && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Clique "Carregar" ou seleccione da Galeria para guardar permanentemente
              </p>
            )}
            <Input
              placeholder="Legenda da imagem..."
              value={article.image_caption || ''}
              onChange={(e) => onUpdate({ image_caption: e.target.value })}
            />
          </div>

          {/* Media Picker Dialog */}
          <MediaPicker
            open={showMediaPicker}
            onClose={() => setShowMediaPicker(false)}
            onSelect={(url) => {
              onUpdate({ image_url: url });
            }}
          />

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={article.category || ''}
              onValueChange={(value) => onUpdate({ category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Highlight Type */}
          <div className="space-y-2">
            <Label>Destaque</Label>
            <Select
              value={article.highlight_type}
              onValueChange={(value) => onUpdate({ 
                highlight_type: value as 'hero' | 'trending' | 'normal' 
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="trending">Em Destaque</SelectItem>
                <SelectItem value="hero">Manchete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* SEO */}
          <div className="space-y-2">
            <Label>Título SEO</Label>
            <Input
              value={article.seo_title || ''}
              onChange={(e) => onUpdate({ seo_title: e.target.value })}
              placeholder="Título para motores de busca..."
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">
              {(article.seo_title || '').length}/60 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label>Slug URL</Label>
            <Input
              value={article.seo_slug || ''}
              onChange={(e) => onUpdate({ seo_slug: e.target.value })}
              placeholder="url-amigavel-do-artigo"
            />
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label>Autor</Label>
            <Input
              value={article.author || ''}
              onChange={(e) => onUpdate({ author: e.target.value })}
              placeholder="Nome do autor..."
            />
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <Label>Agendar Publicação</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !scheduleDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduleDate ? format(scheduleDate, "d MMM yyyy", { locale: pt }) : "Escolher data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduleDate}
                    onSelect={setScheduleDate}
                    disabled={(date) => date < new Date()}
                    locale={pt}
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-24"
              />
            </div>
            {scheduleDate && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleSchedule}
              >
                <Clock className="mr-2 h-4 w-4" />
                Agendar para {format(scheduleDate, "d MMM", { locale: pt })} às {scheduleTime}
              </Button>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="border-t border-border p-4 space-y-2">
        <Button 
          className="w-full" 
          onClick={onSave}
          disabled={isSaving}
          variant="outline"
        >
          {isSaving ? 'A guardar...' : 'Guardar rascunho'}
        </Button>
        {hasBlobImage && (
          <p className="text-xs text-center text-amber-600">
            ⚠️ A imagem precisa ser guardada antes de publicar
          </p>
        )}
        <Button 
          className="w-full" 
          onClick={onPublish}
          disabled={isSaving || !article.title || !article.content || !hasValidImage}
        >
          <Check className="mr-2 h-4 w-4" />
          Publicar agora
        </Button>
      </div>
    </div>
  );
}
