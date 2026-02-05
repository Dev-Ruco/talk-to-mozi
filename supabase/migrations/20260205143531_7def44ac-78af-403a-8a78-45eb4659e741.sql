-- Create agent_settings table for persistent configuration
CREATE TABLE IF NOT EXISTS public.agent_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.agent_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_settings
CREATE POLICY "agent_settings_select_admins" ON public.agent_settings
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor_chefe'::app_role));

CREATE POLICY "agent_settings_update_admin" ON public.agent_settings
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "agent_settings_insert_admin" ON public.agent_settings
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.agent_settings (key, value, description) VALUES
  ('capture_interval_minutes', '5', 'Intervalo entre capturas de novas notícias (minutos)'),
  ('rewrite_interval_minutes', '2', 'Intervalo entre reformulações de artigos (minutos)'),
  ('max_rewrites_per_run', '3', 'Máximo de artigos reformulados por execução'),
  ('agent_enabled', 'true', 'Agente de captura activo'),
  ('auto_rewrite_enabled', 'true', 'Reformulação automática activa'),
  ('duplicate_threshold', '0.85', 'Limiar de similaridade para duplicados');

-- Create trigger for updated_at
CREATE TRIGGER update_agent_settings_updated_at
  BEFORE UPDATE ON public.agent_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();