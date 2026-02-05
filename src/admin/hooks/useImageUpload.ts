import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseImageUploadOptions {
  bucket?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

// Helper function to get image dimensions
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = URL.createObjectURL(file);
  });
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const { 
    bucket = 'article-images', 
    onSuccess, 
    onError 
  } = options;
  
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file: File, articleId: string): Promise<string | null> => {
    if (!file) return null;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const error = new Error('Apenas ficheiros de imagem são permitidos');
      onError?.(error);
      toast.error(error.message);
      return null;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const error = new Error('A imagem deve ter menos de 5MB');
      onError?.(error);
      toast.error(error.message);
      return null;
    }

    setIsUploading(true);
    setProgress(10);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${articleId}/${Date.now()}.${fileExt}`;

      setProgress(30);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        throw error;
      }

      setProgress(60);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      const publicUrl = urlData.publicUrl;

      setProgress(80);
      
      // Auto-save to media library
      if (publicUrl) {
        try {
          const dimensions = await getImageDimensions(file);
          
          const { error: mediaError } = await supabase
            .from('media')
            .insert({
              file_name: file.name,
              file_path: data.path,
              url: publicUrl,
              title: `Imagem - ${articleId}`,
              file_size: file.size,
              mime_type: file.type,
              width: dimensions.width || null,
              height: dimensions.height || null,
              tags: ['artigo', 'upload'],
            });
          
          if (mediaError) {
            console.warn('Failed to add to media library:', mediaError);
            // Don't block - image was uploaded successfully
          } else {
            console.log('Image added to media library');
          }
        } catch (mediaErr) {
          console.warn('Error adding to media library:', mediaErr);
          // Don't block - image was uploaded successfully
        }
      }

      setProgress(100);
      
      onSuccess?.(publicUrl);
      toast.success('Imagem carregada com sucesso');
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      const err = error instanceof Error ? error : new Error('Erro ao carregar imagem');
      onError?.(err);
      toast.error(err.message);
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const deleteImage = async (imagePath: string): Promise<boolean> => {
    try {
      // Extract path from full URL if needed
      const path = imagePath.includes(bucket) 
        ? imagePath.split(`${bucket}/`)[1] 
        : imagePath;

      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading,
    progress,
  };
}
