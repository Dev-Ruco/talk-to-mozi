import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroChat } from '@/components/news/HeroChat';
import { CategoryChips } from '@/components/news/CategoryChips';
import { NewsFeed } from '@/components/news/NewsFeed';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Hero Chat - 70vh dominante */}
        <HeroChat />
        
        {/* Transition separator */}
        <div className="border-t pt-6">
          <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
            Últimas notícias de hoje
          </p>
          
          {/* Category chips */}
          <CategoryChips 
            selectedCategory={selectedCategory} 
            onSelect={setSelectedCategory} 
          />
        </div>

        {/* News Feed */}
        <section>
          <NewsFeed categoryFilter={selectedCategory} />
        </section>
      </div>
    </Layout>
  );
};

export default Index;
