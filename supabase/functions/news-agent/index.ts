import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface RssItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  content?: string;
  creator?: string;
}

interface Source {
  id: string;
  name: string;
  url: string;
  type: string;
  categories: string[] | null;
  is_active: boolean;
  articles_captured: number;
}

type LogAction = 
  | 'agent_start'
  | 'fetch_start'
  | 'fetch_complete'
  | 'parse_rss'
  | 'duplicate_check'
  | 'article_save'
  | 'source_complete'
  | 'agent_complete';

// Helper function to log each step in realtime
async function logStep(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  action: LogAction,
  status: 'success' | 'error' | 'info',
  details: Record<string, unknown>,
  sourceId?: string,
  articlesFound = 0,
  articlesSaved = 0,
  errorMessage?: string
) {
  try {
    await supabase.from('agent_logs').insert({
      source_id: sourceId || null,
      action,
      status,
      articles_found: articlesFound,
      articles_saved: articlesSaved,
      error_message: errorMessage || null,
      details,
      executed_at: new Date().toISOString(),
    });
    console.log(`[${action}] ${status}: ${JSON.stringify(details)}`);
  } catch (e) {
    console.error('Failed to log step:', e);
  }
}

// Simple RSS parser
function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1];
    
    const getTagContent = (tag: string): string | undefined => {
      const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const tagMatch = regex.exec(itemContent);
      return tagMatch ? (tagMatch[1] || tagMatch[2])?.trim() : undefined;
    };

    const title = getTagContent('title');
    const link = getTagContent('link');
    
    if (title && link) {
      items.push({
        title,
        link,
        description: getTagContent('description'),
        pubDate: getTagContent('pubDate'),
        content: getTagContent('content:encoded') || getTagContent('content'),
        creator: getTagContent('dc:creator') || getTagContent('author'),
      });
    }
  }

  return items;
}

// Simple text similarity (Jaccard similarity)
function calculateSimilarity(text1: string, text2: string): number {
  const normalize = (text: string) => 
    text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  
  const words1 = new Set(normalize(text1));
  const words2 = new Set(normalize(text2));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body for optional source filter
    let sourceId: string | null = null;
    try {
      const body = await req.json();
      sourceId = body?.source_id || null;
    } catch {
      // No body or invalid JSON, process all sources
    }

    // Log agent start
    await logStep(supabase, 'agent_start', 'info', {
      message: 'Agente iniciado',
      source_filter: sourceId || 'todas as fontes',
      timestamp: new Date().toISOString(),
    });

    // Fetch active sources
    let sourcesQuery = supabase
      .from('sources')
      .select('*')
      .eq('is_active', true);
    
    if (sourceId) {
      sourcesQuery = sourcesQuery.eq('id', sourceId);
    }

    const { data: sources, error: sourcesError } = await sourcesQuery;

    if (sourcesError) {
      await logStep(supabase, 'agent_start', 'error', {
        error: sourcesError.message,
      }, undefined, 0, 0, sourcesError.message);
      throw new Error(`Failed to fetch sources: ${sourcesError.message}`);
    }

    if (!sources || sources.length === 0) {
      await logStep(supabase, 'agent_complete', 'info', {
        message: 'Nenhuma fonte activa encontrada',
        duration_ms: Date.now() - startTime,
      });
      return new Response(
        JSON.stringify({ message: 'No active sources found', articles_found: 0, articles_saved: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${sources.length} sources...`);

    let totalFound = 0;
    let totalSaved = 0;
    let totalDuplicates = 0;
    const errors: string[] = [];

    // Get recent articles for duplicate detection
    await logStep(supabase, 'duplicate_check', 'info', {
      message: 'A carregar artigos recentes para detecção de duplicados',
    });

    const { data: recentArticles } = await supabase
      .from('articles')
      .select('id, title, original_title, source_url')
      .gte('captured_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('captured_at', { ascending: false })
      .limit(500);

    const existingUrls = new Set(recentArticles?.map(a => a.source_url).filter(Boolean) || []);
    const existingTitles = recentArticles?.map(a => a.title || a.original_title).filter(Boolean) || [];

    await logStep(supabase, 'duplicate_check', 'success', {
      message: 'Cache de duplicados carregado',
      existing_urls: existingUrls.size,
      existing_titles: existingTitles.length,
    });

    for (const source of sources as Source[]) {
      const sourceStartTime = Date.now();
      
      try {
        // Log fetch start
        await logStep(supabase, 'fetch_start', 'info', {
          source_name: source.name,
          source_url: source.url,
          source_type: source.type,
        }, source.id);
        
        // Fetch RSS feed
        const response = await fetch(source.url, {
          headers: { 'User-Agent': 'B NEWS Agent/1.0' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const xml = await response.text();
        const fetchDuration = Date.now() - sourceStartTime;

        // Log fetch complete
        await logStep(supabase, 'fetch_complete', 'success', {
          source_name: source.name,
          response_size_kb: Math.round(xml.length / 1024),
          duration_ms: fetchDuration,
        }, source.id);

        // Parse RSS
        await logStep(supabase, 'parse_rss', 'info', {
          source_name: source.name,
          message: 'A analisar XML...',
        }, source.id);

        const items = parseRss(xml);
        
        await logStep(supabase, 'parse_rss', 'success', {
          source_name: source.name,
          items_found: items.length,
        }, source.id, items.length);

        totalFound += items.length;

        let sourceSaved = 0;
        let sourceDuplicates = 0;

        for (const item of items) {
          // Skip if URL already exists
          if (existingUrls.has(item.link)) {
            sourceDuplicates++;
            continue;
          }

          // Check for title similarity (duplicate detection)
          let isDuplicate = false;
          let duplicateOf: string | null = null;
          
          for (let i = 0; i < existingTitles.length; i++) {
            const similarity = calculateSimilarity(item.title, existingTitles[i]);
            if (similarity > 0.85) {
              isDuplicate = true;
              duplicateOf = recentArticles?.[i]?.id || null;
              sourceDuplicates++;
              break;
            }
          }

          if (isDuplicate) continue;

          // Clean up HTML from description/content
          const cleanText = (html: string | undefined) => 
            html?.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim() || null;

          // Insert article
          const { data: insertedArticle, error: insertError } = await supabase
            .from('articles')
            .insert({
              source_id: source.id,
              source_url: item.link,
              original_title: item.title,
              original_content: cleanText(item.content || item.description),
              author: item.creator || null,
              status: 'captured',
              captured_at: new Date().toISOString(),
              category: source.categories?.[0] || null,
              is_duplicate: false,
              duplicate_of: null,
            })
            .select('id')
            .single();

          if (insertError) {
            if (insertError.code !== '23505') { // Ignore unique constraint violations
              console.error(`Failed to insert article: ${insertError.message}`);
            }
          } else {
            sourceSaved++;
            existingUrls.add(item.link);
            existingTitles.push(item.title);

            // Log each article saved
            await logStep(supabase, 'article_save', 'success', {
              source_name: source.name,
              article_id: insertedArticle?.id,
              article_title: item.title.substring(0, 80),
            }, source.id, 1, 1);
          }
        }

        totalSaved += sourceSaved;
        totalDuplicates += sourceDuplicates;

        // Update source stats
        await supabase
          .from('sources')
          .update({
            last_fetch_at: new Date().toISOString(),
            articles_captured: source.articles_captured + items.length,
            duplicates_found: (source as any).duplicates_found + sourceDuplicates,
          })
          .eq('id', source.id);

        // Log source complete
        await logStep(supabase, 'source_complete', 'success', {
          source_name: source.name,
          items_found: items.length,
          items_saved: sourceSaved,
          duplicates_skipped: sourceDuplicates,
          duration_ms: Date.now() - sourceStartTime,
        }, source.id, items.length, sourceSaved);

      } catch (sourceError) {
        const errorMessage = sourceError instanceof Error ? sourceError.message : 'Unknown error';
        errors.push(`${source.name}: ${errorMessage}`);

        await logStep(supabase, 'source_complete', 'error', {
          source_name: source.name,
          error: errorMessage,
          duration_ms: Date.now() - sourceStartTime,
        }, source.id, 0, 0, errorMessage);
      }
    }

    const totalDuration = Date.now() - startTime;

    // Log agent complete
    await logStep(supabase, 'agent_complete', 'success', {
      message: 'Agente concluído',
      sources_processed: sources.length,
      total_found: totalFound,
      total_saved: totalSaved,
      total_duplicates: totalDuplicates,
      errors_count: errors.length,
      duration_ms: totalDuration,
    }, undefined, totalFound, totalSaved);

    console.log(`Completed: ${totalFound} found, ${totalSaved} saved, ${totalDuplicates} duplicates in ${totalDuration}ms`);

    return new Response(
      JSON.stringify({
        message: 'Agent execution completed',
        sources_processed: sources.length,
        articles_found: totalFound,
        articles_saved: totalSaved,
        duplicates_skipped: totalDuplicates,
        duration_ms: totalDuration,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Agent error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
