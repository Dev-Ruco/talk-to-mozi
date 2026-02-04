import { useState, useEffect } from 'react';
import { Plus, Users, Trash2, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, ROLE_LABELS } from '../types/admin';

interface UserWithRole {
  id: string;
  user_id: string;
  role: AppRole;
  email?: string;
}

const ROLE_COLORS: Record<AppRole, string> = {
  admin: 'bg-red-500',
  editor_chefe: 'bg-purple-500',
  editor: 'bg-blue-500',
  revisor: 'bg-green-500',
};

export default function TeamPage() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [form, setForm] = useState({
    user_id: '',
    role: 'editor' as AppRole,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('role', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar utilizadores');
    } else {
      setUsers(data as UserWithRole[]);
    }
    
    setIsLoading(false);
  };

  const addUserRole = async () => {
    if (!form.user_id) {
      toast.error('Insira o ID do utilizador');
      return;
    }

    setIsSaving(true);
    
    // Check if user already has this role
    const existing = users.find(u => u.user_id === form.user_id);
    if (existing) {
      toast.error('Este utilizador já tem um role atribuído');
      setIsSaving(false);
      return;
    }

    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: form.user_id,
        role: form.role,
      });

    if (error) {
      if (error.code === '23503') {
        toast.error('Utilizador não encontrado. Verifique o ID.');
      } else if (error.code === '23505') {
        toast.error('Este utilizador já tem este role.');
      } else {
        toast.error('Erro: ' + error.message);
      }
    } else {
      toast.success('Role atribuído com sucesso');
      setDialogOpen(false);
      setForm({ user_id: '', role: 'editor' });
      fetchUsers();
    }
    
    setIsSaving(false);
  };

  const updateRole = async (userId: string, newRole: AppRole) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      toast.error('Erro: ' + error.message);
    } else {
      toast.success('Role actualizado');
      fetchUsers();
    }
  };

  const deleteUserRole = async (id: string) => {
    if (!confirm('Tem a certeza que quer remover este membro da equipa?')) return;
    
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro: ' + error.message);
    } else {
      toast.success('Membro removido');
      fetchUsers();
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Equipa">
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Equipa">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Gerir membros da equipa editorial e suas permissões.
          </p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Membro</DialogTitle>
                <DialogDescription>
                  Atribuir um role a um utilizador existente.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user_id">ID do Utilizador (UUID)</Label>
                  <Input
                    id="user_id"
                    value={form.user_id}
                    onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                  <p className="text-xs text-muted-foreground">
                    O utilizador deve primeiro criar uma conta no sistema.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(value) => setForm({ ...form, role: value as AppRole })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="editor_chefe">Editor-Chefe</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="revisor">Revisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Role descriptions */}
                <div className="rounded-lg border bg-muted/30 p-3 space-y-2 text-xs">
                  <p><strong>Admin:</strong> Acesso total ao sistema</p>
                  <p><strong>Editor-Chefe:</strong> Gerir fontes, publicar, agendar</p>
                  <p><strong>Editor:</strong> Editar e aprovar artigos</p>
                  <p><strong>Revisor:</strong> Rever e sugerir alterações</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={addUserRole} disabled={isSaving}>
                  {isSaving ? 'A adicionar...' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {users.length === 0 ? (
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
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID do Utilizador</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-sm">
                      {user.user_id}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => updateRole(user.user_id, value as AppRole)}
                      >
                        <SelectTrigger className="w-40">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${ROLE_COLORS[user.role]}`} />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-red-500" />
                              Administrador
                            </div>
                          </SelectItem>
                          <SelectItem value="editor_chefe">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-purple-500" />
                              Editor-Chefe
                            </div>
                          </SelectItem>
                          <SelectItem value="editor">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-blue-500" />
                              Editor
                            </div>
                          </SelectItem>
                          <SelectItem value="revisor">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-green-500" />
                              Revisor
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteUserRole(user.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Security Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-primary" />
              Permissões por Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <Badge className="bg-red-500">Administrador</Badge>
                <ul className="mt-2 text-xs text-muted-foreground space-y-1">
                  <li>• Acesso total</li>
                  <li>• Gerir equipa</li>
                  <li>• Publicidade</li>
                  <li>• Configurações</li>
                </ul>
              </div>
              <div className="space-y-1">
                <Badge className="bg-purple-500">Editor-Chefe</Badge>
                <ul className="mt-2 text-xs text-muted-foreground space-y-1">
                  <li>• Gerir fontes</li>
                  <li>• Publicar artigos</li>
                  <li>• Agendar</li>
                  <li>• Ver logs</li>
                </ul>
              </div>
              <div className="space-y-1">
                <Badge className="bg-blue-500">Editor</Badge>
                <ul className="mt-2 text-xs text-muted-foreground space-y-1">
                  <li>• Editar artigos</li>
                  <li>• Aprovar</li>
                  <li>• Atribuir categoria</li>
                </ul>
              </div>
              <div className="space-y-1">
                <Badge className="bg-green-500">Revisor</Badge>
                <ul className="mt-2 text-xs text-muted-foreground space-y-1">
                  <li>• Ver artigos</li>
                  <li>• Sugerir alterações</li>
                  <li>• Marcar para revisão</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
