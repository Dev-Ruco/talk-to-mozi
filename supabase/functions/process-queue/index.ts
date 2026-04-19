import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ProcessQueueRequest {
  article_id?: string;
  skip_queue?: boolean;
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

const MAX_ATTEMPTS = 3;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processArticle(supabase: any, queueItem: any, OPENAI_API_KEY: string) {
  const { article_id, id: queue_id, attempts = 0 } = queueItem;
  const newAttempts = attempts + 1;

  await supabase
    .from("rewrite_queue")
    .update({ status: "processing", started_at: new Date().toISOString(), attempts: newAttempts })
    .eq("id", queue_id);

  try {
    const { data: article, error: articleError } = await supabase
      .from("articles")
      .select("*")
      .eq("id", article_id)
      .single();

    if (articleError || !article) throw new Error("Article not found");

    const titleToRewrite = article.title || article.original_title || "";
    const contentToRewrite = article.content || article.original_content || "";
    if (!titleToRewrite && !contentToRewrite) throw new Error("Article has no content to rewrite");

    // Optimização: enviar apenas título + excerto (até 4000 chars)
    const userMessage = `TÍTULO ORIGINAL:
${titleToRewrite}

CONTEÚDO ORIGINAL:
${contentToRewrite.slice(0, 4000)}`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errorText);

      // Erros transitórios → re-encolar com backoff se ainda há tentativas
      if ((aiResponse.status === 429 || aiResponse.status >= 500) && newAttempts < MAX_ATTEMPTS) {
        const backoffMin = Math.pow(2, newAttempts) * 5; // 10, 20, 40 min
        const nextAt = new Date(Date.now() + backoffMin * 60 * 1000).toISOString();
        await supabase
          .from("rewrite_queue")
          .update({
            status: "queued",
            started_at: null,
            queued_at: nextAt,
            error_message: `Retry ${newAttempts}/${MAX_ATTEMPTS} após HTTP ${aiResponse.status}`,
          })
          .eq("id", queue_id);
        return { success: false, retry: true, article_id, attempts: newAttempts };
      }

      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    if (!aiContent) throw new Error("No content received from AI");

    let rewritten: { title: string; lead: string; content: string; quick_facts?: string[] };
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) rewritten = JSON.parse(jsonMatch[0]);
      else throw new Error("No JSON found");
    } catch {
      rewritten = { title: titleToRewrite, lead: "", content: aiContent };
    }

    const { error: updateError } = await supabase
      .from("articles")
      .update({
        title: rewritten.title,
        lead: rewritten.lead,
        content: rewritten.content,
        quick_facts: rewritten.quick_facts || [],
        status: "rewritten",
        updated_at: new Date().toISOString(),
      })
      .eq("id", article_id);
    if (updateError) throw updateError;

    await supabase
      .from("rewrite_queue")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", queue_id);

    await supabase.from("pipeline_logs").insert({
      node: "REWRITE",
      level: "INFO",
      message: `Reescrito: ${rewritten.title.substring(0, 60)}`,
      meta: { article_id, queue_id, attempts: newAttempts, tokens: aiData.usage?.total_tokens },
      article_id,
    });

    return { success: true, article_id };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error processing ${article_id}:`, msg);

    await supabase
      .from("rewrite_queue")
      .update({
        status: "failed",
        error_message: msg,
        completed_at: new Date().toISOString(),
      })
      .eq("id", queue_id);

    await supabase.from("pipeline_logs").insert({
      node: "REWRITE",
      level: "ERROR",
      message: `Falha reescrita após ${newAttempts} tentativas: ${msg}`,
      meta: { article_id, queue_id, attempts: newAttempts },
      article_id,
    });

    return { success: false, article_id, error: msg };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: ProcessQueueRequest = {};
    try { body = await req.json(); } catch { /* empty */ }
    const { article_id, skip_queue } = body;

    // Settings: limite por hora
    const { data: settings } = await supabase.from("agent_settings").select("key, value");
    const settingsMap = new Map<string, string>(
      (settings || []).map((s: { key: string; value: string }) => [s.key, s.value])
    );
    const MAX_REWRITES_PER_HOUR = parseInt(settingsMap.get("max_rewrites_per_hour") || "15", 10);

    // Throttle: contar reescritas completas na última hora
    const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
    const { count: lastHourCount } = await supabase
      .from("rewrite_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("completed_at", oneHourAgo);

    if ((lastHourCount || 0) >= MAX_REWRITES_PER_HOUR && !article_id) {
      return new Response(JSON.stringify({
        status: "throttled",
        message: `Limite de ${MAX_REWRITES_PER_HOUR}/hora atingido`,
        last_hour_count: lastHourCount,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Adicionar específico se pedido (decisão manual editorial)
    if (article_id) {
      const { data: existing } = await supabase
        .from("rewrite_queue")
        .select("id, status")
        .eq("article_id", article_id)
        .in("status", ["queued", "processing"])
        .maybeSingle();
      if (!existing) {
        await supabase.from("rewrite_queue").insert({
          article_id,
          priority: skip_queue ? 1000 : 0,
          status: "queued",
        });
        await supabase.from("articles").update({ status: "queued" }).eq("id", article_id);
      } else if (skip_queue && existing.status === "queued") {
        await supabase.from("rewrite_queue").update({ priority: 1000 }).eq("id", existing.id);
      }
    }

    // Despresar processamentos presos (>5 min)
    const { data: stuck } = await supabase
      .from("rewrite_queue")
      .select("*")
      .eq("status", "processing")
      .lt("started_at", new Date(Date.now() - 5 * 60 * 1000).toISOString());
    if (stuck && stuck.length > 0) {
      for (const s of stuck) {
        await supabase
          .from("rewrite_queue")
          .update({ status: "failed", error_message: "Processing timeout" })
          .eq("id", s.id);
      }
    }

    // Não processar se já há um a correr
    const { data: processing } = await supabase
      .from("rewrite_queue")
      .select("id, article_id")
      .eq("status", "processing")
      .limit(1);
    if (processing && processing.length > 0) {
      return new Response(JSON.stringify({
        status: "busy",
        processing_article_id: processing[0].article_id,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Próximo da fila — só apanhar itens cuja janela de retry já chegou
    const now = new Date().toISOString();
    const { data: nextItem } = await supabase
      .from("rewrite_queue")
      .select("*")
      .eq("status", "queued")
      .lte("queued_at", now)
      .lt("attempts", MAX_ATTEMPTS)
      .order("priority", { ascending: false })
      .order("queued_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!nextItem) {
      return new Response(JSON.stringify({ status: "empty", message: "Queue is empty" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await processArticle(supabase, nextItem, OPENAI_API_KEY);
    return new Response(JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Process queue error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error",
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
