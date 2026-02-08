import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ArticleEditor } from '../components/editor/ArticleEditor';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Article } from '../types/admin';
import { useAdminAuth } from '../hooks/useAdminAuth';

export default function ArticleEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    if (id && isAuthenticated) {
      fetchArticle();
    }
  }, [id, isAuthenticated, authLoading]);

  const fetchArticle = async () => {
    if (!id) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        source:sources(*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching article:', error);
      setNotFound(true);
    } else {
      const asArticle = data as unknown as Article;
      // Auto-convert to visual if ?visual=true
      if (searchParams.get('visual') === 'true' && asArticle.content_type !== 'visual') {
        asArticle.content_type = 'visual';
        asArticle.visual_format = 'vertical';
      }
      setArticle(asArticle);
    }
    setIsLoading(false);
  };

  const handleUpdate = (updates: Partial<Article>) => {
    if (article) {
      setArticle({ ...article, ...updates });
    }
  };

  const handleSave = async () => {
    if (!article) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from('articles')
      .update({
        title: article.title,
        lead: article.lead,
        content: article.content,
        quick_facts: article.quick_facts,
        tags: article.tags,
        category: article.category,
        location: article.location,
        image_url: article.image_url,
        image_caption: article.image_caption,
        highlight_type: article.highlight_type,
        seo_title: article.seo_title,
        seo_slug: article.seo_slug,
        author: article.author,
        content_type: article.content_type || 'article',
        visual_format: article.visual_format,
        gallery_urls: article.gallery_urls,
        updated_at: new Date().toISOString(),
      })
      .eq('id', article.id);

    if (error) {
      toast.error('Erro ao guardar: ' + error.message);
    } else {
      toast.success('Artigo guardado com sucesso');
    }
    setIsSaving(false);
  };

  const handlePublish = async () => {
    if (!article) return;
    
    setIsSaving(true);
    // For visual news, auto-fill image_url from first gallery image
    const imageUrl = article.content_type === 'visual' && article.gallery_urls?.length
      ? article.gallery_urls[0]
      : article.image_url;

    const { error } = await supabase
      .from('articles')
      .update({
        title: article.title,
        lead: article.lead,
        content: article.content,
        quick_facts: article.quick_facts,
        tags: article.tags,
        category: article.category,
        location: article.location,
        image_url: imageUrl,
        image_caption: article.image_caption,
        highlight_type: article.highlight_type,
        seo_title: article.seo_title,
        seo_slug: article.seo_slug,
        author: article.author,
        content_type: article.content_type || 'article',
        visual_format: article.visual_format,
        gallery_urls: article.gallery_urls,
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', article.id);

    if (error) {
      toast.error('Erro ao publicar: ' + error.message);
    } else {
      toast.success('Artigo publicado com sucesso!');
      navigate('/admin/pipeline');
    }
    setIsSaving(false);
  };

  const handleSchedule = async (scheduledAt: Date) => {
    if (!article) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from('articles')
      .update({
        title: article.title,
        lead: article.lead,
        content: article.content,
        status: 'scheduled',
        scheduled_at: scheduledAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', article.id);

    if (error) {
      toast.error('Erro ao agendar: ' + error.message);
    } else {
      toast.success('Artigo agendado com sucesso!');
      navigate('/admin/pipeline');
    }
    setIsSaving(false);
  };

  if (authLoading || isLoading) {
    return (
      <AdminLayout title="A carregar...">
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (notFound) {
    return (
      <AdminLayout title="Artigo não encontrado">
        <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">O artigo solicitado não existe ou foi removido.</p>
          <Button asChild>
            <Link to="/admin/pipeline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Pipeline
            </Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <AdminLayout 
      title={article.title || article.original_title || 'Editor de Artigo'}
      hideHeader
    >
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Mini Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-background">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/pipeline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground truncate max-w-md">
              {article.title || article.original_title || 'Sem título'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
            <span>ID: {article.id.slice(0, 8)}...</span>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <ArticleEditor
            article={article}
            onUpdate={handleUpdate}
            onSave={handleSave}
            onPublish={handlePublish}
            onSchedule={handleSchedule}
            isSaving={isSaving}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
