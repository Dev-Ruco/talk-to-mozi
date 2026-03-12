import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroChat } from '@/components/news/HeroChat';
import { FeaturedArticle } from '@/components/news/FeaturedArticle';
import { CategoryChips } from '@/components/news/CategoryChips';
import { NewsFeed } from '@/components/news/NewsFeed';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <Layout>
      <div className="space-y-6">
        <ErrorBoundary>
          <HeroChat />
        </ErrorBoundary>

        <ErrorBoundary>
          <FeaturedArticle />
        </ErrorBoundary>
        
        <div className="border-t pt-6">
          <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
            Últimas notícias de hoje
          </p>
          <CategoryChips 
            selectedCategory={selectedCategory} 
            onSelect={setSelectedCategory} 
          />
        </div>

        <ErrorBoundary>
          <section>
            <NewsFeed categoryFilter={selectedCategory} />
          </section>
        </ErrorBoundary>
      </div>
    </Layout>
  );
};

export default Index;
