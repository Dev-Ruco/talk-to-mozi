import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ProcessQueueRequest {
  article_id?: string; // Optional: process specific article immediately
  skip_queue?: boolean; // If true, process immediately regardless of queue
}

const SYSTEM_PROMPT = `És um editor de notícias experiente do B NEWS, um portal de Moçambique.

INSTRUÇÕES:
- Reformula o texto mantendo TODOS os factos e informações originais
- Escreve em português de Moçambique (pt-MZ)
- Usa linguagem clara e directa
- Mantém a estrutura: título impactante, lead resumido, corpo informativo
- NUNCA inventes informação - apenas reformula o que recebeste
- Corrige erros gramaticais e melhora a fluidez
- Gera 3-5 factos rápidos (quick_facts) que resumam os pontos principais

FORMATO DE RESPOSTA (JSON):
{
  "title": "Título reformulado",
  "lead": "Lead de 1-2 frases resumindo a notícia",
  "content": "Conteúdo reformulado completo",
  "quick_facts": ["Facto 1", "Facto 2", "Facto 3"]
}`;

async function processArticle(supabase: any, queueItem: any, LOVABLE_API_KEY: string) {
  const { article_id, id: queue_id } = queueItem;
  
  console.log(`Processing article ${article_id} from queue ${queue_id}`);
  
  // Mark as processing
  await supabase
    .from('rewrite_queue')
    .update({ status: 'processing', started_at: new Date().toISOString() })
    .eq('id', queue_id);
  
  try {
    // Fetch article
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', article_id)
      .single();

    if (articleError || !article) {
      throw new Error('Article not found');
    }

    const titleToRewrite = article.title || article.original_title || '';
    const contentToRewrite = article.content || article.original_content || '';

    if (!titleToRewrite && !contentToRewrite) {
      throw new Error('Article has no content to rewrite');
    }

    // Log start
    await supabase.from('agent_logs').insert({
      action: 'ai_auto_rewrite',
      status: 'info',
      details: {
        article_id,
        queue_id,
        title_preview: titleToRewrite.substring(0, 50),
      },
      executed_at: new Date().toISOString(),
    });

    const userMessage = `TÍTULO ORIGINAL:
${titleToRewrite}

CONTEÚDO ORIGINAL:
${contentToRewrite}`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No content received from AI');
    }

    // Parse JSON response
    let rewritten: { title: string; lead: string; content: string; quick_facts?: string[] };
    
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        rewritten = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      rewritten = {
        title: titleToRewrite,
        lead: '',
        content: aiContent,
      };
    }

    // Update article
    const { error: updateError } = await supabase
      .from('articles')
      .update({
        title: rewritten.title,
        lead: rewritten.lead,
        content: rewritten.content,
        quick_facts: rewritten.quick_facts || [],
        status: 'rewritten',
        updated_at: new Date().toISOString(),
      })
      .eq('id', article_id);

    if (updateError) {
      throw updateError;
    }

    // Mark queue item as completed
    await supabase
      .from('rewrite_queue')
      .update({ 
        status: 'completed', 
        completed_at: new Date().toISOString() 
      })
      .eq('id', queue_id);

    // Log success
    await supabase.from('agent_logs').insert({
      action: 'ai_auto_complete',
      status: 'success',
      details: {
        article_id,
        queue_id,
        title_preview: rewritten.title.substring(0, 50),
        tokens_used: aiData.usage?.total_tokens,
      },
      executed_at: new Date().toISOString(),
    });

    console.log(`Successfully processed article ${article_id}`);
    return { success: true, article_id };

  } catch (error) {
    console.error(`Error processing article ${article_id}:`, error);
    
    // Mark queue item as failed
    await supabase
      .from('rewrite_queue')
      .update({ 
        status: 'failed', 
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString() 
      })
      .eq('id', queue_id);

    // Log error
    await supabase.from('agent_logs').insert({
      action: 'ai_auto_error',
      status: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      details: { article_id, queue_id },
      executed_at: new Date().toISOString(),
    });

    return { success: false, article_id, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: ProcessQueueRequest = {};
    try {
      body = await req.json();
    } catch {
      // No body is fine for processing queue
    }

    const { article_id, skip_queue } = body;

    // If specific article requested, add to queue with high priority
    if (article_id) {
      // Check if already in queue
      const { data: existing } = await supabase
        .from('rewrite_queue')
        .select('id, status')
        .eq('article_id', article_id)
        .in('status', ['queued', 'processing'])
        .single();

      if (!existing) {
        // Add to queue
        const priority = skip_queue ? 1000 : 0;
        await supabase
          .from('rewrite_queue')
          .insert({ article_id, priority });
      } else if (skip_queue && existing.status === 'queued') {
        // Update priority to skip queue
        await supabase
          .from('rewrite_queue')
          .update({ priority: 1000 })
          .eq('id', existing.id);
      }
    }

    // Check if something is already processing
    const { data: processing } = await supabase
      .from('rewrite_queue')
      .select('*')
      .eq('status', 'processing')
      .limit(1);

    if (processing && processing.length > 0) {
      // Check if it's stuck (more than 5 minutes)
      const startedAt = new Date(processing[0].started_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - startedAt.getTime()) / (1000 * 60);
      
      if (diffMinutes < 5) {
        return new Response(
          JSON.stringify({ 
            status: 'busy', 
            message: 'Already processing an article',
            processing_article_id: processing[0].article_id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Mark stuck item as failed
      await supabase
        .from('rewrite_queue')
        .update({ status: 'failed', error_message: 'Processing timeout' })
        .eq('id', processing[0].id);
    }

    // Get next item from queue
    const { data: nextItem, error: queueError } = await supabase
      .from('rewrite_queue')
      .select('*')
      .eq('status', 'queued')
      .order('priority', { ascending: false })
      .order('queued_at', { ascending: true })
      .limit(1)
      .single();

    if (queueError || !nextItem) {
      return new Response(
        JSON.stringify({ status: 'empty', message: 'Queue is empty' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process the article
    const result = await processArticle(supabase, nextItem, LOVABLE_API_KEY);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Process queue error:', error);
    
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
