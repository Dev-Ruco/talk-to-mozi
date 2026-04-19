import { Sparkles } from 'lucide-react';

interface InlineAIPromptProps {
  onAsk: (question: string) => void;
}

const SUGGESTIONS = [
  'Explicar isto de forma simples',
  'Qual o impacto disto?',
  'Quem ganha e quem perde?',
];

export function InlineAIPrompt({ onAsk }: InlineAIPromptProps) {
  return (
    <aside className="my-2 rounded-2xl border border-primary/15 bg-primary/5 p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="h-4 w-4 text-primary" />
        Quer entender melhor?
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onAsk(s)}
            className="rounded-full border bg-background px-3.5 py-1.5 text-sm transition-colors hover:border-primary hover:bg-primary/10"
          >
            {s}
          </button>
        ))}
      </div>
    </aside>
  );
}
