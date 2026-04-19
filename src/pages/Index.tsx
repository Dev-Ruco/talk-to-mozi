import { Layout } from '@/components/layout/Layout';
import { HeroSearch } from '@/components/news/HeroSearch';
import { TrendingTopics } from '@/components/news/TrendingTopics';
import { SocialNewsFeed } from '@/components/news/SocialNewsFeed';
import { FinalCta } from '@/components/news/FinalCta';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Index = () => {
  return (
    <Layout>
      <div className="space-y-6 md:space-y-8">
        <ErrorBoundary>
          <HeroSearch />
        </ErrorBoundary>

        <ErrorBoundary>
          <TrendingTopics />
        </ErrorBoundary>

        <ErrorBoundary>
          <SocialNewsFeed />
        </ErrorBoundary>

        <ErrorBoundary>
          <FinalCta />
        </ErrorBoundary>
      </div>
    </Layout>
  );
};

export default Index;
