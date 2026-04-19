-- 1. Enum de tipos de evento
CREATE TYPE public.event_type_enum AS ENUM (
  'impression',
  'view',
  'read_complete',
  'like',
  'save',
  'share',
  'ai_action'
);

-- 2. Tabela user_events
CREATE TABLE public.user_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id text NOT NULL,
  user_id uuid NULL,
  session_id text NULL,
  event_type public.event_type_enum NOT NULL,
  article_id uuid NULL,
  category text NULL,
  metadata jsonb NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Índices
CREATE INDEX idx_user_events_aid_created ON public.user_events (anonymous_id, created_at DESC);
CREATE INDEX idx_user_events_article ON public.user_events (article_id);
CREATE INDEX idx_user_events_category ON public.user_events (category);
CREATE INDEX idx_user_events_type_created ON public.user_events (event_type, created_at DESC);

-- 4. RLS
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

-- INSERT: qualquer visitante (anon ou autenticado) pode registar eventos
CREATE POLICY "user_events_insert_public"
  ON public.user_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- SELECT: apenas admin / editor_chefe (analytics interna)
CREATE POLICY "user_events_select_admin_ec"
  ON public.user_events
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'editor_chefe'::public.app_role)
  );

-- 5. Função de ranking de categorias por utilizador anónimo
CREATE OR REPLACE FUNCTION public.get_user_top_categories(
  _anonymous_id text,
  _limit int DEFAULT 5
)
RETURNS TABLE (category text, score numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    e.category,
    SUM(
      CASE e.event_type
        WHEN 'view' THEN 1
        WHEN 'read_complete' THEN 3
        WHEN 'like' THEN 4
        WHEN 'save' THEN 5
        WHEN 'share' THEN 4
        WHEN 'ai_action' THEN 3
        ELSE 0
      END
    )::numeric AS score
  FROM public.user_events e
  WHERE e.anonymous_id = _anonymous_id
    AND e.category IS NOT NULL
    AND e.created_at >= now() - interval '30 days'
    AND e.event_type <> 'impression'
  GROUP BY e.category
  HAVING SUM(
    CASE e.event_type
      WHEN 'view' THEN 1
      WHEN 'read_complete' THEN 3
      WHEN 'like' THEN 4
      WHEN 'save' THEN 5
      WHEN 'share' THEN 4
      WHEN 'ai_action' THEN 3
      ELSE 0
    END
  ) > 0
  ORDER BY score DESC
  LIMIT _limit;
$$;

-- Permitir execução pública (anon + authenticated) para suportar utilizadores anónimos
GRANT EXECUTE ON FUNCTION public.get_user_top_categories(text, int) TO anon, authenticated;