import { Layout } from '@/components/layout/Layout';
import { HeroSearch } from '@/components/news/HeroSearch';
import { TrendingTopics } from '@/components/news/TrendingTopics';
import { FeaturedStory } from '@/components/news/FeaturedStory';
import { LatestNewsBlock } from '@/components/news/LatestNewsBlock';
import { MostReadList } from '@/components/news/MostReadList';
import { CategoryBlocks } from '@/components/news/CategoryBlocks';
import { FinalCta } from '@/components/news/FinalCta';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Index = () => {
  return (
    <Layout>
      <div className="space-y-12 md:space-y-16">
        <ErrorBoundary>
          <HeroSearch />
        </ErrorBoundary>

        <ErrorBoundary>
          <TrendingTopics />
        </ErrorBoundary>

        <ErrorBoundary>
          <FeaturedStory />
        </ErrorBoundary>

        <ErrorBoundary>
          <LatestNewsBlock />
        </ErrorBoundary>

        <ErrorBoundary>
          <MostReadList />
        </ErrorBoundary>

        <ErrorBoundary>
          <CategoryBlocks />
        </ErrorBoundary>

        <ErrorBoundary>
          <FinalCta />
        </ErrorBoundary>
      </div>
    </Layout>
  );
};

export default Index;
