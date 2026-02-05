import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { getValidImageUrl } from '@/lib/imageUtils';
import type { Article, SponsoredAd } from '@/types/news';

interface CarouselArticle {
  type: 'article';
  data: Article;
}

interface CarouselAd {
  type: 'ad';
  data: SponsoredAd;
}

type CarouselItem = CarouselArticle | CarouselAd;

interface InlineChatCarouselProps {
  articles: Article[];
  ads?: SponsoredAd[];
  className?: string;
}

export function InlineChatCarousel({ articles, ads = [], className }: InlineChatCarouselProps) {
  // Mix 1-2 articles + 0-1 ad
  const items: CarouselItem[] = [
    ...articles.slice(0, 2).map(a => ({ type: 'article' as const, data: a })),
    ...ads.slice(0, 1).map(a => ({ type: 'ad' as const, data: a })),
  ];

  if (items.length === 0) return null;

  return (
    <motion.div 
      className={`my-4 ${className || ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-xs text-muted-foreground mb-2 px-1">
        Notícias relacionadas
      </p>
      <Carousel
        opts={{ align: 'start', dragFree: true }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {items.map((item, index) => (
            <CarouselItem key={index} className="pl-2 basis-[70%] md:basis-[40%]">
              {item.type === 'article' ? (
                <Link 
                  to={`/artigo/${item.data.id}`}
                  className="group block"
                >
                  <div className="rounded-lg border overflow-hidden bg-card hover:border-primary/30 transition-colors">
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={getValidImageUrl(item.data.imageUrl)}
                        alt={item.data.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="p-2.5">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-primary mb-1">
                        {item.data.category}
                      </p>
                      <h4 className="text-xs font-medium line-clamp-2 leading-snug">
                        {item.data.title}
                      </h4>
                    </div>
                  </div>
                </Link>
              ) : (
                <a 
                  href={item.data.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="rounded-lg border overflow-hidden bg-card hover:border-primary/30 transition-colors">
                    <div className="aspect-[16/9] overflow-hidden relative">
                      <img
                        src={getValidImageUrl(item.data.imageUrl)}
                        alt={item.data.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <span className="absolute top-1.5 right-1.5 bg-muted/90 text-muted-foreground text-[9px] px-1.5 py-0.5 rounded">
                        Patrocinado
                      </span>
                    </div>
                    <div className="p-2.5">
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">
                        {item.data.sponsor}
                      </p>
                      <h4 className="text-xs font-medium line-clamp-2 leading-snug">
                        {item.data.title}
                      </h4>
                    </div>
                  </div>
                </a>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </motion.div>
  );
}
