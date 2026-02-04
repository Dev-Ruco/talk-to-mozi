-- Criar ENUMs para o CRM Editorial
CREATE TYPE article_status AS ENUM (
  'captured',
  'rewritten',
  'pending',
  'approved',
  'needs_image',
  'scheduled',
  'published',
  'rejected'
);

CREATE TYPE source_type AS ENUM ('rss', 'website', 'api');
CREATE TYPE credibility_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE app_role AS ENUM ('admin', 'editor_chefe', 'editor', 'revisor');

-- Tabela sources (fontes de noticias)
CREATE TABLE public.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type source_type DEFAULT 'rss',
  credibility credibility_level DEFAULT 'medium',
  categories TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  last_fetch_at TIMESTAMPTZ,
  articles_captured INTEGER DEFAULT 0,
  duplicates_found INTEGER DEFAULT 0,
  fetch_interval_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela articles (noticias)
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Dados originais (fonte)
  original_title TEXT,
  original_content TEXT,
  source_id UUID REFERENCES public.sources(id) ON DELETE SET NULL,
  source_url TEXT,
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Dados B NEWS (editados)
  title TEXT,
  lead TEXT,
  content TEXT,
  quick_facts TEXT[],
  tags TEXT[],
  category TEXT,
  location TEXT,
  
  -- Publicacao
  image_url TEXT,
  image_caption TEXT,
  highlight_type TEXT DEFAULT 'normal',
  seo_slug TEXT,
  seo_title TEXT,
  
  -- Estado
  status article_status DEFAULT 'captured',
  confidence_score DECIMAL(3,2),
  is_duplicate BOOLEAN DEFAULT FALSE,
  duplicate_of UUID REFERENCES public.articles(id) ON DELETE SET NULL,
  
  -- Meta
  reading_time INTEGER,
  author TEXT,
  editor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela user_roles (roles da equipa)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Tabela agent_logs (logs do agente)
CREATE TABLE public.agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.sources(id) ON DELETE SET NULL,
  action TEXT,
  status TEXT,
  articles_found INTEGER DEFAULT 0,
  articles_saved INTEGER DEFAULT 0,
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela sponsored_campaigns (campanhas publicitarias)
CREATE TABLE public.sponsored_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  advertiser TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela sponsored_ads (anuncios)
CREATE TABLE public.sponsored_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.sponsored_campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link TEXT,
  placement TEXT DEFAULT 'feed',
  frequency INTEGER DEFAULT 8,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Funcao has_role para verificar roles (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Funcao para verificar se tem qualquer role editorial
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- Funcao para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para articles.updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS em todas as tabelas
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsored_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsored_ads ENABLE ROW LEVEL SECURITY;

-- RLS Policies para sources
CREATE POLICY "sources_select_any_role" ON public.sources
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid()));

CREATE POLICY "sources_insert_admin_editor_chefe" ON public.sources
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor_chefe')
  );

CREATE POLICY "sources_update_admin_editor_chefe" ON public.sources
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor_chefe')
  );

CREATE POLICY "sources_delete_admin" ON public.sources
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para articles
CREATE POLICY "articles_select_any_role" ON public.articles
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid()));

CREATE POLICY "articles_insert_any_role" ON public.articles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid()));

CREATE POLICY "articles_update_editor_plus" ON public.articles
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor_chefe') OR
    public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "articles_delete_admin" ON public.articles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para user_roles (apenas admin)
CREATE POLICY "user_roles_select_own_or_admin" ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "user_roles_insert_admin" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles_update_admin" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles_delete_admin" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para agent_logs
CREATE POLICY "agent_logs_select_admin_editor_chefe" ON public.agent_logs
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor_chefe')
  );

CREATE POLICY "agent_logs_insert_any_role" ON public.agent_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid()));

-- RLS Policies para sponsored_campaigns (apenas admin)
CREATE POLICY "sponsored_campaigns_select_admin" ON public.sponsored_campaigns
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "sponsored_campaigns_insert_admin" ON public.sponsored_campaigns
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "sponsored_campaigns_update_admin" ON public.sponsored_campaigns
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "sponsored_campaigns_delete_admin" ON public.sponsored_campaigns
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para sponsored_ads (apenas admin)
CREATE POLICY "sponsored_ads_select_admin" ON public.sponsored_ads
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "sponsored_ads_insert_admin" ON public.sponsored_ads
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "sponsored_ads_update_admin" ON public.sponsored_ads
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "sponsored_ads_delete_admin" ON public.sponsored_ads
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Artigos publicados sao publicos (para o frontend)
CREATE POLICY "articles_public_published" ON public.articles
  FOR SELECT TO anon
  USING (status = 'published');

-- Storage bucket para imagens de artigos
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true);

-- Storage policies
CREATE POLICY "article_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'article-images');

CREATE POLICY "article_images_upload_editor_plus" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'article-images' AND (
      public.has_role(auth.uid(), 'admin') OR 
      public.has_role(auth.uid(), 'editor_chefe') OR
      public.has_role(auth.uid(), 'editor')
    )
  );

CREATE POLICY "article_images_update_editor_plus" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'article-images' AND (
      public.has_role(auth.uid(), 'admin') OR 
      public.has_role(auth.uid(), 'editor_chefe') OR
      public.has_role(auth.uid(), 'editor')
    )
  );

CREATE POLICY "article_images_delete_admin" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'article-images' AND 
    public.has_role(auth.uid(), 'admin')
  );