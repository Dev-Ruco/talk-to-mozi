import { Bot } from 'lucide-react';

/**
 * RewritingColumn — disabled. Queue management removed.
 * This component is kept as a placeholder for future pipeline-run integration.
 */
export function RewritingColumn() {
  return (
    <div className="flex h-full min-w-[280px] flex-col rounded-xl border border-muted bg-muted/5">
      <div className="flex items-center gap-2 border-b border-muted p-3">
        <Bot className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-muted-foreground">Em Reformulação</h3>
      </div>
      <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-muted-foreground p-4">
        <Bot className="h-8 w-8 opacity-50" />
        <p>Funcionalidade desactivada</p>
        <p className="text-xs">Pendente nova arquitectura</p>
      </div>
    </div>
  );
}
