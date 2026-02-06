
ALTER TABLE public.articles
  ADD COLUMN content_type text NOT NULL DEFAULT 'article',
  ADD COLUMN visual_format text,
  ADD COLUMN gallery_urls text[];
