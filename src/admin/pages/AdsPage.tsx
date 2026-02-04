import { AdminLayout } from '../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Megaphone } from 'lucide-react';

export default function AdsPage() {
  return (
    <AdminLayout title="Publicidade">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Gerir campanhas e anúncios patrocinados.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova campanha
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Campanhas
              </CardTitle>
              <CardDescription>
                Nenhuma campanha activa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Crie campanhas para gerir os anúncios patrocinados que aparecem no feed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
