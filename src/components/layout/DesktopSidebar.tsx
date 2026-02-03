import { Link, useLocation } from 'react-router-dom';
import { categories } from '@/data/categories';
import { cn } from '@/lib/utils';

export function DesktopSidebar() {
  const location = useLocation();

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 shrink-0 lg:block">
      <div className="flex h-full flex-col gap-4 py-4">
        <div className="px-4">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Categorias
          </h2>
          <nav className="flex flex-col gap-1">
            {categories.map((category) => {
              const isActive = location.pathname === `/categoria/${category.id}`;
              return (
                <Link
                  key={category.id}
                  to={`/categoria/${category.id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t px-4 pt-4">
          <p className="text-xs text-muted-foreground">
            © 2024 B NEWS. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </aside>
  );
}
