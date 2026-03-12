import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, TrendingUp } from 'lucide-react';
import { categories } from '@/data/categories';
import { cn } from '@/lib/utils';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';

export function DesktopSidebar() {
  const location = useLocation();
  const { data: trendingData } = useTrendingTopics();
  const trendingTopics = trendingData?.topics?.slice(0, 5) || [];

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 lg:block">
      <div className="flex h-full flex-col py-6 pr-4 overflow-y-auto">
        {/* Chat link */}
        <Link
          to="/chat"
          className={cn(
            "mb-4 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20",
            location.pathname === '/chat' && "bg-primary/20"
          )}
        >
          <MessageCircle className="h-4 w-4" />
          <span>Pesquisa IA</span>
        </Link>

        {/* Categories */}
        <div>
          <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categorias</h2>
          <nav className="flex flex-col gap-0.5">
            {categories.map((category) => {
              const isActive = location.pathname === `/categoria/${category.id}`;
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  to={`/categoria/${category.id}`}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Trending topics */}
        {trendingTopics.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <TrendingUp className="h-3 w-3" />
              Tendências
            </h2>
            <div className="flex flex-col gap-1">
              {trendingTopics.map((topic, i) => (
                <Link
                  key={topic}
                  to={`/chat?q=${encodeURIComponent(topic)}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                >
                  <span className="text-xs font-bold text-primary/60">{i + 1}</span>
                  <span className="font-medium truncate">{topic}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto border-t pt-4">
          <Link to="/admin/login" className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            © 2024 B NEWS
          </Link>
        </div>
      </div>
    </aside>
  );
}
