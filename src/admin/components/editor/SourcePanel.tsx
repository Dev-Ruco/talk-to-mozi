import { ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Article, CREDIBILITY_LABELS } from '../../types/admin';

interface SourcePanelProps {
  article: Article;
}

export function SourcePanel({ article }: SourcePanelProps) {
  return (
    <div className="flex h-full flex-col border-r border-border">
      <div className="border-b border-border p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Fonte Original</h3>
        {article.source && (
          <div className="mt-2 flex items-center gap-2">
            <span className="font-medium">{article.source.name}</span>
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
        )}
        {article.source_url && (
          <Button
            variant="link"
            size="sm"
            className="mt-1 h-auto p-0 text-xs"
            asChild
          >
            <a href={article.source_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3 w-3" />
              Abrir fonte original
            </a>
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-xs font-medium uppercase text-muted-foreground">
              Título Original
            </h4>
            <p className="text-sm leading-relaxed">
              {article.original_title || 'Sem título original'}
            </p>
          </div>
          
          <div>
            <h4 className="mb-2 text-xs font-medium uppercase text-muted-foreground">
              Conteúdo Original
            </h4>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {article.original_content ? (
                <div 
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: article.original_content }}
                />
              ) : (
                <p className="italic">Conteúdo original não disponível</p>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
