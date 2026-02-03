import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between md:h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="B NEWS" className="h-8 w-auto md:h-10" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Início
          </Link>
          <Link to="/categorias" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Categorias
          </Link>
          <Link to="/pesquisa" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Pesquisa
          </Link>
          <Link to="/guardados" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Guardados
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/pesquisa">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
              <span className="sr-only">Pesquisar</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
