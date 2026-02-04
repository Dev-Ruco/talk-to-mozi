import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      throw new Error(`Failed to fetch sources: ${sourcesError.message}`);
    }

    if (!sources || sources.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active sources found', articles_found: 0, articles_saved: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${sources.length} sources...`);

    let totalFound = 0;
    let totalSaved = 0;
    const errors: string[] = [];

    // Get recent articles for duplicate detection
    const { data: recentArticles } = await supabase
      .from('articles')
      .select('id, title, original_title, source_url')
      .gte('captured_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('captured_at', { ascending: false })
      .limit(500);

    const existingUrls = new Set(recentArticles?.map(a => a.source_url).filter(Boolean) || []);
    const existingTitles = recentArticles?.map(a => a.title || a.original_title).filter(Boolean) || [];

    for (const source of sources as Source[]) {
      try {
        console.log(`Fetching from: ${source.name} (${source.url})`);
        
        // Fetch RSS feed
        const response = await fetch(source.url, {
          headers: { 'User-Agent': 'B NEWS Agent/1.0' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const xml = await response.text();
        const items = parseRss(xml);
        
        console.log(`Found ${items.length} items from ${source.name}`);
        totalFound += items.length;

        let sourceSaved = 0;

        for (const item of items) {
          // Skip if URL already exists
          if (existingUrls.has(item.link)) {
            console.log(`Skipping duplicate URL: ${item.link}`);
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
              console.log(`Detected duplicate: "${item.title}" similar to existing article`);
              break;
            }
          }

          // Clean up HTML from description/content
          const cleanText = (html: string | undefined) => 
            html?.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim() || null;

          // Insert article
          const { error: insertError } = await supabase
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
              is_duplicate: isDuplicate,
              duplicate_of: duplicateOf,
            });

          if (insertError) {
            if (insertError.code !== '23505') { // Ignore unique constraint violations
              console.error(`Failed to insert article: ${insertError.message}`);
            }
          } else {
            sourceSaved++;
            existingUrls.add(item.link);
            existingTitles.push(item.title);
          }
        }

        totalSaved += sourceSaved;

        // Update source stats
        await supabase
          .from('sources')
          .update({
            last_fetch_at: new Date().toISOString(),
            articles_captured: (source as any).articles_captured + items.length,
          })
          .eq('id', source.id);

        // Log execution
        await supabase
          .from('agent_logs')
          .insert({
            source_id: source.id,
            action: 'fetch_rss',
            status: 'success',
            articles_found: items.length,
            articles_saved: sourceSaved,
            executed_at: new Date().toISOString(),
          });

      } catch (sourceError) {
        const errorMessage = sourceError instanceof Error ? sourceError.message : 'Unknown error';
        errors.push(`${source.name}: ${errorMessage}`);
        console.error(`Error processing ${source.name}:`, errorMessage);

        // Log error
        await supabase
          .from('agent_logs')
          .insert({
            source_id: source.id,
            action: 'fetch_rss',
            status: 'error',
            error_message: errorMessage,
            articles_found: 0,
            articles_saved: 0,
            executed_at: new Date().toISOString(),
          });
      }
    }

    console.log(`Completed: ${totalFound} found, ${totalSaved} saved`);

    return new Response(
      JSON.stringify({
        message: 'Agent execution completed',
        sources_processed: sources.length,
        articles_found: totalFound,
        articles_saved: totalSaved,
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
