import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Inbox, 
  Clock, 
  CheckCircle, 
  Calendar, 
  TrendingUp, 
  Rss,
  AlertCircle,
  FileText
} from 'lucide-react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  inbox: number;
  pending: number;
  scheduled: number;
  published: number;
  sources: number;
  todayPublished: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    inbox: 0,
    pending: 0,
    scheduled: 0,
    published: 0,
    sources: 0,
    todayPublished: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch counts in parallel
      const [
        inboxRes,
        pendingRes,
        scheduledRes,
        publishedRes,
        sourcesRes,
        todayRes,
      ] = await Promise.all([
        supabase.from('articles').select('id', { count: 'exact', head: true }).in('status', ['captured', 'rewritten']),
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'scheduled'),
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('sources').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('articles').select('id', { count: 'exact', head: true })
          .eq('status', 'published')
          .gte('published_at', new Date().toISOString().split('T')[0]),
      ]);

      setStats({
        inbox: inboxRes.count || 0,
        pending: pendingRes.count || 0,
        scheduled: scheduledRes.count || 0,
        published: publishedRes.count || 0,
        sources: sourcesRes.count || 0,
        todayPublished: todayRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Inbox',
      value: stats.inbox,
      icon: Inbox,
      description: 'Notícias captadas',
      link: '/admin/inbox',
      color: 'text-blue-500',
    },
    {
      title: 'Pendentes',
      value: stats.pending,
      icon: Clock,
      description: 'Aguardam revisão',
      link: '/admin/pending',
      color: 'text-yellow-500',
    },
    {
      title: 'Agendadas',
      value: stats.scheduled,
      icon: Calendar,
      description: 'Para publicação',
      link: '/admin/scheduled',
      color: 'text-purple-500',
    },
    {
      title: 'Publicadas',
      value: stats.published,
      icon: CheckCircle,
      description: 'Total no sistema',
      link: '/admin/published',
      color: 'text-green-500',
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} to={stat.link}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? '...' : stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Today Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Publicadas hoje</span>
                <span className="font-semibold">{stats.todayPublished}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fontes activas</span>
                <span className="font-semibold">{stats.sources}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              Acções Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/admin/inbox">
                <Inbox className="mr-2 h-4 w-4" />
                Ver Inbox ({stats.inbox})
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/admin/pending">
                <Clock className="mr-2 h-4 w-4" />
                Rever Pendentes ({stats.pending})
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/admin/sources">
                <Rss className="mr-2 h-4 w-4" />
                Gerir Fontes
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Agent Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-primary" />
              Agente IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado</span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Activo</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Última execução</span>
                <span className="text-sm">Há 5 min</span>
              </div>
              <Button variant="secondary" className="w-full" asChild>
                <Link to="/admin/agent">Ver detalhes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
