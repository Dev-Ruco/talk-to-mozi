import { Sparkles, BookOpen, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTrackEvent } from '@/hooks/useTrackEvent';

interface ArticleAIActionsProps {
  articleId: string;
  category?: string;
  onAsk: (question: string) => void;
}

const ACTIONS = [
  {
    type: 'resumir',
    label: 'Resumir',
    icon: Sparkles,
    question: 'Faz-me um resumo curto deste artigo, em 3 a 4 frases.',
  },
  {
    type: 'explicar',
    label: 'Explicar',
    icon: BookOpen,
    question: 'Explica este artigo de forma simples, como se eu não soubesse nada do tema.',
  },
  {
    type: 'impacto',
    label: 'Qual o impacto?',
    icon: TrendingUp,
    question: 'Qual é o impacto real disto? Quem ganha, quem perde e porquê é importante?',
  },
] as const;

export function ArticleAIActions({ articleId, category, onAsk }: ArticleAIActionsProps) {
  const { track } = useTrackEvent();

  const handleClick = (action: typeof ACTIONS[number]) => {
    track('ai_action', {
      articleId,
      category,
      metadata: { ai_action_type: action.type, source: 'article_top' },
    });
    onAsk(action.question);
  };

  return (
    <aside className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="h-4 w-4 text-primary" />
        Pergunte à Mozi sobre este artigo
      </div>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <motion.button
              key={a.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleClick(a)}
              className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/10"
            >
              <Icon className="h-3.5 w-3.5 text-primary" />
              {a.label}
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
}
