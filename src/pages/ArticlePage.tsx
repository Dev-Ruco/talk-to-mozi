import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Clock, Calendar, Share2, Heart, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { ArticleChat } from '@/components/news/ArticleChat';
import { NewsCard } from '@/components/news/NewsCard';
import { VisualCarousel } from '@/components/news/VisualCarousel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useArticle, useRelatedArticles } from '@/hooks/usePublishedArticles';
import { getCategoryById, getCategoryColor } from '@/data/categories';
import { useLikedArticles } from '@/hooks/useLikedArticles';
import { cn } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

function RelatedSlider({ articles }: { articles: ReturnType<typeof useRelatedArticles>['data'] }) {
  const items = articles || [];
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: 'start', containScroll: 'trimSnaps' },
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  if (items.length === 0) return null;

  return (
    <section className="mt-8 border-t pt-6">
      <h2 className="font-display text-lg font-bold mb-4">Notícias Relacionadas</h2>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-3">
          {items.map((article) => (
            <div key={article.id} className="min-w-0 flex-[0_0_85%] pl-3 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
              <NewsCard article={article} variant="compact" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { isLiked, toggleLike } = useLikedArticles();
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const [showBigHeart, setShowBigHeart] = useState(false);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [id]);

  const { data: article, isLoading, isError } = useArticle(id);
  const { data: relatedArticles = [] } = useRelatedArticles(article?.category, id || '', 6);

  useEffect(() => {
    const handleScroll = () => {
      const chatElement = document.getElementById('chat');
      if (chatElement) {
        const rect = chatElement.getBoundingClientRect();
        setShowFloatingButton(rect.top > window.innerHeight);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <Layout showSidebars={false}>
        <div className="mx-auto max-w-3xl py-4">
          <Skeleton className="mb-4 h-6 w-20" />
          <Skeleton className="mb-4 h-12 w-full" />
          <Skeleton className="mb-2 h-4 w-1/2" />
          <Skeleton className="mb-6 h-20 w-full" />
          <Skeleton className="mb-8 aspect-video w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !article) {
    return (
      <Layout showSidebars={false}>
        <div className="flex flex-col items-center justify-center py-20">
          <h1 className="text-2xl font-bold">Artigo não encontrado</h1>
          <p className="mt-2 text-muted-foreground">O artigo que procura não existe ou ainda não foi publicado.</p>
          <Link to="/" className="mt-4 text-primary hover:underline">Voltar ao início</Link>
        </div>
      </Layout>
    );
  }

  const category = getCategoryById(article.category);
  const liked = isLiked(article.id);
  const isVisual = article.contentType === 'visual' && article.galleryUrls && article.galleryUrls.length > 0;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: article.title, text: article.summary, url: window.location.href });
    }
  };

  const scrollToChat = () => {
    document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLike = () => {
    if (!liked) {
      setShowBigHeart(true);
      setTimeout(() => setShowBigHeart(false), 600);
    }
    toggleLike(article.id);
  };

  const handleImageDoubleClick = () => {
    if (!liked) {
      toggleLike(article.id);
      setShowBigHeart(true);
      setTimeout(() => setShowBigHeart(false), 600);
    }
  };

  // Visual news layout
  if (isVisual) {
    return (
      <Layout showSidebars={false}>
        <motion.article className="mx-auto max-w-3xl py-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <VisualCarousel images={article.galleryUrls!} format={article.visualFormat || 'vertical'} className="mt-4" />
          <h1 className="mt-6 font-display text-2xl font-bold leading-tight md:text-3xl lg:text-4xl">{article.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className={cn("text-xs font-medium", getCategoryColor())}>
              {category?.icon && <category.icon className="mr-1 h-3 w-3" />}
              {category?.name}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-normal">
              <Calendar className="h-3 w-3" />
              {new Date(article.publishedAt).toLocaleDateString('pt-MZ', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button variant="default" size="sm" onClick={scrollToChat}>
              <MessageCircle className="h-4 w-4 mr-1" /> Explorar esta notícia
            </Button>
            <Button variant="outline" size="sm" onClick={handleLike} className={cn(liked && "border-red-200 bg-red-50 hover:bg-red-100")}>
              <Heart className={cn("h-4 w-4 mr-1", liked && "fill-red-500 text-red-500")} /> {liked ? 'Amei' : 'Curtir'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" /> Partilhar
            </Button>
          </div>

          {/* Chat BEFORE related */}
          <div className="mt-8">
            <ErrorBoundary><ArticleChat article={article} /></ErrorBoundary>
          </div>

          {/* Related slider AFTER chat */}
          <RelatedSlider articles={relatedArticles} />
        </motion.article>

        <Button
          className={cn(
            "fixed bottom-20 right-4 z-40 gap-2 shadow-lg md:hidden transition-all duration-300",
            showFloatingButton ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
          )}
          onClick={scrollToChat}
        >
          <MessageCircle className="h-4 w-4" /> Explorar esta notícia
        </Button>
      </Layout>
    );
  }

  // Regular article layout: Content → Chat → Related
  return (
    <Layout showSidebars={false}>
      <motion.article className="mx-auto max-w-3xl py-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <h1 className="font-display text-2xl font-bold leading-tight md:text-3xl lg:text-4xl">{article.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className={cn("text-xs font-medium", getCategoryColor())}>
            {category?.icon && <category.icon className="mr-1 h-3 w-3" />}
            {category?.name}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground font-normal">
            <Calendar className="h-3 w-3" />
            {new Date(article.publishedAt).toLocaleDateString('pt-MZ', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground font-normal">
            <Clock className="h-3 w-3" /> {article.readingTime} min de leitura
          </span>
        </div>

        <p className="mt-3 text-lg text-muted-foreground font-normal">{article.summary}</p>
        <p className="mt-2 text-sm text-muted-foreground font-normal">
          Por <span className="font-semibold text-foreground">{article.author}</span>
        </p>

        <div className="mt-4 flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="default" size="sm" onClick={scrollToChat}>
              <MessageCircle className="h-4 w-4 mr-1" /> Conversar
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline" size="sm" onClick={handleLike} className={cn(liked && "border-red-200 bg-red-50 hover:bg-red-100")}>
              <motion.div animate={liked ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.2 }}>
                <Heart className={cn("h-4 w-4 mr-1", liked && "fill-red-500 text-red-500")} />
              </motion.div>
              {liked ? 'Amei' : 'Curtir'}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" /> Partilhar
            </Button>
          </motion.div>
        </div>

        {/* Featured image */}
        {article.imageUrl && (
          <div className="mt-6 overflow-hidden rounded-xl relative cursor-pointer" onDoubleClick={handleImageDoubleClick}>
            <img src={article.imageUrl} alt="" className="w-full aspect-video object-cover" />
            <AnimatePresence>
              {showBigHeart && (
                <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                  <Heart className="h-32 w-32 fill-red-500 text-red-500 drop-shadow-lg" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Content */}
        <div className="mt-8 space-y-4">
          {article.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-lg leading-relaxed text-foreground">{paragraph}</p>
          ))}
        </div>

        {/* Quick Facts */}
        {article.quickFacts && article.quickFacts.length > 0 && (
          <div className="mt-8 rounded-xl border bg-muted/30 p-6">
            <h2 className="font-display text-lg font-bold mb-4">📌 Factos Rápidos</h2>
            <ul className="space-y-2">
              {article.quickFacts.map((fact, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="text-sm font-normal">{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Chat — BEFORE related articles */}
        <div className="mt-8">
          <ErrorBoundary><ArticleChat article={article} /></ErrorBoundary>
        </div>

        {/* Related articles slider — AFTER chat */}
        <RelatedSlider articles={relatedArticles} />
      </motion.article>

      <Button
        className={cn(
          "fixed bottom-20 right-4 z-40 gap-2 shadow-lg md:hidden transition-all duration-300",
          showFloatingButton ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
        )}
        onClick={scrollToChat}
      >
        <MessageCircle className="h-4 w-4" /> Conversar
      </Button>
    </Layout>
  );
}
