import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Inbox,
  Clock,
  Edit3,
  Calendar,
  CheckCircle,
  Rss,
  Megaphone,
  Bot,
  Users,
  Settings,
  LayoutDashboard,
  LogOut,
  Image,
} from 'lucide-react';
import { signOutAdmin, useAdminAuth } from '../../hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/inbox', icon: Inbox, label: 'Inbox', roles: ['admin', 'editor_chefe', 'editor', 'revisor'] },
  { to: '/admin/pending', icon: Clock, label: 'Pendentes', roles: ['admin', 'editor_chefe', 'revisor'] },
  { to: '/admin/editing', icon: Edit3, label: 'Em Edição', roles: ['admin', 'editor_chefe', 'editor'] },
  { to: '/admin/scheduled', icon: Calendar, label: 'Agendadas', roles: ['admin', 'editor_chefe'] },
  { to: '/admin/published', icon: CheckCircle, label: 'Publicadas' },
  { divider: true },
  { to: '/admin/media', icon: Image, label: 'Galeria', roles: ['admin', 'editor_chefe', 'editor'] },
  { to: '/admin/sources', icon: Rss, label: 'Fontes', roles: ['admin', 'editor_chefe'] },
  { to: '/admin/ads', icon: Megaphone, label: 'Publicidade', roles: ['admin'] },
  { to: '/admin/agent', icon: Bot, label: 'Agente IA', roles: ['admin', 'editor_chefe'] },
  { divider: true },
  { to: '/admin/team', icon: Users, label: 'Equipa', roles: ['admin'] },
  { to: '/admin/settings', icon: Settings, label: 'Definições', roles: ['admin'] },
];

export function AdminSidebar() {
  const { role, hasRole, user } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOutAdmin();
      toast.success('Sessão terminada');
      navigate('/admin/login');
    } catch (error) {
      toast.error('Erro ao terminar sessão');
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <span className="text-xl font-bold text-primary">B NEWS</span>
        <span className="ml-2 text-xs text-muted-foreground">CRM</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item, index) => {
          if ('divider' in item) {
            return <div key={index} className="my-2 border-t border-border" />;
          }

          // Check role access
          if (item.roles && !item.roles.some(r => hasRole(r as any))) {
            return null;
          }

          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
        <div className="mb-2 px-3 text-xs text-muted-foreground">
          <div className="truncate font-medium">{user?.email}</div>
          <div className="capitalize">{role}</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Terminar sessão
        </Button>
      </div>
    </aside>
  );
}
