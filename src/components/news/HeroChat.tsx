import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLatestArticles } from '@/hooks/usePublishedArticles';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';
import { sponsoredAds } from '@/data/ads';
import { SponsoredCard } from './SponsoredCard';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { getValidImageUrl } from '@/lib/imageUtils';
import { cn } from '@/lib/utils';

// Fallback topics if trending data is not available
const fallbackTopics = ['inflação', 'combustível', 'chuvas', 'política', 'dólar', 'saúde', 'educação'];

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `Há ${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Há ${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 2592000) return `Há ${Math.floor(diffInSeconds / 86400)}d`;
  if (diffInSeconds < 31536000) return `Há ${Math.floor(diffInSeconds / 2592000)} meses`;
  return `Há ${Math.floor(diffInSeconds / 31536000)} anos`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-MZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function HeroChat() {
  const [query, setQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  
  const { data: latestArticles = [], isLoading: isLoadingArticles } = useLatestArticles(4);
  const { data: trendingData, isLoading: isLoadingTrending } = useTrendingTopics();

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
      containScroll: false,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  const quickTopics = trendingData?.topics?.length 
    ? trendingData.topics.slice(0, 7)
    : fallbackTopics;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSending(true);
      setTimeout(() => {
        navigate(`/chat?q=${encodeURIComponent(query.trim())}`);
      }, 200);
    }
  };

  const handleArticleChat = (articleId: string) => {
    navigate(`/artigo/${articleId}#chat`);
  };

  const carouselItems = latestArticles.length > 0
    ? [
        ...latestArticles.map(a => ({ type: 'article' as const, data: a })),
        { type: 'ad' as const, data: sponsoredAds[0] }
      ]
    : [];

  const getSlideStyle = (index: number) => {
    const isActive = index === selectedIndex;
    return cn(
      'transition-all duration-300 ease-out',
      isActive
        ? 'scale-105 z-10 opacity-100'
        : 'scale-90 opacity-70 z-0'
    );
  };

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-8 md:min-h-[60vh] md:py-12">
      <motion.div 
        className="w-full max-w-5xl space-y-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Main title */}
        <div className="mx-auto max-w-2xl space-y-3">
          <motion.h1 
            className="font-display text-3xl font-bold leading-tight md:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            O que aconteceu hoje em{' '}
            <span className="text-primary">Moçambique</span>?
          </motion.h1>
        </div>
        
        {/* Chat input */}
        <motion.form 
          onSubmit={handleSubmit} 
          className="mx-auto max-w-2xl space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escreva qualquer tema: inflação, chuvas, política, dólar…"
              className="h-14 flex-1 text-base md:h-16 md:text-lg"
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="submit"
                size="icon"
                className="h-14 w-14 shrink-0 md:h-16 md:w-16"
                disabled={isSending}
              >
                <motion.div
                  animate={isSending ? { x: [0, 10], opacity: [1, 0] } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <Send className="h-5 w-5 md:h-6 md:w-6" />
                </motion.div>
              </Button>
            </motion.div>
          </div>
          
          {/* Quick topics */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Exemplos do que pode perguntar:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {isLoadingTrending ? (
                <>
                  <Skeleton className="h-7 w-16 rounded-full" />
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-14 rounded-full" />
                  <Skeleton className="h-7 w-18 rounded-full" />
                  <Skeleton className="h-7 w-16 rounded-full" />
                </>
              ) : (
                quickTopics.map((topic, index) => (
                  <motion.button
                    key={topic}
                    type="button"
                    onClick={() => navigate(`/chat?q=${encodeURIComponent(topic)}`)}
                    className="rounded-full border bg-background px-3 py-1 text-xs transition-colors hover:border-primary hover:text-primary"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {topic}
                  </motion.button>
                ))
              )}
            </div>
          </div>
        </motion.form>
        
        {/* Carousel with scale effect */}
        <motion.div 
          className="pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {/* Section title */}
          <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-foreground">
            Últimas notícias de hoje
          </h2>

          {isLoadingArticles ? (
            <div className="flex gap-4 overflow-hidden">
              <Skeleton className="aspect-[16/10] w-full shrink-0 rounded-xl md:w-1/2 lg:w-1/3" />
              <Skeleton className="hidden aspect-[16/10] w-1/2 shrink-0 rounded-xl md:block lg:w-1/3" />
              <Skeleton className="hidden aspect-[16/10] w-1/3 shrink-0 rounded-xl lg:block" />
            </div>
          ) : carouselItems.length > 0 ? (
            <>
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {carouselItems.map((item, index) => (
                    <div
                      key={index}
                      className="min-w-0 flex-[0_0_100%] px-2 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                    >
                      <div className={getSlideStyle(index)}>
                        {item.type === 'article' ? (
                          <button
                            onClick={() => handleArticleChat(item.data.id)}
                            className="group block w-full overflow-hidden rounded-xl border bg-card text-left"
                          >
                            <div className="overflow-hidden">
                              <img
                                src={getValidImageUrl(item.data.imageUrl)}
                                alt={item.data.title}
                                className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            </div>
                            <div className="p-3 space-y-1">
                              <h3 className="font-display text-sm font-semibold leading-tight line-clamp-2">
                                {item.data.title}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {getTimeAgo(item.data.publishedAt)} · {formatDate(item.data.publishedAt)}
                              </p>
                            </div>
                          </button>
                        ) : (
                          <div className="overflow-hidden rounded-xl border bg-card">
                            <SponsoredCard ad={item.data} variant="carousel" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active dots */}
              <div className="mt-4 flex justify-center gap-2">
                {carouselItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => emblaApi?.scrollTo(index)}
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      index === selectedIndex
                        ? 'w-6 bg-primary'
                        : 'w-2 bg-primary/30'
                    )}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-muted-foreground/30">
              <p className="text-sm text-muted-foreground">
                Ainda não há notícias publicadas.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
