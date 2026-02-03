import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'bnews_saved_articles';

export function useSavedArticles() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedIds(JSON.parse(stored));
      } catch {
        setSavedIds([]);
      }
    }
  }, []);

  const saveArticle = useCallback((id: string) => {
    setSavedIds(prev => {
      const newIds = [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
      return newIds;
    });
  }, []);

  const unsaveArticle = useCallback((id: string) => {
    setSavedIds(prev => {
      const newIds = prev.filter(savedId => savedId !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
      return newIds;
    });
  }, []);

  const toggleSave = useCallback((id: string) => {
    if (savedIds.includes(id)) {
      unsaveArticle(id);
    } else {
      saveArticle(id);
    }
  }, [savedIds, saveArticle, unsaveArticle]);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  return { savedIds, saveArticle, unsaveArticle, toggleSave, isSaved };
}
