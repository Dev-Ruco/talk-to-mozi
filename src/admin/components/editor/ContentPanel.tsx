import { useState } from 'react';
import { Wand2, Minimize2, Newspaper, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Article } from '../../types/admin';

interface ContentPanelProps {
  article: Article;
  onUpdate: (updates: Partial<Article>) => void;
}

export function ContentPanel({ article, onUpdate }: ContentPanelProps) {
  const [isRewriting, setIsRewriting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleAIAction = async (action: 'rewrite' | 'shorten' | 'journalistic') => {
    setIsRewriting(true);
    try {
      // TODO: Integrate with AI Gateway
      toast.info(`Acção IA: ${action} - Em desenvolvimento`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Funcionalidade IA será integrada em breve');
    } finally {
      setIsRewriting(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTags = [...(article.tags || []), tagInput.trim()];
      onUpdate({ tags: newTags });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = (article.tags || []).filter(tag => tag !== tagToRemove);
    onUpdate({ tags: newTags });
  };

  return (
    <div className="flex h-full flex-col">
      {/* AI Toolbar */}
      <div className="flex items-center gap-2 border-b border-border p-3 bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground">Ferramentas IA:</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAIAction('rewrite')}
          disabled={isRewriting}
        >
          {isRewriting ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Wand2 className="mr-1 h-3 w-3" />}
          Reformular
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAIAction('shorten')}
          disabled={isRewriting}
        >
          <Minimize2 className="mr-1 h-3 w-3" />
          Encurtar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAIAction('journalistic')}
          disabled={isRewriting}
        >
          <Newspaper className="mr-1 h-3 w-3" />
          Tom Jornalístico
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título B NEWS</Label>
            <Input
              id="title"
              value={article.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Escreva o título..."
              className="text-lg font-semibold"
            />
          </div>

          {/* Lead */}
          <div className="space-y-2">
            <Label htmlFor="lead">Lead / Subtítulo</Label>
            <Textarea
              id="lead"
              value={article.lead || ''}
              onChange={(e) => onUpdate({ lead: e.target.value })}
              placeholder="Resumo que aparece abaixo do título..."
              rows={2}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={article.content || ''}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Corpo da notícia..."
              rows={12}
              className="resize-none font-serif"
            />
          </div>

          {/* Quick Facts */}
          <div className="space-y-2">
            <Label htmlFor="quick_facts">Factos Rápidos (um por linha)</Label>
            <Textarea
              id="quick_facts"
              value={(article.quick_facts || []).join('\n')}
              onChange={(e) => onUpdate({ 
                quick_facts: e.target.value.split('\n').filter(f => f.trim()) 
              })}
              placeholder="• Facto 1&#10;• Facto 2&#10;• Facto 3"
              rows={4}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(article.tags || []).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Escreva uma tag e prima Enter..."
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={article.location || ''}
              onChange={(e) => onUpdate({ location: e.target.value })}
              placeholder="Ex: Lisboa, Moçambique..."
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
