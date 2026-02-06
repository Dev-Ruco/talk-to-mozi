import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/ui/resizable';
import { Article } from '../../types/admin';
import { SourcePanel } from './SourcePanel';
import { ContentPanel } from './ContentPanel';
import { VisualEditor } from './VisualEditor';
import { PublishPanel } from './PublishPanel';

interface ArticleEditorProps {
  article: Article;
  onUpdate: (updates: Partial<Article>) => void;
  onSave: () => void;
  onPublish: () => void;
  onSchedule: (date: Date) => void;
  isSaving: boolean;
}

export function ArticleEditor({
  article,
  onUpdate,
  onSave,
  onPublish,
  onSchedule,
  isSaving,
}: ArticleEditorProps) {
  const isVisual = article.content_type === 'visual';

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Source Panel - 25% */}
      <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
        <SourcePanel article={article} />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      {/* Content Panel - 50% */}
      <ResizablePanel defaultSize={50} minSize={30}>
        {isVisual ? (
          <VisualEditor article={article} onUpdate={onUpdate} />
        ) : (
          <ContentPanel article={article} onUpdate={onUpdate} />
        )}
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      {/* Publish Panel - 25% */}
      <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
        <PublishPanel 
          article={article} 
          onUpdate={onUpdate}
          onSave={onSave}
          onPublish={onPublish}
          onSchedule={onSchedule}
          isSaving={isSaving}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
