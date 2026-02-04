import { Link } from 'react-router-dom';
import { Search, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 items-center justify-between md:h-14">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="B NEWS" className="h-7 w-auto md:h-8" />
        </Link>

        <div className="flex items-center gap-1">
          <Link to="/chat">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Search className="h-5 w-5" />
              <span className="sr-only">Pesquisar</span>
            </Button>
          </Link>
          <Link to="/guardados">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Amei</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
