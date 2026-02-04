import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <motion.aside 
      className={cn(
        "sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 xl:block"
      )}
      initial={{ opacity: 0, x: 20 }}
      animate={{ 
        opacity: visible ? 1 : 0,
        x: visible ? 0 : 20,
        pointerEvents: visible ? 'auto' : 'none'
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
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
            {trending.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <NewsCard
                  article={article}
                  variant="sidebar"
                />
              </motion.div>
            ))}
            
            {/* Sponsored item at the end */}
            <motion.div 
              className="pt-2 border-t"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <SponsoredCard 
                ad={sponsoredAds[1]} 
                variant="sidebar" 
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
