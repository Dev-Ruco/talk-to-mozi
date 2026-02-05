import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ChatRequest {
  action?: 'chat' | 'generate_suggestions';
  question?: string;
  article_id?: string;
  conversation_history?: Array<{ role: string; content: string }>;
}

interface Article {
  id: string;
  title: string;
  lead: string;
  content: string;
  quick_facts: string[];
  category: string;
  tags: string[];
  published_at: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ChatRequest = await req.json();
    const { action = 'chat', question, article_id, conversation_history = [] } = requestData;

    // Initialize Supabase client with service role for full access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle generate_suggestions action
    if (action === 'generate_suggestions') {
      console.log(`[chat] Generating suggestions for article: ${article_id || 'global'}`);
      
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        // Return default suggestions if AI not available
        return new Response(
          JSON.stringify({
            suggestions: [
              "Explica isto de forma simples",
              "Qual o impacto disto?",
              "Quem ganha e quem perde?",
              "Isto já aconteceu antes?",
            ]
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (article_id) {
        // Fetch the specific article
        const { data: article, error } = await supabase
          .from("articles")
          .select("id, title, lead, content, category, tags")
          .eq("id", article_id)
          .eq("status", "published")
          .single();

        if (error || !article) {
          console.error("[chat] Error fetching article for suggestions:", error);
          return new Response(
            JSON.stringify({
              suggestions: [
                "Explica isto de forma simples",
                "Qual o impacto disto?",
                "Quem ganha e quem perde?",
                "Isto já aconteceu antes?",
              ]
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Generate contextual suggestions using AI
        const suggestionPrompt = `Analisa este artigo de notícias e gera exactamente 4 perguntas curtas e específicas que um leitor moçambicano gostaria de fazer sobre ESTE artigo específico.

ARTIGO:
Título: ${article.title}
Resumo: ${article.lead}
Categoria: ${article.category}
Conteúdo: ${article.content?.substring(0, 1500) || ''}

REGRAS:
1. As perguntas devem ser ESPECÍFICAS a este artigo (mencionar entidades, nomes, lugares do artigo)
2. Usar português de Moçambique (pt-MZ)
3. Perguntas curtas (máximo 8 palavras cada)
4. Variar os tipos: uma sobre explicação simples, uma sobre impacto, uma sobre contexto histórico, uma sobre consequências práticas
5. NÃO usar perguntas genéricas como "Qual o impacto?"

Responde APENAS com um JSON array de 4 strings:
["pergunta 1", "pergunta 2", "pergunta 3", "pergunta 4"]`;

        try {
          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [{ role: "user", content: suggestionPrompt }],
              temperature: 0.8,
              max_tokens: 300,
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const content = aiData.choices?.[0]?.message?.content || "";
            
            // Parse JSON from response
            const jsonMatch = content.match(/\[[\s\S]*?\]/);
            if (jsonMatch) {
              try {
                const suggestions = JSON.parse(jsonMatch[0]);
                if (Array.isArray(suggestions) && suggestions.length >= 2) {
                  console.log("[chat] Generated contextual suggestions:", suggestions);
                  return new Response(
                    JSON.stringify({ suggestions: suggestions.slice(0, 4) }),
                    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
                  );
                }
              } catch {
                console.error("[chat] Failed to parse suggestions JSON");
              }
            }
          }
        } catch (aiError) {
          console.error("[chat] AI error generating suggestions:", aiError);
        }
      }

      // Fallback suggestions
      return new Response(
        JSON.stringify({
          suggestions: [
            "Explica isto de forma simples",
            "Qual o impacto para Moçambique?",
            "Quem são os principais envolvidos?",
            "O que acontece a seguir?",
          ]
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Original chat functionality
    if (!question?.trim()) {
      return new Response(
        JSON.stringify({ error: "Pergunta é obrigatória" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[chat] Processing question: "${question.substring(0, 50)}..." article_id: ${article_id || 'global'}`);

    // Fetch articles based on context
    let articles: Article[] = [];
    
    if (article_id) {
      // Fetch specific article + related ones
      const { data: mainArticle, error: mainError } = await supabase
        .from("articles")
        .select("id, title, lead, content, quick_facts, category, tags, published_at")
        .eq("id", article_id)
        .eq("status", "published")
        .single();

      if (mainError) {
        console.error("[chat] Error fetching main article:", mainError);
      } else if (mainArticle) {
        articles.push(mainArticle);
        
        // Fetch related articles from same category
        const { data: relatedArticles } = await supabase
          .from("articles")
          .select("id, title, lead, content, quick_facts, category, tags, published_at")
          .eq("status", "published")
          .eq("category", mainArticle.category)
          .neq("id", article_id)
          .order("published_at", { ascending: false })
          .limit(5);
        
        if (relatedArticles) {
          articles = [...articles, ...relatedArticles];
        }
      }
    } else {
      // Global search - fetch all published articles
      const { data: allArticles, error: allError } = await supabase
        .from("articles")
        .select("id, title, lead, content, quick_facts, category, tags, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(50);

      if (allError) {
        console.error("[chat] Error fetching articles:", allError);
      } else if (allArticles) {
        articles = allArticles;
      }
    }

    console.log(`[chat] Found ${articles.length} articles for context`);

    if (articles.length === 0) {
      return new Response(
        JSON.stringify({
          response: "De momento não existem notícias publicadas na nossa base de dados. Por favor, volte mais tarde.",
          related_article_ids: [],
          confidence: "low"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context from articles
    const articlesContext = articles.map((article, index) => {
      const quickFactsText = article.quick_facts?.length 
        ? `\nFACTOS RÁPIDOS:\n${article.quick_facts.map((f: string) => `- ${f}`).join('\n')}`
        : '';
      
      return `
---
ARTIGO ${index + 1} (ID: ${article.id})
TÍTULO: ${article.title}
CATEGORIA: ${article.category}
DATA: ${new Date(article.published_at).toLocaleDateString('pt-MZ')}
RESUMO: ${article.lead}
CONTEÚDO: ${article.content?.substring(0, 2000) || ''}${quickFactsText}
TAGS: ${article.tags?.join(', ') || 'Sem tags'}
---`;
    }).join('\n');

    // System prompt
    const systemPrompt = `És um assistente inteligente do B NEWS, o portal de notícias de referência de Moçambique.

REGRAS OBRIGATÓRIAS:
1. Responde APENAS com base nos artigos que te forneço abaixo
2. Se a informação não existir nos artigos, diz claramente: "Não encontrei notícias sobre esse tema na nossa base de dados"
3. Usa português de Moçambique (pt-MZ)
4. Cita factos específicos dos artigos quando relevante
5. Sê conciso mas informativo
6. Menciona a fonte (título do artigo) quando apropriado
7. Se estiveres a responder sobre um artigo específico, foca-te nesse artigo

ARTIGOS DISPONÍVEIS NA BASE DE DADOS:
${articlesContext}

INSTRUÇÕES DE RESPOSTA:
- Responde de forma natural e conversacional
- Se o utilizador pedir para explicar de forma simples, usa linguagem acessível
- Se perguntarem sobre impacto, analisa as consequências descritas nos artigos
- Sugere artigos relacionados quando apropriado`;

    // Build messages for AI
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversation_history.slice(-10).map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })),
      { role: "user", content: question }
    ];

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[chat] LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Serviço de IA não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[chat] Calling Lovable AI Gateway...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[chat] AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de pedidos excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Contacte o administrador." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao processar a sua pergunta. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices?.[0]?.message?.content || "Não consegui processar a sua pergunta.";

    console.log("[chat] AI response received successfully");

    // Extract related article IDs (first 3 articles from context)
    const relatedArticleIds = articles.slice(0, 3).map(a => a.id);

    return new Response(
      JSON.stringify({
        response: responseText,
        related_article_ids: relatedArticleIds,
        confidence: articles.length > 0 ? "high" : "low"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[chat] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro inesperado" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
