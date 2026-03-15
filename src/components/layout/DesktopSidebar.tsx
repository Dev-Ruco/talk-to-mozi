import { Link, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { categories } from '@/data/categories';
import { cn } from '@/lib/utils';

export function DesktopSidebar() {
  const location = useLocation();

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 lg:block">
      <div className="flex h-full flex-col py-6 pr-4">
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
          <h2 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Categorias
          </h2>
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
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t pt-4">
          <Link 
            to="/admin/login" 
            className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            © 2024 B NEWS
          </Link>
        </div>
      </div>
    </aside>
  );
}
