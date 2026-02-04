import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { categories } from '@/data/categories';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { User, Bell, Palette, Trash2 } from 'lucide-react';

export default function ProfilePage() {
  const [notifications, setNotifications] = useState(false);
  const [followedCategories, setFollowedCategories] = useState<string[]>([]);
  const { savedIds } = useSavedArticles();

  const toggleCategory = (categoryId: string) => {
    setFollowedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearSaved = () => {
    localStorage.removeItem('bnews_saved_articles');
    window.location.reload();
  };

  return (
    <Layout>
      <div className="space-y-8 py-4">
        <header>
          <h1 className="font-display text-2xl font-bold md:text-3xl">
            Perfil
          </h1>
          <p className="mt-1 text-muted-foreground">
            Personalize a sua experiência
          </p>
        </header>

        {/* User card */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Leitor Anónimo</h2>
              <p className="text-sm text-muted-foreground">
                {savedIds.length} {savedIds.length === 1 ? 'notícia guardada' : 'notícias guardadas'}
              </p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <section className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-display font-semibold">Notificações</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Receber alertas de notícias</Label>
              <p className="text-sm text-muted-foreground">
                Seja notificado sobre as notícias mais importantes
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
        </section>

        {/* Followed categories */}
        <section className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-display font-semibold">Categorias Favoritas</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Selecione as categorias que mais lhe interessam
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                  followedCategories.includes(category.id)
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-accent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <category.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className={`h-4 w-4 rounded-full border-2 ${
                  followedCategories.includes(category.id)
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                }`} />
              </button>
            ))}
          </div>
        </section>

        {/* Clear data */}
        <section className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="h-5 w-5 text-destructive" />
            <h2 className="font-display font-semibold">Limpar Dados</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Remover todas as notícias guardadas e preferências
          </p>
          <Button variant="destructive" size="sm" onClick={clearSaved}>
            Limpar tudo
          </Button>
        </section>
      </div>
    </Layout>
  );
}
