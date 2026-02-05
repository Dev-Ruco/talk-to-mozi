import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MediaItem {
  id: string;
  file_name: string;
  file_path: string;
  url: string;
  title: string | null;
  description: string | null;
  alt_text: string | null;
  tags: string[];
  file_size: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

interface UseMediaOptions {
  search?: string;
  limit?: number;
}

/**
 * Hook to fetch media items from the library
 */
export function useMedia(options: UseMediaOptions = {}) {
  const { search, limit = 50 } = options;

  return useQuery({
    queryKey: ['media', search, limit],
    queryFn: async () => {
      let query = supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,file_name.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching media:', error);
        throw error;
      }

      return (data || []) as MediaItem[];
    },
  });
}

/**
 * Hook to upload a new media item
 */
export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      file, 
      title, 
      description, 
      tags = [] 
    }: { 
      file: File; 
      title?: string; 
      description?: string; 
      tags?: string[];
    }) => {
      // Generate unique filename
      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `library/${timestamp}-${cleanFileName}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('article-images')
        .getPublicUrl(uploadData.path);

      // Get image dimensions
      let width: number | undefined;
      let height: number | undefined;
      
      if (file.type.startsWith('image/')) {
        const dimensions = await getImageDimensions(file);
        width = dimensions.width;
        height = dimensions.height;
      }

      // Insert into media table
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .insert({
          file_name: file.name,
          file_path: uploadData.path,
          url: urlData.publicUrl,
          title: title || file.name.replace(/\.[^/.]+$/, ''),
          description,
          tags,
          file_size: file.size,
          mime_type: file.type,
          width,
          height,
        })
        .select()
        .single();

      if (mediaError) {
        console.error('Media insert error:', mediaError);
        throw mediaError;
      }

      return mediaData as MediaItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
}

/**
 * Hook to update a media item
 */
export function useUpdateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Pick<MediaItem, 'title' | 'description' | 'alt_text' | 'tags'>>;
    }) => {
      const { data, error } = await supabase
        .from('media')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      return data as MediaItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
}

/**
 * Hook to delete a media item
 */
export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First get the media item to find the file path
      const { data: media, error: fetchError } = await supabase
        .from('media')
        .select('file_path')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      if (media?.file_path) {
        await supabase.storage
          .from('article-images')
          .remove([media.file_path]);
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('media')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
}

/**
 * Helper to get image dimensions
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = URL.createObjectURL(file);
  });
}
