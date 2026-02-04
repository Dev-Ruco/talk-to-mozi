import { ExternalLink } from 'lucide-react';
import { SponsoredAd } from '@/types/news';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface SponsoredCardProps {
  ad: SponsoredAd;
  variant?: 'feed' | 'sidebar' | 'carousel';
}

export function SponsoredCard({ ad, variant = 'feed' }: SponsoredCardProps) {
  // Carousel variant - overlay style
  if (variant === 'carousel') {
    return (
      <a
        href={ad.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block h-full w-full overflow-hidden rounded-xl"
      >
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Badge className="mb-2 bg-primary/90 text-primary-foreground text-[10px]">
            PATROCINADO
          </Badge>
          <h3 className="font-display text-lg font-bold text-white leading-tight line-clamp-2">
            {ad.title}
          </h3>
          <p className="mt-1 text-xs text-white/70">{ad.sponsor}</p>
        </div>
      </a>
    );
  }

  // Sidebar variant - compact
  if (variant === 'sidebar') {
    return (
      <a
        href={ad.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex gap-3"
      >
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <Badge className="mb-1 bg-muted text-muted-foreground text-[9px]">
            PATROCINADO
          </Badge>
          <p className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {ad.title}
          </p>
        </div>
      </a>
    );
  }

  // Feed variant - full card
  return (
    <article className="group overflow-hidden rounded-xl border bg-card">
      {/* Image */}
      <a href={ad.link} target="_blank" rel="noopener noreferrer">
        <AspectRatio ratio={16 / 9}>
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </AspectRatio>
      </a>
      
      {/* Content */}
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Badge className="bg-muted text-muted-foreground text-[10px]">
            PATROCINADO
          </Badge>
          <span className="text-xs text-muted-foreground">{ad.sponsor}</span>
        </div>
        
        <a href={ad.link} target="_blank" rel="noopener noreferrer">
          <h3 className="font-display text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
            {ad.title}
          </h3>
        </a>
        
        {ad.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {ad.description}
          </p>
        )}
        
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            asChild
          >
            <a href={ad.link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Saber mais
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
