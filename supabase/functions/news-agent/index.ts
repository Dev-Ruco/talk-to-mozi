import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Journalistic rewrite prompt (PT-MZ)
const JOURNALISTIC_PROMPT = `És um jornalista sénior do B NEWS com décadas de experiência.

INSTRUÇÕES:
- Reescreve o texto com tom jornalístico formal e profissional
- Usa a estrutura da pirâmide invertida (mais importante primeiro)
- Escreve em português de Moçambique (pt-MZ)
- Adiciona contexto quando necessário sem inventar factos
- Usa citações directas se existirem no original
- Linguagem neutra e objectiva

FORMATO DE RESPOSTA (JSON):
{
  "title": "Título noticioso formal",
  "lead": "Lead jornalístico respondendo às perguntas essenciais",
  "content": "Texto em estilo jornalístico profissional"
}`;

// Maximum articles to auto-rewrite per execution (avoid timeout)
const MAX_AUTO_REWRITES = 5;

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
  | 'agent_complete'
  | 'ai_auto_rewrite'
  | 'ai_auto_complete'
  | 'ai_auto_error';

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

// Auto-rewrite article using Lovable AI
async function autoRewriteArticle(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  articleId: string,
  originalTitle: string,
  originalContent: string,
  logStep: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase: any,
    action: LogAction,
    status: "success" | "error" | "info",
    details: Record<string, unknown>,
    sourceId?: string,
    articlesFound?: number,
    articlesSaved?: number,
    errorMessage?: string
  ) => Promise<void>
): Promise<boolean> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  if (!LOVABLE_API_KEY) {
    console.log("LOVABLE_API_KEY not configured, skipping auto-rewrite");
    return false;
  }

  // Skip if content is too short
  if (!originalContent || originalContent.length < 100) {
    console.log(`Article ${articleId} content too short, skipping auto-rewrite`);
    return false;
  }

  try {
    await logStep(supabase, "ai_auto_rewrite", "info", {
      article_id: articleId,
      title_preview: originalTitle.substring(0, 50),
      message: "A reformular automaticamente...",
    });

    const userMessage = `TÍTULO ORIGINAL:
${originalTitle}

CONTEÚDO ORIGINAL:
${originalContent}`;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: JOURNALISTIC_PROMPT },
            { role: "user", content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        await logStep(supabase, "ai_auto_error", "error", {
          article_id: articleId,
          error: "Rate limit exceeded",
        }, undefined, 0, 0, "Rate limit exceeded - stopping auto-rewrite");
        return false;
      }

      if (aiResponse.status === 402) {
        await logStep(supabase, "ai_auto_error", "error", {
          article_id: articleId,
          error: "AI credits exhausted",
        }, undefined, 0, 0, "AI credits exhausted");
        return false;
      }

      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No content received from AI");
    }

    // Parse JSON response
    let rewritten: { title: string; lead: string; content: string };

    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        rewritten = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch {
      console.error("Failed to parse AI response:", aiContent);
      rewritten = {
        title: originalTitle,
        lead: "",
        content: aiContent,
      };
    }

    // Update article with rewritten content
    const { error: updateError } = await supabase
      .from("articles")
      .update({
        title: rewritten.title,
        lead: rewritten.lead,
        content: rewritten.content,
        status: "rewritten",
        updated_at: new Date().toISOString(),
      })
      .eq("id", articleId);

    if (updateError) {
      throw new Error(`Failed to update article: ${updateError.message}`);
    }

    await logStep(supabase, "ai_auto_complete", "success", {
      article_id: articleId,
      title_preview: rewritten.title.substring(0, 50),
      tokens_used: aiData.usage?.total_tokens,
      message: "Artigo reformulado com sucesso",
    });

    console.log(`Auto-rewrote article ${articleId}`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Auto-rewrite error for ${articleId}:`, errorMessage);

    await logStep(supabase, "ai_auto_error", "error", {
      article_id: articleId,
      error: errorMessage,
    }, undefined, 0, 0, errorMessage);

    return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body for optional source filter
    let sourceId: string | null = null;
    let autoRewrite = true; // Default: auto-rewrite enabled
    try {
      const body = await req.json();
      sourceId = body?.source_id || null;
      if (body?.auto_rewrite === false) {
        autoRewrite = false;
      }
    } catch {
      // No body or invalid JSON, process all sources
    }

    // Log agent start
    await logStep(supabase, "agent_start", "info", {
      message: "Agente iniciado",
      source_filter: sourceId || "todas as fontes",
      auto_rewrite: autoRewrite,
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
      await logStep(supabase, "agent_start", "error", {
        error: sourcesError.message,
      }, undefined, 0, 0, sourcesError.message);
      throw new Error(`Failed to fetch sources: ${sourcesError.message}`);
    }

    if (!sources || sources.length === 0) {
      await logStep(supabase, "agent_complete", "info", {
        message: "Nenhuma fonte activa encontrada",
        duration_ms: Date.now() - startTime,
      });
      return new Response(
        JSON.stringify({
          message: "No active sources found",
          articles_found: 0,
          articles_saved: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${sources.length} sources...`);

    let totalFound = 0;
    let totalSaved = 0;
    let totalDuplicates = 0;
    let totalRewritten = 0;
    let rewriteErrors = 0;
    const errors: string[] = [];

    // Get recent articles for duplicate detection
    await logStep(supabase, "duplicate_check", "info", {
      message: "A carregar artigos recentes para detecção de duplicados",
    });

    const { data: recentArticles } = await supabase
      .from("articles")
      .select("id, title, original_title, source_url")
      .gte(
        "captured_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order("captured_at", { ascending: false })
      .limit(500);

    const existingUrls = new Set(
      recentArticles?.map((a) => a.source_url).filter(Boolean) || []
    );
    const existingTitles =
      recentArticles
        ?.map((a) => a.title || a.original_title)
        .filter(Boolean) || [];

    await logStep(supabase, "duplicate_check", "success", {
      message: "Cache de duplicados carregado",
      existing_urls: existingUrls.size,
      existing_titles: existingTitles.length,
    });

    // Track articles to rewrite
    const articlesToRewrite: Array<{
      id: string;
      title: string;
      content: string;
    }> = [];

    for (const source of sources as Source[]) {
      const sourceStartTime = Date.now();

      try {
        // Log fetch start
        await logStep(supabase, "fetch_start", "info", {
          source_name: source.name,
          source_url: source.url,
          source_type: source.type,
        }, source.id);

        // Fetch RSS feed
        const response = await fetch(source.url, {
          headers: { "User-Agent": "B NEWS Agent/1.0" },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const xml = await response.text();
        const fetchDuration = Date.now() - sourceStartTime;

        // Log fetch complete
        await logStep(supabase, "fetch_complete", "success", {
          source_name: source.name,
          response_size_kb: Math.round(xml.length / 1024),
          duration_ms: fetchDuration,
        }, source.id);

        // Parse RSS
        await logStep(supabase, "parse_rss", "info", {
          source_name: source.name,
          message: "A analisar XML...",
        }, source.id);

        const items = parseRss(xml);

        await logStep(supabase, "parse_rss", "success", {
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

          for (let i = 0; i < existingTitles.length; i++) {
            const similarity = calculateSimilarity(item.title, existingTitles[i]);
            if (similarity > 0.85) {
              isDuplicate = true;
              sourceDuplicates++;
              break;
            }
          }

          if (isDuplicate) continue;

          // Clean up HTML from description/content
          const cleanText = (html: string | undefined) =>
            html
              ?.replace(/<[^>]*>/g, "")
              .replace(/&[^;]+;/g, " ")
              .trim() || null;

          const originalContent = cleanText(item.content || item.description);

          // Insert article
          const { data: insertedArticle, error: insertError } = await supabase
            .from("articles")
            .insert({
              source_id: source.id,
              source_url: item.link,
              original_title: item.title,
              original_content: originalContent,
              author: item.creator || null,
              status: "captured",
              captured_at: new Date().toISOString(),
              category: source.categories?.[0] || null,
              is_duplicate: false,
              duplicate_of: null,
            })
            .select("id")
            .single();

          if (insertError) {
            if (insertError.code !== "23505") {
              // Ignore unique constraint violations
              console.error(`Failed to insert article: ${insertError.message}`);
            }
          } else {
            sourceSaved++;
            existingUrls.add(item.link);
            existingTitles.push(item.title);

            // Log each article saved
            await logStep(supabase, "article_save", "success", {
              source_name: source.name,
              article_id: insertedArticle?.id,
              article_title: item.title.substring(0, 80),
            }, source.id, 1, 1);

            // Auto-add to rewrite queue for background processing
            if (insertedArticle?.id) {
              try {
                await supabase
                  .from("rewrite_queue")
                  .insert({
                    article_id: insertedArticle.id,
                    priority: 0, // Normal priority
                    status: "queued",
                  });
                console.log(`Added article ${insertedArticle.id} to rewrite queue`);
              } catch (queueError) {
                console.warn(`Failed to add to rewrite queue:`, queueError);
                // Don't block - article was saved successfully
              }
            }

            // Also queue for immediate auto-rewrite if enabled (legacy behavior)
            if (
              autoRewrite &&
              insertedArticle?.id &&
              originalContent &&
              articlesToRewrite.length < MAX_AUTO_REWRITES
            ) {
              articlesToRewrite.push({
                id: insertedArticle.id,
                title: item.title,
                content: originalContent,
              });
            }
          }
        }

        totalSaved += sourceSaved;
        totalDuplicates += sourceDuplicates;

        // Update source stats
        await supabase
          .from("sources")
          .update({
            last_fetch_at: new Date().toISOString(),
            articles_captured: source.articles_captured + items.length,
            duplicates_found:
              (source as any).duplicates_found + sourceDuplicates,
          })
          .eq("id", source.id);

        // Log source complete
        await logStep(supabase, "source_complete", "success", {
          source_name: source.name,
          items_found: items.length,
          items_saved: sourceSaved,
          duplicates_skipped: sourceDuplicates,
          duration_ms: Date.now() - sourceStartTime,
        }, source.id, items.length, sourceSaved);
      } catch (sourceError) {
        const errorMessage =
          sourceError instanceof Error ? sourceError.message : "Unknown error";
        errors.push(`${source.name}: ${errorMessage}`);

        await logStep(supabase, "source_complete", "error", {
          source_name: source.name,
          error: errorMessage,
          duration_ms: Date.now() - sourceStartTime,
        }, source.id, 0, 0, errorMessage);
      }
    }

    // Auto-rewrite articles sequentially
    if (autoRewrite && articlesToRewrite.length > 0) {
      console.log(`Auto-rewriting ${articlesToRewrite.length} articles...`);

      for (const article of articlesToRewrite) {
        const success = await autoRewriteArticle(
          supabase,
          article.id,
          article.title,
          article.content,
          logStep
        );

        if (success) {
          totalRewritten++;
        } else {
          rewriteErrors++;
        }

        // Small delay between rewrites to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    const totalDuration = Date.now() - startTime;

    // Log agent complete
    await logStep(supabase, "agent_complete", "success", {
      message: "Agente concluído",
      sources_processed: sources.length,
      total_found: totalFound,
      total_saved: totalSaved,
      total_duplicates: totalDuplicates,
      total_rewritten: totalRewritten,
      rewrite_errors: rewriteErrors,
      errors_count: errors.length,
      duration_ms: totalDuration,
    }, undefined, totalFound, totalSaved);

    console.log(
      `Completed: ${totalFound} found, ${totalSaved} saved, ${totalRewritten} rewritten, ${totalDuplicates} duplicates in ${totalDuration}ms`
    );

    return new Response(
      JSON.stringify({
        message: "Agent execution completed",
        sources_processed: sources.length,
        articles_found: totalFound,
        articles_saved: totalSaved,
        articles_rewritten: totalRewritten,
        duplicates_skipped: totalDuplicates,
        duration_ms: totalDuration,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Agent error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
