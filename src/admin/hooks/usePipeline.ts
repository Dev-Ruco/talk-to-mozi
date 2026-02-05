import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type ArticleStatus = Tables<'articles'>['status'];
export type RewriteQueueItem = {
  id: string;
  article_id: string;
  priority: number;
  queued_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  article?: Tables<'articles'>;
};

export interface PipelineArticle extends Tables<'articles'> {
  source?: Tables<'sources'> | null;
  queueItem?: RewriteQueueItem;
}

export function usePipeline() {
  const queryClient = useQueryClient();
  const [processingArticleId, setProcessingArticleId] = useState<string | null>(null);

  // Fetch all articles for the pipeline
  const { data: articles = [], isLoading: isLoadingArticles, refetch: refetchArticles } = useQuery({
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
    staleTime: 10000,
  });

  // Fetch rewrite queue
  const { data: queue = [], isLoading: isLoadingQueue, refetch: refetchQueue } = useQuery({
    queryKey: ['rewrite-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewrite_queue')
        .select('*')
        .in('status', ['queued', 'processing'])
        .order('priority', { ascending: false })
        .order('queued_at', { ascending: true });
      
      if (error) throw error;
      return data as RewriteQueueItem[];
    },
    staleTime: 5000,
  });

  // Set up realtime subscriptions
  useEffect(() => {
    const articlesChannel = supabase
      .channel('pipeline_articles_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'articles' },
        () => {
          refetchArticles();
        }
      )
      .subscribe();

    const queueChannel = supabase
      .channel('rewrite_queue_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'rewrite_queue' },
        (payload) => {
          refetchQueue();
          if (payload.eventType === 'UPDATE') {
            const record = payload.new as RewriteQueueItem;
            if (record.status === 'processing') {
              setProcessingArticleId(record.article_id);
            } else if (record.status === 'completed' || record.status === 'failed') {
              setProcessingArticleId(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(articlesChannel);
      supabase.removeChannel(queueChannel);
    };
  }, [refetchArticles, refetchQueue]);

  // Add to rewrite queue and trigger processing
  const addToQueue = useMutation({
    mutationFn: async ({ articleId, priority = 0 }: { articleId: string; priority?: number }) => {
      // Check if already in queue
      const { data: existing } = await supabase
        .from('rewrite_queue')
        .select('id')
        .eq('article_id', articleId)
        .in('status', ['queued', 'processing'])
        .single();

      if (existing) {
        throw new Error('Artigo já está na fila de reformulação');
      }

      const { error } = await supabase
        .from('rewrite_queue')
        .insert({ article_id: articleId, priority });

      if (error) throw error;

      // Trigger queue processing
      try {
        await supabase.functions.invoke('process-queue');
      } catch (e) {
        console.log('Queue processing will be handled by next trigger');
      }
    },
    onSuccess: () => {
      toast.success('Artigo adicionado à fila de reformulação');
      refetchQueue();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Skip queue (set high priority)
  const skipQueue = useMutation({
    mutationFn: async (articleId: string) => {
      // Get current max priority
      const { data: maxPriorityItem } = await supabase
        .from('rewrite_queue')
        .select('priority')
        .order('priority', { ascending: false })
        .limit(1)
        .single();

      const newPriority = (maxPriorityItem?.priority || 0) + 10;

      // Check if already in queue
      const { data: existing } = await supabase
        .from('rewrite_queue')
        .select('id')
        .eq('article_id', articleId)
        .in('status', ['queued', 'processing'])
        .single();

      if (existing) {
        // Update priority
        const { error } = await supabase
          .from('rewrite_queue')
          .update({ priority: newPriority })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // Insert with high priority
        const { error } = await supabase
          .from('rewrite_queue')
          .insert({ article_id: articleId, priority: newPriority });
        if (error) throw error;
      }

      // Trigger queue processing with skip flag
      try {
        await supabase.functions.invoke('process-queue', {
          body: { article_id: articleId, skip_queue: true }
        });
      } catch (e) {
        console.log('Queue processing will be handled by next trigger');
      }
    },
    onSuccess: () => {
      toast.success('Artigo movido para o topo da fila');
      refetchQueue();
    },
    onError: () => {
      toast.error('Erro ao furar a fila');
    },
  });

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

  // Organize articles by column
  const inboxArticles = articles.filter(a => a.status === 'captured');
  const pendingArticles = articles.filter(a => 
    a.status === 'rewritten' || a.status === 'pending' || a.status === 'approved' || a.status === 'needs_image'
  );
  const publishedArticles = articles.filter(a => a.status === 'published');
  const scheduledArticles = articles.filter(a => a.status === 'scheduled');

  // Get articles in queue
  const queuedArticles = queue
    .filter(q => q.status === 'queued')
    .map(q => {
      const article = articles.find(a => a.id === q.article_id);
      return { ...q, article };
    });

  const processingItem = queue.find(q => q.status === 'processing');
  const processingArticle = processingItem 
    ? articles.find(a => a.id === processingItem.article_id)
    : null;

  return {
    // Data
    articles,
    inboxArticles,
    pendingArticles,
    publishedArticles,
    scheduledArticles,
    queuedArticles,
    processingArticle,
    processingItem,
    
    // Loading states
    isLoading: isLoadingArticles || isLoadingQueue,
    
    // Actions
    addToQueue: addToQueue.mutate,
    skipQueue: skipQueue.mutate,
    deleteArticles: deleteArticles.mutate,
    publishArticle: publishArticle.mutate,
    unpublishArticle: unpublishArticle.mutate,
    
    // Pending states
    isAddingToQueue: addToQueue.isPending,
    isDeleting: deleteArticles.isPending,
    isPublishing: publishArticle.isPending,
    
    // Refetch
    refetch: () => {
      refetchArticles();
      refetchQueue();
    },
  };
}
