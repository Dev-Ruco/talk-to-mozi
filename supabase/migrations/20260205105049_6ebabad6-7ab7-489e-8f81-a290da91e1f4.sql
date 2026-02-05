-- Create media library table for storing reusable images
CREATE TABLE public.media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  alt_text TEXT,
  tags TEXT[] DEFAULT '{}',
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view media (public gallery)
CREATE POLICY "Media is viewable by authenticated users"
  ON public.media FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Editors can insert media
CREATE POLICY "Editors can upload media"
  ON public.media FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid()));

-- Policy: Editors can update their own media or admins can update any
CREATE POLICY "Editors can update media"
  ON public.media FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid()));

-- Policy: Admins can delete media
CREATE POLICY "Admins can delete media"
  ON public.media FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor_chefe'));

-- Create trigger for updated_at
CREATE TRIGGER update_media_updated_at
  BEFORE UPDATE ON public.media
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for search
CREATE INDEX idx_media_tags ON public.media USING GIN(tags);
CREATE INDEX idx_media_created_at ON public.media(created_at DESC);
CREATE INDEX idx_media_title ON public.media(title);