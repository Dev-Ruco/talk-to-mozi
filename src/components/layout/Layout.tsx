import { ReactNode, useState, useEffect } from 'react';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { DesktopSidebar } from './DesktopSidebar';
import { RightSidebar } from './RightSidebar';

interface LayoutProps {
  children: ReactNode;
  showSidebars?: boolean;
}

export function Layout({ children, showSidebars = true }: LayoutProps) {
  const [showRightSidebar, setShowRightSidebar] = useState(false);

  // Show right sidebar only after scrolling past the hero
  useEffect(() => {
    if (!showSidebars) return;

    const handleScroll = () => {
      const scrolled = window.scrollY > window.innerHeight * 0.5;
      setShowRightSidebar(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showSidebars]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container">
        <div className="flex gap-6">
          {showSidebars && <DesktopSidebar />}
          
          <main className="flex-1 min-w-0 pb-20 md:pb-8">
            {children}
          </main>
          
          {showSidebars && (
            <RightSidebar visible={showRightSidebar} />
          )}
        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}
