import { ReactNode } from 'react';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { DesktopSidebar } from './DesktopSidebar';
import { BreakingNewsBanner } from '@/components/news/BreakingNewsBanner';

interface LayoutProps {
  children: ReactNode;
  showSidebars?: boolean;
}

export function Layout({ children, showSidebars = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreakingNewsBanner />
      
      <div className="container">
        <div className="flex gap-6">
          {showSidebars && <DesktopSidebar />}
          
          <main className="flex-1 min-w-0 pb-20 md:pb-8">
            {children}
          </main>
        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}
