import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type ArticleStatus = Tables<'articles'>['status'];

export interface PipelineArticle extends Tables<'articles'> {
  source?: Tables<'sources'> | null;
}

export function usePipeline() {
  const queryClient = useQueryClient();

  // Fetch all articles for the pipeline
  const { data: articles = [], isLoading, refetch: refetchArticles } = useQuery({
    queryKey: ['pipeline-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*, source:sources(*)')
        .in('status', ['captured', 'rewritten', 'pending', 'approved', 'needs_image', 'scheduled', 'published'])
        .order('captured_at', { ascending: false });
      
      if (error) throw error;
      return data as PipelineArticle[];
    },
    staleTime: 60000,
  });

  // Stable refetch callback
  const refetchRef = useRef(refetchArticles);
  useEffect(() => {
    refetchRef.current = refetchArticles;
  }, [refetchArticles]);

  // Realtime subscription for articles only
  useEffect(() => {
    const channel = supabase
      .channel('pipeline_articles_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'articles' },
        () => { refetchRef.current(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Delete articles
  const deleteArticles = useMutation({
    mutationFn: async (articleIds: string[]) => {
      const { error } = await supabase
        .from('articles')
        .delete()
        .in('id', articleIds);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Artigos eliminados');
      refetchArticles();
    },
    onError: () => {
      toast.error('Erro ao eliminar artigos');
    },
  });

  // Publish article
  const publishArticle = useMutation({
    mutationFn: async (articleId: string) => {
      const { error } = await supabase
        .from('articles')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', articleId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Artigo publicado');
      refetchArticles();
    },
    onError: () => {
      toast.error('Erro ao publicar artigo');
    },
  });

  // Unpublish article
  const unpublishArticle = useMutation({
    mutationFn: async (articleId: string) => {
      const { error } = await supabase
        .from('articles')
        .update({ status: 'pending', published_at: null })
        .eq('id', articleId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Artigo despublicado');
      refetchArticles();
    },
    onError: () => {
      toast.error('Erro ao despublicar artigo');
    },
  });

  // Reset pipeline
  const resetPipeline = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('articles')
        .delete()
        .in('status', ['captured', 'rewritten', 'pending', 'approved', 'needs_image', 'scheduled']);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Pipeline reiniciado');
      refetchArticles();
    },
    onError: () => {
      toast.error('Erro ao reiniciar pipeline');
    },
  });

  // Organize articles by column
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
  const inboxArticles = articles.filter(a => a.status === 'captured' && (a.captured_at ?? '') > twelveHoursAgo);
  const pendingArticles = articles.filter(a => 
    (a.status === 'rewritten' || a.status === 'pending' || a.status === 'approved' || a.status === 'needs_image')
    && (a.captured_at ?? '') > twelveHoursAgo
  );
  const publishedArticles = articles
    .filter(a => a.status === 'published')
    .slice(0, 6);
  const scheduledArticles = articles.filter(a => a.status === 'scheduled');

  return {
    articles,
    inboxArticles,
    pendingArticles,
    publishedArticles,
    scheduledArticles,
    isLoading,
    deleteArticles: deleteArticles.mutate,
    publishArticle: publishArticle.mutate,
    unpublishArticle: unpublishArticle.mutate,
    isDeleting: deleteArticles.isPending,
    isPublishing: publishArticle.isPending,
    resetPipeline: resetPipeline.mutate,
    isResetting: resetPipeline.isPending,
    refetch: refetchArticles,
  };
}
