import { Link } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  ExternalLink, 
  Check, 
  X, 
  Calendar, 
  Eye,
  MoreHorizontal,
  Copy,
  AlertTriangle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Article, STATUS_LABELS, STATUS_COLORS, CREDIBILITY_LABELS } from '../../types/admin';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface ArticleListProps {
  articles: Article[];
  isLoading: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onSchedule?: (id: string) => void;
  onPublish?: (id: string) => void;
  showActions?: boolean;
}

export function ArticleList({
  articles,
  isLoading,
  onApprove,
  onReject,
  onSchedule,
  onPublish,
  showActions = true,
}: ArticleListProps) {
  const { hasRole } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border">
        <p className="text-muted-foreground">Nenhuma notícia encontrada</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Título</TableHead>
            <TableHead>Fonte</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Captado</TableHead>
            {showActions && <TableHead className="text-right">Acções</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id} className="group">
              {/* Title */}
              <TableCell>
                <div className="flex items-start gap-2">
                  {article.is_duplicate && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Copy className="mt-0.5 h-4 w-4 text-orange-500" />
                      </TooltipTrigger>
                      <TooltipContent>Possível duplicado</TooltipContent>
                    </Tooltip>
                  )}
                  <div className="space-y-1">
                    <Link 
                      to={`/admin/article/${article.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {article.title || article.original_title || 'Sem título'}
                    </Link>
                    {article.source_url && (
                      <a
                        href={article.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Ver fonte original
                      </a>
                    )}
                  </div>
                </div>
              </TableCell>

              {/* Source */}
              <TableCell>
                {article.source ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{article.source.name}</span>
                    <Badge 
                      variant="outline" 
                      className={
                        article.source.credibility === 'high' 
                          ? 'border-green-500 text-green-600' 
                          : article.source.credibility === 'low'
                          ? 'border-red-500 text-red-600'
                          : 'border-yellow-500 text-yellow-600'
                      }
                    >
                      {CREDIBILITY_LABELS[article.source.credibility]}
                    </Badge>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>

              {/* Category */}
              <TableCell>
                {article.category ? (
                  <Badge variant="secondary">{article.category}</Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>

              {/* Score */}
              <TableCell>
                {article.confidence_score !== null ? (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                      <div 
                        className={`h-full ${
                          article.confidence_score >= 0.7 
                            ? 'bg-green-500' 
                            : article.confidence_score >= 0.4 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${article.confidence_score * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(article.confidence_score * 100)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge className={`${STATUS_COLORS[article.status]} text-white`}>
                  {STATUS_LABELS[article.status]}
                </Badge>
              </TableCell>

              {/* Captured At */}
              <TableCell>
                <Tooltip>
                  <TooltipTrigger className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(article.captured_at), { 
                      addSuffix: true, 
                      locale: pt 
                    })}
                  </TooltipTrigger>
                  <TooltipContent>
                    {format(new Date(article.captured_at), "d 'de' MMMM 'às' HH:mm", { locale: pt })}
                  </TooltipContent>
                </Tooltip>
              </TableCell>

              {/* Actions */}
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {/* Quick Actions */}
                    {article.status === 'pending' && hasRole(['admin', 'editor_chefe', 'revisor']) && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                              onClick={() => onApprove?.(article.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Aprovar</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => onReject?.(article.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Rejeitar</TooltipContent>
                        </Tooltip>
                      </>
                    )}

                    {article.status === 'approved' && hasRole(['admin', 'editor_chefe']) && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => onSchedule?.(article.id)}
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Agendar</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-primary"
                              onClick={() => onPublish?.(article.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Publicar agora</TooltipContent>
                        </Tooltip>
                      </>
                    )}

                    {/* More Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/article/${article.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Abrir no editor
                          </Link>
                        </DropdownMenuItem>
                        {article.source_url && (
                          <DropdownMenuItem asChild>
                            <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Ver fonte
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => onReject?.(article.id)}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Marcar como duplicado
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
