import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useLatestArticles } from '@/hooks/usePublishedArticles';
import { getCategoryById } from '@/data/categories';
import { getValidImageUrl } from '@/lib/imageUtils';

function getTimeAgo(dateString: string): string {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 60) return `Há ${diff}s`;
  if (diff < 3600) return `Há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Há ${Math.floor(diff / 3600)}h`;
  return `Há ${Math.floor(diff / 86400)}d`;
}

export function LatestNewsBlock() {
  const { data: articles = [], isLoading } = useLatestArticles(6);

  if (isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-7 w-48" />
        <div className="grid gap-6 md:grid-cols-5">
          <Skeleton className="aspect-[16/9] w-full rounded-2xl md:col-span-3" />
          <div className="space-y-3 md:col-span-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!articles.length) {
    return (
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Últimas actualizações</h2>
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Ainda não há notícias publicadas.
        </div>
      </section>
    );
  }

  const [main, ...rest] = articles;
  const sideList = rest.slice(0, 4);
  const mainCategory = getCategoryById(main.category);

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-2xl font-bold">Últimas actualizações</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Main card */}
        <Link
          to={`/artigo/${main.id}`}
          className="group block overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md md:col-span-3"
        >
          <div className="overflow-hidden">
            <img
              src={getValidImageUrl(main.imageUrl)}
              alt={main.title}
              className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
          <div className="space-y-2 p-4 md:p-5">
            <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              {mainCategory?.name || 'Notícia'}
            </span>
            <h3 className="font-display text-lg font-bold leading-tight transition-colors group-hover:text-primary md:text-xl">
              {main.title}
            </h3>
            {main.summary && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {main.summary}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {getTimeAgo(main.publishedAt)}
            </p>
          </div>
        </Link>

        {/* Side list */}
        <div className="flex flex-col gap-3 md:col-span-2">
          {sideList.map((a) => {
            const cat = getCategoryById(a.category);
            return (
              <Link
                key={a.id}
                to={`/artigo/${a.id}`}
                className="group flex gap-3 rounded-xl border bg-card p-2 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img
                    src={getValidImageUrl(a.imageUrl)}
                    alt={a.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
                      {cat?.name || 'Notícia'}
                    </span>
                    <h4 className="font-display text-sm font-semibold leading-tight line-clamp-2 transition-colors group-hover:text-primary">
                      {a.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {getTimeAgo(a.publishedAt)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
