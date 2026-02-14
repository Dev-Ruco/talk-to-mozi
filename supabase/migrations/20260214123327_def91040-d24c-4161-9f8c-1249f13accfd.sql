
-- 1) ALTER sources: add new columns for RSS agent
ALTER TABLE public.sources
  ADD COLUMN IF NOT EXISTS feed_url text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'pt',
  ADD COLUMN IF NOT EXISTS include_keywords text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS exclude_keywords text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Trigger for updated_at on sources
CREATE TRIGGER update_sources_updated_at
  BEFORE UPDATE ON public.sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2) ALTER articles: add source_name column
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS source_name text;

-- Unique partial index on source_url to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_source_url_unique
  ON public.articles (source_url)
  WHERE source_url IS NOT NULL;

-- 3) CREATE pipeline_logs table
CREATE TABLE IF NOT EXISTS public.pipeline_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node text NOT NULL,
  level text DEFAULT 'INFO',
  message text,
  meta jsonb,
  source_id uuid REFERENCES public.sources(id),
  article_id uuid REFERENCES public.articles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.pipeline_logs ENABLE ROW LEVEL SECURITY;

-- RLS: admin/editor_chefe can read logs
CREATE POLICY "pipeline_logs_select_admin_ec"
  ON public.pipeline_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor_chefe'::app_role));

-- RLS: any role can insert (for edge function via service_role this is bypassed anyway)
CREATE POLICY "pipeline_logs_insert_any_role"
  ON public.pipeline_logs FOR INSERT
  WITH CHECK (true);
