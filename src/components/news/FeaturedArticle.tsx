import { useNavigate } from 'react-router-dom';
import { Clock, MessageCircle } from 'lucide-react';
import { useFeaturedArticle } from '@/hooks/useFeaturedArticle';
import { Button } from '@/components/ui/button';
import { getValidImageUrl } from '@/lib/imageUtils';

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return 'Agora';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  return date.toLocaleDateString('pt-MZ', { day: 'numeric', month: 'short' });
}

export function FeaturedArticle() {
  const { data: article } = useFeaturedArticle();
  const navigate = useNavigate();

  if (!article) return null;

  const handleClick = () => {
    navigate(`/artigo/${article.id}#chat`);
  };

  return (
    <div className="space-y-3">
      <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Em destaque hoje
      </p>

      <div
        onClick={handleClick}
        className="group cursor-pointer overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md flex flex-col md:flex-row"
      >
        {/* Image */}
        <div className="md:w-2/5 shrink-0">
          <div className="aspect-video md:h-full">
            <img
              src={getValidImageUrl(article.imageUrl)}
              alt={article.title}
              className="h-full w-full object-cover"
              onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center gap-3 p-5">
         <h3 className="font-display text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
            {article.title}
          </h3>

          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {getTimeAgo(article.publishedAt)} · {new Date(article.publishedAt).toLocaleDateString('pt-MZ', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>

          {article.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {article.summary}
            </p>
          )}

          <div>
            <Button size="sm" className="gap-1.5" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
              <MessageCircle className="h-4 w-4" />
              Explorar com IA
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
