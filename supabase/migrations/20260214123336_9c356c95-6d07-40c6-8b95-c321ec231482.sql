
-- Fix permissive INSERT policy on pipeline_logs
DROP POLICY IF EXISTS "pipeline_logs_insert_any_role" ON public.pipeline_logs;

CREATE POLICY "pipeline_logs_insert_any_role"
  ON public.pipeline_logs FOR INSERT
  WITH CHECK (has_any_role(auth.uid()));
