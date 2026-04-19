import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ManualTextBody {
  mode: "text";
  title: string;
  lead?: string;
  content: string;
  source_name?: string;
  source_url?: string;
  category?: string;
}

interface ManualLinkBody {
  mode: "link";
  url: string;
  category?: string;
  source_name?: string;
}

type Body = ManualTextBody | ManualLinkBody;

function stripHtml(s: string): string {
  return s.replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFromHtml(html: string): { title: string; description: string; content: string } {
  const title =
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ||
    "";
  const description =
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    "";
  // Best-effort body extraction
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
  const bodyText = stripHtml(articleMatch ? articleMatch[0] : html);
  return {
    title: stripHtml(title),
    description: stripHtml(description),
    content: bodyText.slice(0, 8000),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth: verificar utilizador via Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verificar role
    const db = createClient(supabaseUrl, serviceKey);
    const { data: hasRole } = await db.rpc("has_any_role", { _user_id: user.id });
    if (!hasRole) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: Body = await req.json();

    if (body.mode === "text") {
      if (!body.title || !body.content) {
        return new Response(JSON.stringify({ error: "title e content são obrigatórios" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Dedupe por título normalizado
      const { data: dup } = await db.rpc("is_duplicate_article", {
        _url: body.source_url || null,
        _title: body.title,
      });
      if (dup) {
        return new Response(JSON.stringify({ error: "Artigo duplicado (URL ou título já existe)" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { data: inserted, error: insErr } = await db.from("articles").insert({
        title: body.title,
        lead: body.lead || null,
        content: body.content,
        category: body.category || null,
        source_name: body.source_name || null,
        source_url: body.source_url || null,
        source_type: "manual",
        ingestion_method: "manual_text",
        original_title: body.title,
        original_content: body.content,
        status: "reviewed",
        captured_at: new Date().toISOString(),
        editor_id: user.id,
      }).select("id").single();
      if (insErr) throw insErr;

      return new Response(JSON.stringify({ success: true, article_id: inserted.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.mode === "link") {
      if (!body.url) {
        return new Response(JSON.stringify({ error: "url é obrigatório" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { data: dup } = await db.rpc("is_duplicate_article", {
        _url: body.url, _title: null,
      });
      if (dup) {
        return new Response(JSON.stringify({ error: "Artigo já capturado anteriormente" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      let extracted = { title: "", description: "", content: "" };
      let extractError: string | null = null;
      try {
        const res = await fetch(body.url, {
          headers: { "User-Agent": "BNewsBot/1.0" },
          signal: AbortSignal.timeout(12000),
          redirect: "follow",
        });
        if (res.ok) {
          const html = await res.text();
          extracted = extractFromHtml(html);
        } else {
          extractError = `HTTP ${res.status}`;
        }
      } catch (e) {
        extractError = e instanceof Error ? e.message : "Falha ao buscar URL";
      }

      const { data: inserted, error: insErr } = await db.from("articles").insert({
        title: extracted.title || null,
        lead: extracted.description || null,
        content: extracted.content || null,
        original_title: extracted.title || null,
        original_content: extracted.content || null,
        category: body.category || null,
        source_name: body.source_name || null,
        source_url: body.url,
        source_type: "manual",
        ingestion_method: "manual_link",
        status: extracted.content ? "captured" : "captured",
        captured_at: new Date().toISOString(),
        editor_id: user.id,
      }).select("id").single();
      if (insErr) throw insErr;

      return new Response(JSON.stringify({
        success: true,
        article_id: inserted.id,
        extract_error: extractError,
        extracted_chars: extracted.content.length,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "mode inválido (use 'text' ou 'link')" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("manual-ingest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
