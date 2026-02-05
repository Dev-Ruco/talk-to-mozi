import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAdminAuth, AuthError } from '../../hooks/useAdminAuth';
import { Loader2, ShieldX, LogIn, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  hideHeader?: boolean;
}

const ERROR_MESSAGES: Record<NonNullable<AuthError>, string> = {
  no_session: 'Sessão expirada. Por favor, inicie sessão novamente.',
  no_role: 'A sua conta não tem permissões para aceder ao backoffice.',
  role_fetch_failed: 'Erro ao verificar permissões. Tente novamente.',
};

export function AdminLayout({ children, title, hideHeader = false }: AdminLayoutProps) {
  const { isLoading, isAuthenticated, authError, session } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only auto-redirect if there's no session at all
    if (!isLoading && !session) {
      navigate('/admin/login');
    }
  }, [isLoading, session, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">A carregar...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const errorMessage = authError ? ERROR_MESSAGES[authError] : 'Acesso não autorizado.';
    const showRetry = authError === 'role_fetch_failed';
    
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 text-center max-w-md px-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-10 w-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Acesso Negado</h1>
            <p className="text-muted-foreground">{errorMessage}</p>
          </div>
          <div className="flex gap-3">
            {showRetry && (
              <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </Button>
            )}
            <Button onClick={() => navigate('/admin/login')} className="gap-2">
              <LogIn className="h-4 w-4" />
              Iniciar Sessão
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="ml-56">
        {!hideHeader && <AdminHeader title={title} />}
        <main className={hideHeader ? "" : "p-6"}>{children}</main>
      </div>
    </div>
  );
}
