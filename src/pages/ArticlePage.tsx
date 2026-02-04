import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, Share2, Bookmark, MessageCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ArticleChat } from '@/components/news/ArticleChat';
import { NewsCard } from '@/components/news/NewsCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getArticleById, getRelatedArticles } from '@/data/articles';
import { getCategoryById, getCategoryColor } from '@/data/categories';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { cn } from '@/lib/utils';

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { isSaved, toggleSave } = useSavedArticles();
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  
  const article = getArticleById(id || '');
  
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
  
  if (!article) {
    return (
      <Layout showSidebars={false}>
        <div className="flex flex-col items-center justify-center py-20">
          <h1 className="text-2xl font-bold">Artigo não encontrado</h1>
          <p className="mt-2 text-muted-foreground">O artigo que procura não existe.</p>
          <Link to="/" className="mt-4 text-primary hover:underline">
            Voltar ao início
          </Link>
        </div>
      </Layout>
    );
  }

  const category = getCategoryById(article.category);
  const relatedArticles = getRelatedArticles(article);
  const saved = isSaved(article.id);

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

  return (
    <Layout showSidebars={false}>
      <article className="mx-auto max-w-3xl py-4">
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
            className={cn("text-xs", getCategoryColor(article.category))}
          >
            {category?.icon} {category?.name}
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
          <Button variant="default" size="sm" onClick={scrollToChat}>
            <MessageCircle className="h-4 w-4 mr-1" />
            Conversar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => toggleSave(article.id)}
          >
            <Bookmark className={cn("h-4 w-4 mr-1", saved && "fill-primary text-primary")} />
            {saved ? 'Guardado' : 'Guardar'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-1" />
            Partilhar
          </Button>
        </div>

        {/* 3. Featured image */}
        {article.imageUrl && (
          <div className="mt-6 overflow-hidden rounded-xl">
            <img
              src={article.imageUrl}
              alt=""
              className="w-full aspect-video object-cover"
            />
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
        {article.quickFacts.length > 0 && (
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
                  isSaved={isSaved(related.id)}
                  onToggleSave={() => toggleSave(related.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 7. Chat with article (at the end) */}
        <div className="mt-8">
          <ArticleChat article={article} />
        </div>
      </article>

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
