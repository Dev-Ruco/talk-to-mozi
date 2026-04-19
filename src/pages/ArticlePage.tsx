import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { ArticleChat } from '@/components/news/ArticleChat';
import { VisualCarousel } from '@/components/news/VisualCarousel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ReadingProgressBar } from '@/components/article/ReadingProgressBar';
import { BackToFeed } from '@/components/article/BackToFeed';
import { ArticleHero } from '@/components/article/ArticleHero';
import { ArticleActions } from '@/components/article/ArticleActions';
import { ArticleBody } from '@/components/article/ArticleBody';
import { InlineAIPrompt } from '@/components/article/InlineAIPrompt';
import { ContinueReading } from '@/components/article/ContinueReading';
import { NextArticlePreview } from '@/components/article/NextArticlePreview';
import { useArticle, useRelatedArticles } from '@/hooks/usePublishedArticles';
import { useLikedArticles } from '@/hooks/useLikedArticles';
import { cn } from '@/lib/utils';

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { isLiked, toggleLike } = useLikedArticles();
  const [showBigHeart, setShowBigHeart] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  // Scroll to top when page loads or article changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  const { data: article, isLoading, isError } = useArticle(id);
  const { data: relatedArticles = [] } = useRelatedArticles(article?.category, id || '', 3);

  const paragraphs = useMemo(() => {
    if (!article?.content) return [];
    return article.content.split('\n\n').map((p) => p.trim()).filter(Boolean);
  }, [article?.content]);

  // Insert inline AI prompt after 2 paragraphs (short articles) or 3 (longer)
  const splitAt = paragraphs.length >= 5 ? 3 : 2;

  // Loading state
  if (isLoading) {
    return (
      <Layout showSidebars={false}>
        <div className="mx-auto max-w-2xl px-4 py-6">
          <Skeleton className="mb-6 h-5 w-32" />
          <Skeleton className="mb-6 aspect-[16/9] w-full rounded-2xl" />
          <Skeleton className="mb-3 h-5 w-24" />
          <Skeleton className="mb-3 h-10 w-full" />
          <Skeleton className="mb-6 h-10 w-3/4" />
          <Skeleton className="mb-2 h-5 w-full" />
          <Skeleton className="mb-6 h-5 w-2/3" />
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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h1 className="text-2xl font-bold">Artigo não encontrado</h1>
          <p className="mt-2 text-muted-foreground">
            O artigo que procura não existe ou ainda não foi publicado.
          </p>
          <Link to="/" className="mt-4 text-primary hover:underline">
            Voltar ao início
          </Link>
        </div>
      </Layout>
    );
  }

  const liked = isLiked(article.id);
  const isVisual =
    article.contentType === 'visual' && article.galleryUrls && article.galleryUrls.length > 0;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href,
        });
      } catch {
        // user cancelled — ignore
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const scrollToChat = () => {
    document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const handleAskAI = (question: string) => {
    setPendingQuestion(question);
    scrollToChat();
  };

  return (
    <Layout showSidebars={false}>
      <ReadingProgressBar />

      <motion.article
        className="mx-auto max-w-2xl px-4 py-6 md:py-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="mb-6">
          <BackToFeed />
        </div>

        {isVisual ? (
          <>
            <VisualCarousel
              images={article.galleryUrls!}
              format={article.visualFormat || 'vertical'}
            />
            <div className="mt-6">
              <ArticleHero article={{ ...article, imageUrl: undefined }} />
            </div>
          </>
        ) : (
          <div
            className="relative"
            onDoubleClick={handleImageDoubleClick}
          >
            <ArticleHero article={article} />
            <AnimatePresence>
              {showBigHeart && article.imageUrl && (
                <motion.div
                  className="pointer-events-none absolute inset-0 flex items-start justify-center pt-[20%]"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <Heart className="h-32 w-32 fill-red-500 text-red-500 drop-shadow-lg" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-6">
          <ArticleActions
            liked={liked}
            onChat={scrollToChat}
            onLike={handleLike}
            onShare={handleShare}
            sticky
          />
        </div>

        {paragraphs.length > 0 && (
          <div className="mt-8 space-y-8">
            <ArticleBody paragraphs={paragraphs} from={0} to={splitAt} />
            {paragraphs.length > splitAt && <InlineAIPrompt onAsk={handleAskAI} />}
            <ArticleBody paragraphs={paragraphs} from={splitAt} />
          </div>
        )}

        {article.quickFacts && article.quickFacts.length > 0 && (
          <aside className="mt-10 rounded-2xl border bg-muted/30 p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">📌 Factos Rápidos</h2>
            <ul className="space-y-2">
              {article.quickFacts.map((fact, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-sm">{fact}</span>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div className="mt-10">
          <ErrorBoundary>
            <ArticleChat
              article={article}
              initialQuestion={pendingQuestion}
              onInitialQuestionConsumed={() => setPendingQuestion(null)}
            />
          </ErrorBoundary>
        </div>

        {relatedArticles.length > 0 && (
          <div className="mt-12">
            <ContinueReading articles={relatedArticles} />
          </div>
        )}

        <div className="mt-12">
          <NextArticlePreview currentArticle={article} />
        </div>
      </motion.article>
    </Layout>
  );
}

// Tailwind safelist hints (cn import kept for potential future use)
void cn;
void Button;
