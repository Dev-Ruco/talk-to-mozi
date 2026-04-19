import { useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';

const FALLBACK_TOPICS = [
  'Crise de combustíveis',
  'Cheias no centro',
  'Inflação',
  'Investimento chinês',
  'Energia',
  'Educação',
  'Segurança pública',
];

export function TrendingTopics() {
  const navigate = useNavigate();
  const { data } = useTrendingTopics();

  const topics = data?.topics?.length ? data.topics : FALLBACK_TOPICS;

  if (!topics.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-bold">Tópicos do momento</h2>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => navigate(`/chat?q=${encodeURIComponent(topic)}`)}
              className="shrink-0 rounded-full border bg-card px-4 py-2 text-sm font-medium transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
