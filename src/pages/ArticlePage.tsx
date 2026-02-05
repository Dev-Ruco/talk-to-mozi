import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, Share2, Heart, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { ArticleChat } from '@/components/news/ArticleChat';
import { NewsCard } from '@/components/news/NewsCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useArticle, useRelatedArticles } from '@/hooks/usePublishedArticles';
import { getCategoryById, getCategoryColor } from '@/data/categories';
import { useLikedArticles } from '@/hooks/useLikedArticles';
import { cn } from '@/lib/utils';

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { isLiked, toggleLike } = useLikedArticles();
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const [showBigHeart, setShowBigHeart] = useState(false);

  // Scroll to top when page loads or article changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);
  
  // Fetch article from database
  const { data: article, isLoading, isError } = useArticle(id);
  
  // Fetch related articles
  const { data: relatedArticles = [] } = useRelatedArticles(
    article?.category,
    id || '',
    4
  );
  
  // Hide floating button when near the chat section
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

  // Loading state
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

  // Error or not found
  if (isError || !article) {
    return (
      <Layout showSidebars={false}>
        <div className="flex flex-col items-center justify-center py-20">
          <h1 className="text-2xl font-bold">Artigo não encontrado</h1>
          <p className="mt-2 text-muted-foreground">O artigo que procura não existe ou ainda não foi publicado.</p>
          <Link to="/" className="mt-4 text-primary hover:underline">
            Voltar ao início
          </Link>
        </div>
      </Layout>
    );
  }

  const category = getCategoryById(article.category);
  const liked = isLiked(article.id);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href,
      });
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

  return (
    <Layout showSidebars={false}>
      <motion.article 
        className="mx-auto max-w-3xl py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Back navigation */}
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        {/* 1. Title */}
        <h1 className="font-display text-2xl font-bold leading-tight md:text-3xl lg:text-4xl">
          {article.title}
        </h1>

        {/* 2. Meta information */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Badge 
            variant="secondary" 
            className={cn("text-xs", getCategoryColor())}
          >
            {category?.icon && <category.icon className="mr-1 h-3 w-3" />}
            {category?.name}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(article.publishedAt).toLocaleDateString('pt-MZ', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {article.readingTime} min de leitura
          </span>
        </div>

        <p className="mt-3 text-lg text-muted-foreground">
          {article.summary}
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Por <span className="font-medium text-foreground">{article.author}</span>
        </p>

        {/* Action buttons */}
        <div className="mt-4 flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="default" size="sm" onClick={scrollToChat}>
              <MessageCircle className="h-4 w-4 mr-1" />
              Conversar
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLike}
              className={cn(liked && "border-red-200 bg-red-50 hover:bg-red-100")}
            >
              <motion.div
                animate={liked ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.2 }}
              >
                <Heart className={cn("h-4 w-4 mr-1", liked && "fill-red-500 text-red-500")} />
              </motion.div>
              {liked ? 'Amei' : 'Curtir'}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Partilhar
            </Button>
          </motion.div>
        </div>

        {/* 3. Featured image with double-click to like */}
        {article.imageUrl && (
          <div 
            className="mt-6 overflow-hidden rounded-xl relative cursor-pointer"
            onDoubleClick={handleImageDoubleClick}
          >
            <img
              src={article.imageUrl}
              alt=""
              className="w-full aspect-video object-cover"
            />
            {/* Big heart animation */}
            <AnimatePresence>
              {showBigHeart && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Heart className="h-32 w-32 fill-red-500 text-red-500 drop-shadow-lg" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 4. Content - very legible */}
        <div className="mt-8 space-y-4">
          {article.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-lg leading-relaxed text-foreground">
              {paragraph}
            </p>
          ))}
        </div>

        {/* 5. Quick Facts */}
        {article.quickFacts && article.quickFacts.length > 0 && (
          <div className="mt-8 rounded-xl border bg-muted/30 p-6">
            <h2 className="font-display text-lg font-semibold mb-4">
              📌 Factos Rápidos
            </h2>
            <ul className="space-y-2">
              {article.quickFacts.map((fact, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="text-sm">{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 6. Related articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-8 border-t pt-6">
            <h2 className="font-display text-lg font-semibold mb-4">
              Notícias Relacionadas
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedArticles.map((related) => (
                <NewsCard
                  key={related.id}
                  article={related}
                  variant="compact"
                />
              ))}
            </div>
          </section>
        )}

        {/* 7. Chat with article (at the end) */}
        <div className="mt-8">
          <ArticleChat article={article} />
        </div>
      </motion.article>

      {/* Floating button for mobile */}
      <Button
        className={cn(
          "fixed bottom-20 right-4 z-40 gap-2 shadow-lg md:hidden transition-all duration-300",
          showFloatingButton 
            ? "translate-y-0 opacity-100" 
            : "translate-y-20 opacity-0 pointer-events-none"
        )}
        onClick={scrollToChat}
      >
        <MessageCircle className="h-4 w-4" />
        Conversar
      </Button>
    </Layout>
  );
}