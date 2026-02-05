import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface PipelineColumnProps {
  title: string;
  icon: LucideIcon;
  count: number;
  children: ReactNode;
  color?: 'default' | 'primary' | 'success' | 'warning';
  actions?: ReactNode;
  className?: string;
  emptyMessage?: string;
}

export function PipelineColumn({
  title,
  icon: Icon,
  count,
  children,
  color = 'default',
  actions,
  className,
  emptyMessage = 'Sem artigos',
}: PipelineColumnProps) {
  const colorStyles = {
    default: 'border-border',
    primary: 'border-primary/30 bg-primary/5',
    success: 'border-green-500/30 bg-green-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
  };

  const badgeColors = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/20 text-primary',
    success: 'bg-green-500/20 text-green-700 dark:text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  };

  return (
    <div 
      className={cn(
        'flex h-full min-w-[280px] flex-col rounded-xl border',
        colorStyles[color],
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-inherit p-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="secondary" className={cn('text-xs', badgeColors[color])}>
            {count}
          </Badge>
        </div>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-2">
        {count === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {children}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
