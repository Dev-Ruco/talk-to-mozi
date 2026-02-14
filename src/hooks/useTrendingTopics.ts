/**
 * Hook to provide trending topics — currently returns static fallback.
 * Will be reconnected when Edge Functions are deployed on the external backend.
 */
export function useTrendingTopics() {
  return {
    data: {
      topics: [],
      categories: [],
      generatedAt: new Date().toISOString(),
    },
    isLoading: false,
    error: null,
  };
}

/**
 * Generate search phrase suggestions based on trending topics
 */
export function useTrendingSuggestions() {
  return {
    suggestions: [
      'Mostra-me tudo sobre economia esta semana',
      'Qual foi a última decisão do governo?',
      'O que está a acontecer com o dólar?',
      'Notícias sobre saúde em Moçambique',
    ],
    topics: [],
    categories: [],
    isLoading: false,
    error: null,
  };
}
