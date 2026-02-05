-- Create rewrite_queue table for tracking AI processing
CREATE TABLE public.rewrite_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0,
  queued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rewrite_queue ENABLE ROW LEVEL SECURITY;

-- Policies for rewrite_queue
CREATE POLICY "rewrite_queue_select_any_role" 
ON public.rewrite_queue 
FOR SELECT 
USING (has_any_role(auth.uid()));

CREATE POLICY "rewrite_queue_insert_any_role" 
ON public.rewrite_queue 
FOR INSERT 
WITH CHECK (has_any_role(auth.uid()));

CREATE POLICY "rewrite_queue_update_any_role" 
ON public.rewrite_queue 
FOR UPDATE 
USING (has_any_role(auth.uid()));

CREATE POLICY "rewrite_queue_delete_admin" 
ON public.rewrite_queue 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_rewrite_queue_status ON public.rewrite_queue(status);
CREATE INDEX idx_rewrite_queue_article_id ON public.rewrite_queue(article_id);

-- Enable realtime for rewrite_queue
ALTER PUBLICATION supabase_realtime ADD TABLE public.rewrite_queue;