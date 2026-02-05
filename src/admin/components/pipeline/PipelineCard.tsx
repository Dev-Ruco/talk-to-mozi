import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  MoreHorizontal, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Sparkles,
  Clock,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PipelineArticle } from '../../hooks/usePipeline';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';

interface PipelineCardProps {
  article: PipelineArticle;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onRewrite?: () => void;
  onSkipQueue?: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onUnpublish?: () => void;
  isProcessing?: boolean;
  isQueued?: boolean;
  queuePosition?: number;
  showCheckbox?: boolean;
}

export function PipelineCard({
  article,
  isSelected = false,
  onSelect,
  onRewrite,
  onSkipQueue,
  onDelete,
  onPublish,
  onUnpublish,
  isProcessing = false,
  isQueued = false,
  queuePosition,
  showCheckbox = true,
}: PipelineCardProps) {
  const navigate = useNavigate();
  
  const timeAgo = article.captured_at
    ? formatDistanceToNow(new Date(article.captured_at), { 
        addSuffix: true, 
        locale: pt 
      })
    : '';

  const credibilityColor = {
    high: 'bg-green-500/20 text-green-700 dark:text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
    low: 'bg-red-500/20 text-red-700 dark:text-red-400',
  };

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-card p-3 transition-all duration-200',
        isSelected && 'border-primary ring-1 ring-primary',
        isProcessing && 'animate-pulse border-primary/50 bg-primary/5',
        isQueued && !isProcessing && 'opacity-80',
        'hover:shadow-md'
      )}
    >
      {/* Queue position badge */}
      {isQueued && queuePosition !== undefined && !isProcessing && (
        <div className="absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {queuePosition}
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="absolute -right-1 -top-1">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
          </span>
        </div>
      )}

      <div className="flex items-start gap-2">
        {/* Checkbox */}
        {showCheckbox && onSelect && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="mt-1"
          />
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title */}
          <h4 className="line-clamp-2 text-sm font-medium leading-tight">
            {article.title || article.original_title || 'Sem título'}
          </h4>

          {/* Meta */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {article.source && (
              <Badge variant="outline" className="text-xs">
                {article.source.name}
              </Badge>
            )}
            {article.source?.credibility && (
              <Badge 
                variant="secondary" 
                className={cn('text-xs', credibilityColor[article.source.credibility])}
              >
                {article.source.credibility === 'high' ? 'Alta' : 
                 article.source.credibility === 'medium' ? 'Média' : 'Baixa'}
              </Badge>
            )}
            {article.category && (
              <Badge variant="secondary" className="text-xs capitalize">
                {article.category}
              </Badge>
            )}
          </div>

          {/* Time */}
          <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </div>
        </div>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/admin/article/${article.id}`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            
            {article.status === 'published' && (
              <DropdownMenuItem onClick={() => window.open(`/artigo/${article.id}`, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver no site
              </DropdownMenuItem>
            )}

            {onRewrite && !isQueued && !isProcessing && (
              <DropdownMenuItem onClick={onRewrite}>
                <Sparkles className="mr-2 h-4 w-4" />
                Reformular
              </DropdownMenuItem>
            )}

            {onSkipQueue && isQueued && !isProcessing && (
              <DropdownMenuItem onClick={onSkipQueue}>
                <Zap className="mr-2 h-4 w-4" />
                Furar fila
              </DropdownMenuItem>
            )}

            {onPublish && article.status !== 'published' && (
              <DropdownMenuItem onClick={onPublish}>
                <Eye className="mr-2 h-4 w-4" />
                Publicar
              </DropdownMenuItem>
            )}

            {onUnpublish && article.status === 'published' && (
              <DropdownMenuItem onClick={onUnpublish}>
                <EyeOff className="mr-2 h-4 w-4" />
                Despublicar
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            
            {onDelete && (
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
