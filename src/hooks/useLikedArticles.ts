import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const STORAGE_KEY = 'bnews_liked_articles';

export function useLikedArticles() {
  const [likedIds, setLikedIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setLikedIds(JSON.parse(stored));
      } catch {
        setLikedIds([]);
      }
    }
  }, []);

  const likeArticle = useCallback((id: string) => {
    setLikedIds(prev => {
      const newIds = [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
      return newIds;
    });
    toast.success('Adicionado a Amei', { duration: 1500 });
  }, []);

  const unlikeArticle = useCallback((id: string) => {
    setLikedIds(prev => {
      const newIds = prev.filter(likedId => likedId !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
      return newIds;
    });
    toast('Removido de Amei', { duration: 1500 });
  }, []);

  const toggleLike = useCallback((id: string) => {
    if (likedIds.includes(id)) {
      unlikeArticle(id);
    } else {
      likeArticle(id);
    }
  }, [likedIds, likeArticle, unlikeArticle]);

  const isLiked = useCallback((id: string) => likedIds.includes(id), [likedIds]);

  return { likedIds, likeArticle, unlikeArticle, toggleLike, isLiked };
}
