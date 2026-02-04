import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { getTrendingArticles } from '@/data/articles';
import { getCategoryColor } from '@/data/categories';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RightSidebarProps {
  visible?: boolean;
}

export function RightSidebar({ visible = true }: RightSidebarProps) {
  const trending = getTrendingArticles().slice(0, 5);

  return (
    <aside 
      className={cn(
        "sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 xl:block transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="flex h-full flex-col py-6 pl-6">
        {/* Trending only */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              Tendências
            </h2>
          </div>
          <div className="flex flex-col gap-4">
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
                    className={cn("mt-1.5 text-[10px]", getCategoryColor(article.category))}
                  >
                    {article.category}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
