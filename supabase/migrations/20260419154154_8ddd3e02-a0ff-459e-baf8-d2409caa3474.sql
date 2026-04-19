
-- 1) Novos estados editoriais
ALTER TYPE public.article_status ADD VALUE IF NOT EXISTS 'filtered';
ALTER TYPE public.article_status ADD VALUE IF NOT EXISTS 'reviewed';
ALTER TYPE public.article_status ADD VALUE IF NOT EXISTS 'queued';
ALTER TYPE public.article_status ADD VALUE IF NOT EXISTS 'discarded';

-- 2) Novas colunas em articles
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS source_type text,
  ADD COLUMN IF NOT EXISTS ingestion_method text DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS normalized_title text,
  ADD COLUMN IF NOT EXISTS similarity_hash text,
  ADD COLUMN IF NOT EXISTS queued_by uuid,
  ADD COLUMN IF NOT EXISTS curation_score integer;

-- 3) Novas colunas em sources (controlo de auto-captura)
ALTER TABLE public.sources
  ADD COLUMN IF NOT EXISTS allow_auto_capture boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_manual boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS blocked boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS max_items_per_run integer DEFAULT 20,
  ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0;

-- 4) Novas colunas em rewrite_queue
ALTER TABLE public.rewrite_queue
  ADD COLUMN IF NOT EXISTS attempts integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS queued_by uuid;

-- 5) Tabela de contador diário de capturas
CREATE TABLE IF NOT EXISTS public.daily_capture_counter (
  day date PRIMARY KEY,
  captured_count integer NOT NULL DEFAULT 0,
  blocked_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_capture_counter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_capture_select_admin_ec"
  ON public.daily_capture_counter
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor_chefe'));

-- 6) Settings do agente (defaults)
INSERT INTO public.agent_settings (key, value, description)
VALUES
  ('max_capture_per_day', '150', 'Limite global diário de capturas automáticas'),
  ('max_rewrites_per_hour', '15', 'Limite de reescritas IA processadas por hora'),
  ('similarity_threshold', '0.85', 'Limiar de similaridade para detectar duplicados (0-1)'),
  ('auto_rewrite_on_capture', 'false', 'Se true, reescreve automaticamente após capturar (DESACONSELHADO)'),
  ('freshness_window_hours', '48', 'Só captar artigos com data de publicação dentro desta janela')
ON CONFLICT (key) DO NOTHING;

-- 7) Função utilitária: normalizar título
CREATE OR REPLACE FUNCTION public.normalize_title(_title text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(regexp_replace(
    regexp_replace(
      lower(coalesce(_title, '')),
      '[[:punct:]]+', ' ', 'g'
    ),
    '\s+', ' ', 'g'
  ));
$$;

-- 8) Função: backfill normalized_title em existentes
UPDATE public.articles
SET normalized_title = public.normalize_title(coalesce(title, original_title))
WHERE normalized_title IS NULL;

-- 9) Índices para dedupe e queries
CREATE INDEX IF NOT EXISTS idx_articles_normalized_title ON public.articles (normalized_title);
CREATE INDEX IF NOT EXISTS idx_articles_status_captured ON public.articles (status, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_source_url_lower ON public.articles (lower(source_url));
CREATE INDEX IF NOT EXISTS idx_rewrite_queue_status_priority ON public.rewrite_queue (status, priority DESC, queued_at ASC);

-- 10) Trigger: manter normalized_title actualizado
CREATE OR REPLACE FUNCTION public.set_normalized_title()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.normalized_title := public.normalize_title(coalesce(NEW.title, NEW.original_title));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_normalized_title ON public.articles;
CREATE TRIGGER trg_set_normalized_title
  BEFORE INSERT OR UPDATE OF title, original_title ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_normalized_title();

-- 11) Função para verificar duplicação (usada pelas edge functions)
CREATE OR REPLACE FUNCTION public.is_duplicate_article(_url text, _title text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.articles
    WHERE (
      (_url IS NOT NULL AND lower(source_url) = lower(_url))
      OR (
        _title IS NOT NULL
        AND normalized_title IS NOT NULL
        AND normalized_title = public.normalize_title(_title)
      )
    )
  );
$$;

-- 12) Função para incrementar contador diário (atómica)
CREATE OR REPLACE FUNCTION public.increment_daily_capture(_count integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_total integer;
BEGIN
  INSERT INTO public.daily_capture_counter (day, captured_count)
  VALUES (current_date, _count)
  ON CONFLICT (day) DO UPDATE
    SET captured_count = daily_capture_counter.captured_count + _count,
        updated_at = now()
  RETURNING captured_count INTO _new_total;
  RETURN _new_total;
END;
$$;
