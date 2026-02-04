import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { getTrendingArticles } from '@/data/articles';
import { sponsoredAds } from '@/data/ads';
import { NewsCard } from '@/components/news/NewsCard';
import { SponsoredCard } from '@/components/news/SponsoredCard';
import { cn } from '@/lib/utils';

interface RightSidebarProps {
  visible?: boolean;
}

export function RightSidebar({ visible = true }: RightSidebarProps) {
  const trending = getTrendingArticles().slice(0, 4);

  return (
    <aside 
      className={cn(
        "sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 xl:block transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="flex h-full flex-col py-6 pl-6">
        {/* Trending Section */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              Tendências
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {trending.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                variant="sidebar"
              />
            ))}
            
            {/* Sponsored item at the end */}
            <div className="pt-2 border-t">
              <SponsoredCard 
                ad={sponsoredAds[1]} 
                variant="sidebar" 
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
