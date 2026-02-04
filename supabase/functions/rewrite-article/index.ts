import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

type RewriteAction = 'rewrite' | 'shorten' | 'journalistic';

interface RewriteRequest {
  article_id: string;
  action: RewriteAction;
  // Optional: override content to rewrite (for unsaved changes)
  title?: string;
  content?: string;
}

const SYSTEM_PROMPTS: Record<RewriteAction, string> = {
  rewrite: `És um editor de notícias experiente do B NEWS, um portal de Moçambique.

INSTRUÇÕES:
- Reformula o texto mantendo TODOS os factos e informações originais
- Escreve em português de Moçambique (pt-MZ)
- Usa linguagem clara e directa
- Mantém a estrutura: título impactante, lead resumido, corpo informativo
- NUNCA inventes informação - apenas reformula o que recebeste
- Corrige erros gramaticais e melhora a fluidez

FORMATO DE RESPOSTA (JSON):
{
  "title": "Título reformulado",
  "lead": "Lead de 1-2 frases resumindo a notícia",
  "content": "Conteúdo reformulado completo"
}`,

  shorten: `És um editor de notícias do B NEWS especializado em resumos.

INSTRUÇÕES:
- Resume o texto para 2-3 parágrafos curtos
- Mantém apenas a informação essencial (Quem, O quê, Quando, Onde)
- Escreve em português de Moçambique (pt-MZ)
- Remove detalhes secundários mas mantém os factos principais
- NUNCA inventes informação

FORMATO DE RESPOSTA (JSON):
{
  "title": "Título curto e impactante",
  "lead": "Uma frase resumindo o essencial",
  "content": "Resumo em 2-3 parágrafos"
}`,

  journalistic: `És um jornalista sénior do B NEWS com décadas de experiência.

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
}`,
};

Deno.serve(async (req) => {
  // Handle CORS
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

    const body: RewriteRequest = await req.json();
    const { article_id, action, title: overrideTitle, content: overrideContent } = body;

    if (!article_id || !action) {
      return new Response(
        JSON.stringify({ error: 'article_id and action are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['rewrite', 'shorten', 'journalistic'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use: rewrite, shorten, or journalistic' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch article
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', article_id)
      .single();

    if (articleError || !article) {
      return new Response(
        JSON.stringify({ error: 'Article not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use override content if provided, otherwise use article content
    const titleToRewrite = overrideTitle || article.title || article.original_title || '';
    const contentToRewrite = overrideContent || article.content || article.original_content || '';

    if (!titleToRewrite && !contentToRewrite) {
      return new Response(
        JSON.stringify({ error: 'Article has no content to rewrite' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log AI action start
    await supabase.from('agent_logs').insert({
      action: 'ai_rewrite',
      status: 'info',
      details: {
        article_id,
        action_type: action,
        title_preview: titleToRewrite.substring(0, 50),
      },
      executed_at: new Date().toISOString(),
    });

    const userMessage = `TÍTULO ORIGINAL:
${titleToRewrite}

CONTEÚDO ORIGINAL:
${contentToRewrite}`;

    console.log(`Rewriting article ${article_id} with action: ${action}`);

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
          { role: 'system', content: SYSTEM_PROMPTS[action] },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No content received from AI');
    }

    // Parse JSON response from AI
    let rewritten: { title: string; lead: string; content: string };
    
    try {
      // Try to extract JSON from the response (AI might include markdown code blocks)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        rewritten = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      // Fallback: use the raw response as content
      rewritten = {
        title: titleToRewrite,
        lead: '',
        content: aiContent,
      };
    }

    // Log AI action complete
    await supabase.from('agent_logs').insert({
      action: 'ai_complete',
      status: 'success',
      details: {
        article_id,
        action_type: action,
        title_preview: rewritten.title.substring(0, 50),
        tokens_used: aiData.usage?.total_tokens,
      },
      executed_at: new Date().toISOString(),
    });

    console.log(`Successfully rewrote article ${article_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        title: rewritten.title,
        lead: rewritten.lead,
        content: rewritten.content,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Rewrite error:', error);
    
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
