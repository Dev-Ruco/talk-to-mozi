import { AdminLayout } from '../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';

export default function TeamPage() {
  return (
    <AdminLayout title="Equipa">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Gerir membros da equipa editorial e suas permissões.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar membro
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Membros da Equipa
            </CardTitle>
            <CardDescription>
              Adicione utilizadores com roles de Admin, Editor-Chefe, Editor ou Revisor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Para adicionar um membro, primeiro o utilizador precisa criar uma conta no sistema.
              Depois pode atribuir-lhe um role aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
