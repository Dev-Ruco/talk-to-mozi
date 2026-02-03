import { Link } from 'react-router-dom';
import { TrendingUp, Clock, MessageCircle } from 'lucide-react';
import { getTrendingArticles, getLatestArticles } from '@/data/articles';
import { getCategoryColor } from '@/data/categories';
import { Badge } from '@/components/ui/badge';

export function RightSidebar() {
  const trending = getTrendingArticles().slice(0, 4);
  const latest = getLatestArticles(4);

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-80 shrink-0 xl:block">
      <div className="flex h-full flex-col gap-6 py-4 pl-4">
        {/* Trending */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              Tendências
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {trending.map((article, index) => (
              <Link
                key={article.id}
                to={`/artigo/${article.id}`}
                className="group flex gap-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className={`mt-1 text-[10px] ${getCategoryColor(article.category)}`}
                  >
                    {article.category}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Latest */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              Últimas
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {latest.map((article) => (
              <Link
                key={article.id}
                to={`/artigo/${article.id}`}
                className="group"
              >
                <p className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(article.publishedAt).toLocaleDateString('pt-MZ', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Chat Suggestions */}
        <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-4">
          <div className="mb-3 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Pergunte à IA</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Converse com qualquer notícia para entender melhor.
          </p>
          <Link
            to="/pesquisa"
            className="inline-flex items-center text-xs font-medium text-primary hover:underline"
          >
            Experimentar agora →
          </Link>
        </div>
      </div>
    </aside>
  );
}
