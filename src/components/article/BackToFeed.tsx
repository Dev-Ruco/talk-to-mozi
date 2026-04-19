import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export function BackToFeed() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromFeed = (location.state as { fromFeed?: boolean } | null)?.fromFeed;

  const handleClick = () => {
    if (fromFeed) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar ao feed
    </button>
  );
}
