import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrendingResponse {
  topics: string[];
  categories: string[];
  generated_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[trending-topics] Fetching articles from last 24 hours...');

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Fetch published articles from the last 24 hours
    const { data: articles, error } = await supabase
      .from('articles')
      .select('title, category, tags')
      .eq('status', 'published')
      .gte('published_at', twentyFourHoursAgo.toISOString())
      .order('published_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[trending-topics] Database error:', error);
      throw error;
    }

    console.log(`[trending-topics] Found ${articles?.length || 0} articles from last 24h`);

    // If no recent articles, fetch the latest ones regardless of time
    let articleData = articles || [];
    if (articleData.length === 0) {
      console.log('[trending-topics] No recent articles, fetching latest...');
      const { data: latestArticles } = await supabase
        .from('articles')
        .select('title, category, tags')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(20);
      
      articleData = latestArticles || [];
    }

    // Extract and count tags
    const tagCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    for (const article of articleData) {
      // Count categories
      if (article.category) {
        categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
      }

      // Count tags
      if (article.tags && Array.isArray(article.tags)) {
        for (const tag of article.tags) {
          if (tag && typeof tag === 'string') {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        }
      }

      // Extract keywords from titles (simple word extraction)
      if (article.title) {
        const words = article.title
          .toLowerCase()
          .replace(/[^\w\sáàâãéèêíìîóòôõúùûç]/gi, '')
          .split(/\s+/)
          .filter((word: string) => word.length > 4); // Only words longer than 4 chars

        // Filter out common words
        const stopWords = ['sobre', 'como', 'para', 'mais', 'este', 'esta', 'isso', 'aqui', 'ainda', 'sendo', 'foram', 'seria', 'depois', 'antes', 'quando', 'onde', 'porque', 'entre', 'muito', 'maior', 'menor', 'mesmo', 'outros'];
        
        for (const word of words) {
          if (!stopWords.includes(word)) {
            tagCounts[word] = (tagCounts[word] || 0) + 0.5; // Lower weight for title words
          }
        }
      }
    }

    // Sort tags by frequency and get top 7
    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([tag]) => tag);

    // Sort categories by frequency
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category);

    // If we don't have enough tags, add fallback topics
    const fallbackTopics = ['economia', 'política', 'sociedade', 'desporto', 'internacional'];
    while (sortedTags.length < 5) {
      const fallback = fallbackTopics.shift();
      if (fallback && !sortedTags.includes(fallback)) {
        sortedTags.push(fallback);
      }
    }

    const response: TrendingResponse = {
      topics: sortedTags,
      categories: sortedCategories,
      generated_at: new Date().toISOString(),
    };

    console.log('[trending-topics] Returning topics:', response.topics);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[trending-topics] Error:', error);
    
    // Return fallback topics on error
    const fallbackResponse: TrendingResponse = {
      topics: ['economia', 'política', 'sociedade', 'saúde', 'educação'],
      categories: ['economia', 'politica', 'sociedade'],
      generated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(fallbackResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
