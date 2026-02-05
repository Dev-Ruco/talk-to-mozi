import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLatestArticles } from '@/hooks/usePublishedArticles';
import { sponsoredAds } from '@/data/ads';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { SponsoredCard } from './SponsoredCard';
import Autoplay from 'embla-carousel-autoplay';

export function HeroChat() {
  const [query, setQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();
  
  // Fetch latest 4 articles from database
  const { data: latestArticles = [], isLoading: isLoadingArticles } = useLatestArticles(4);
  
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const quickTopics = ['inflação', 'combustível', 'chuvas', 'política', 'dólar', 'saúde', 'educação'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSending(true);
      // Small delay to show animation
      setTimeout(() => {
        navigate(`/chat?q=${encodeURIComponent(query.trim())}`);
      }, 200);
    }
  };

  const handleArticleChat = (articleId: string) => {
    navigate(`/artigo/${articleId}#chat`);
  };

  // Mix articles with one sponsored ad (only if we have articles)
  const carouselItems = latestArticles.length > 0
    ? [
        ...latestArticles.map(a => ({ type: 'article' as const, data: a })),
        { type: 'ad' as const, data: sponsoredAds[0] }
      ]
    : [];

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-8 md:min-h-[60vh] md:py-12">
      <motion.div 
        className="w-full max-w-2xl space-y-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Main title */}
        <div className="space-y-3">
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
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escreva qualquer tema: inflação, chuvas, política, dólar…"
              className="h-14 pr-14 text-base md:h-16 md:text-lg"
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 md:h-12 md:w-12"
                disabled={isSending}
              >
                <motion.div
                  animate={isSending ? { x: [0, 10], opacity: [1, 0] } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <Send className="h-5 w-5" />
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
              {quickTopics.map((topic, index) => (
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
              ))}
            </div>
          </div>
        </motion.form>
        
        {/* Visual Carousel */}
        <motion.div 
          className="pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {isLoadingArticles ? (
            // Loading skeleton for carousel
            <div className="flex gap-4 overflow-hidden">
              <Skeleton className="h-48 w-full shrink-0 rounded-xl md:w-1/2" />
              <Skeleton className="hidden h-48 w-1/2 shrink-0 rounded-xl md:block" />
            </div>
          ) : carouselItems.length > 0 ? (
            <Carousel 
              className="w-full"
              opts={{
                align: 'start',
                loop: true,
              }}
              plugins={[autoplayPlugin.current]}
            >
              <CarouselContent>
                {carouselItems.map((item, index) => (
                  <CarouselItem key={index} className="basis-full md:basis-1/2 lg:basis-1/2">
                    {item.type === 'article' ? (
                      <motion.button
                        onClick={() => handleArticleChat(item.data.id)}
                        className="group relative block h-48 w-full overflow-hidden rounded-xl text-left"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <img
                          src={item.data.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop'}
                          alt={item.data.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="font-display text-base font-bold text-white leading-tight line-clamp-2 md:text-lg">
                            {item.data.title}
                          </h3>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs text-white/90">
                              <MessageCircle className="h-3 w-3" />
                              Conversar
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    ) : (
                      <div className="h-48">
                        <SponsoredCard ad={item.data} variant="carousel" />
                      </div>
                    )}
                  </CarouselItem>
                ))}
            </CarouselContent>
              
              {/* Dots indicator */}
              <div className="mt-4 flex justify-center gap-2">
                {carouselItems.map((_, index) => (
                  <div
                    key={index}
                    className="h-2 w-2 rounded-full bg-primary/30"
                  />
                ))}
              </div>
            </Carousel>
          ) : (
            // Empty state - no articles yet
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
