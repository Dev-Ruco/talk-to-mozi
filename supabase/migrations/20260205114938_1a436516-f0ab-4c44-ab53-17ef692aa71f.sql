-- Habilitar realtime na tabela articles para sincronização instantânea
ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;