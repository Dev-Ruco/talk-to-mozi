import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroChat } from '@/components/news/HeroChat';
import { CategoryChips } from '@/components/news/CategoryChips';
import { NewsFeed } from '@/components/news/NewsFeed';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <Layout>
      <div className="space-y-6 py-4">
        <HeroChat />
        
        <div>
          <CategoryChips 
            selectedCategory={selectedCategory} 
            onSelect={setSelectedCategory} 
          />
        </div>

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold">
            {selectedCategory ? 'Notícias' : 'Últimas Notícias'}
          </h2>
          <NewsFeed categoryFilter={selectedCategory} />
        </section>
      </div>
    </Layout>
  );
};

export default Index;
