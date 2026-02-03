import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { categories } from '@/data/categories';
import { getArticlesByCategory } from '@/data/articles';

export default function CategoriesPage() {
  return (
    <Layout>
      <div className="space-y-6 py-4">
        <header>
          <h1 className="font-display text-2xl font-bold md:text-3xl">
            Categorias
          </h1>
          <p className="mt-1 text-muted-foreground">
            Explore as notícias por tema
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const articleCount = getArticlesByCategory(category.id).length;
            
            return (
              <Link
                key={category.id}
                to={`/categoria/${category.id}`}
                className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-4xl">{category.icon}</span>
                    <h2 className="mt-3 font-display text-xl font-semibold group-hover:text-primary transition-colors">
                      {category.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {articleCount} {articleCount === 1 ? 'notícia' : 'notícias'}
                    </p>
                  </div>
                  <div className={`h-3 w-3 rounded-full ${category.color}`} />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
