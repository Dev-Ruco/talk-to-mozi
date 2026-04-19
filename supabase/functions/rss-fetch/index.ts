import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FetchBody {
  source_id?: string;
  limit_sources?: number;
  limit_items_per_source?: number;
  dry_run?: boolean;
}

interface FeedItem {
  title: string;
  link: string;
  published: string;
  summary: string;
  categories: string[];
}

// ─── XML helpers ───
function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(re);
  return m ? m[1].trim() : "";
}
function extractAttr(xml: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*${attr}=["']([^"']*)["']`, "i");
  const m = xml.match(re);
  return m ? m[1] : "";
}
function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}
function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function parseRss(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  const rssItems = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  for (const raw of rssItems) {
    const title = stripCdata(extractTag(raw, "title"));
    let link = stripCdata(extractTag(raw, "link"));
    if (!link) link = extractAttr(raw, "link", "href");
    const published =
      stripCdata(extractTag(raw, "pubDate")) ||
      stripCdata(extractTag(raw, "dc:date"));
    const summary =
      stripCdata(extractTag(raw, "description")) ||
      stripCdata(extractTag(raw, "content:encoded"));
    const cats = (raw.match(/<category[^>]*>[\s\S]*?<\/category>/gi) || []).map(
      (c) => stripCdata(extractTag(c, "category")).toLowerCase()
    );
    items.push({
      title: stripHtml(title),
      link: link.trim(),
      published,
      summary: stripHtml(summary).slice(0, 1500),
      categories: cats,
    });
  }
  if (items.length === 0) {
    const entries = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
    for (const raw of entries) {
      const title = stripCdata(extractTag(raw, "title"));
      let link = extractAttr(raw, "link", "href");
      if (!link) link = stripCdata(extractTag(raw, "link"));
      const published =
        stripCdata(extractTag(raw, "published")) ||
        stripCdata(extractTag(raw, "updated"));
      const summary =
        stripCdata(extractTag(raw, "summary")) ||
        stripCdata(extractTag(raw, "content"));
      const cats = (raw.match(/<category[^>]*>/gi) || []).map((c) =>
        extractAttr(c, "category", "term").toLowerCase()
      );
      items.push({
        title: stripHtml(title),
        link: link.trim(),
        published,
        summary: stripHtml(summary).slice(0, 1500),
        categories: cats,
      });
    }
  }
  return items;
}

async function discoverFeed(baseUrl: string): Promise<string | null> {
  const base = baseUrl.replace(/\/+$/, "");
  const candidates = [
    `${base}/feed/`,
    `${base}/rss`,
    `${base}/feed`,
    `${base}/?feed=rss2`,
    `${base}/rss.xml`,
    `${base}/atom.xml`,
    `${base}/index.xml`,
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        redirect: "follow",
        headers: { "User-Agent": "BNewsBot/1.0" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const ct = res.headers.get("content-type") || "";
      const text = await res.text();
      if (
        ct.includes("xml") || ct.includes("rss") || ct.includes("atom") ||
        text.trimStart().startsWith("<?xml") ||
        text.includes("<rss") || text.includes("<feed")
      ) {
        return url;
      }
    } catch {
      continue;
    }
  }
  return null;
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Jaccard similarity over word sets (>= 4 chars)
function jaccard(a: string, b: string): number {
  const tok = (s: string) =>
    new Set(
      s.toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3)
    );
  const A = tok(a); const B = tok(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  const union = new Set([...A, ...B]).size;
  return inter / union;
}

function matchesKeywords(text: string, keywords: string[]): boolean {
  if (!keywords || keywords.length === 0) return true;
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}
function excludedByKeywords(text: string, keywords: string[]): string | null {
  if (!keywords || keywords.length === 0) return null;
  const lower = text.toLowerCase();
  for (const kw of keywords) if (lower.includes(kw.toLowerCase())) return kw;
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const db = createClient(supabaseUrl, serviceKey);

  let body: FetchBody = {};
  try { body = await req.json(); } catch { /* empty */ }

  const { source_id, limit_sources = 20, limit_items_per_source, dry_run = false } = body;

  // ─── Settings ───
  const { data: settings } = await db.from("agent_settings").select("key, value");
  const settingsMap = new Map<string, string>(
    (settings || []).map((s: { key: string; value: string }) => [s.key, s.value])
  );
  const MAX_CAPTURE_PER_DAY = parseInt(settingsMap.get("max_capture_per_day") || "150", 10);
  const SIMILARITY_THRESHOLD = parseFloat(settingsMap.get("similarity_threshold") || "0.85");
  const FRESHNESS_HOURS = parseInt(settingsMap.get("freshness_window_hours") || "48", 10);

  // ─── Daily limit check ───
  const today = new Date().toISOString().slice(0, 10);
  const { data: dayCounter } = await db
    .from("daily_capture_counter")
    .select("captured_count")
    .eq("day", today)
    .maybeSingle();
  const captured_today = dayCounter?.captured_count || 0;
  const remaining_quota = Math.max(0, MAX_CAPTURE_PER_DAY - captured_today);

  if (remaining_quota === 0 && !dry_run) {
    await db.from("pipeline_logs").insert({
      node: "RSS_FETCH",
      level: "WARN",
      message: `Limite diário atingido (${captured_today}/${MAX_CAPTURE_PER_DAY}). Captura suspensa.`,
      meta: { captured_today, max_per_day: MAX_CAPTURE_PER_DAY },
    });
    return new Response(JSON.stringify({
      blocked_by_daily_limit: true,
      captured_today,
      max_per_day: MAX_CAPTURE_PER_DAY,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // ─── Fetch sources (apenas auto-captura permitida) ───
  let q = db.from("sources").select("*")
    .eq("is_active", true)
    .eq("blocked", false)
    .eq("allow_auto_capture", true)
    .order("priority", { ascending: false })
    .limit(limit_sources);
  if (source_id) {
    q = db.from("sources").select("*").eq("id", source_id).limit(1);
  }
  const { data: sources, error: srcErr } = await q;
  if (srcErr || !sources || sources.length === 0) {
    return new Response(JSON.stringify({
      error: "No eligible sources found",
      detail: srcErr?.message,
      hint: "Verifique allow_auto_capture=true, blocked=false, is_active=true",
    }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // ─── Cache de URLs e títulos normalizados (últimos 14 dias) ───
  const since = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString();
  const { data: recent } = await db
    .from("articles")
    .select("source_url, normalized_title, original_title, title")
    .gte("captured_at", since)
    .limit(2000);

  const urlSet = new Set<string>();
  const normTitleSet = new Set<string>();
  const titleList: string[] = [];
  for (const r of recent || []) {
    if (r.source_url) urlSet.add(r.source_url.toLowerCase());
    if (r.normalized_title) normTitleSet.add(r.normalized_title);
    const t = r.title || r.original_title;
    if (t) titleList.push(t);
  }

  const results: Array<Record<string, unknown>> = [];
  let globalInserted = 0;
  const freshnessCutoff = Date.now() - FRESHNESS_HOURS * 3600 * 1000;

  for (const source of sources) {
    if (globalInserted >= remaining_quota && !dry_run) break;

    const sourceResult: Record<string, unknown> = {
      source_id: source.id,
      source_name: source.name,
      feed_url: null,
      items_found: 0,
      inserted: 0,
      skipped_duplicates: 0,
      skipped_filters: 0,
      skipped_similarity: 0,
      skipped_freshness: 0,
      error: null as string | null,
    };

    try {
      let feedUrl: string | null = source.feed_url || null;
      if (!feedUrl) feedUrl = await discoverFeed(source.url);
      sourceResult.feed_url = feedUrl;
      if (!feedUrl) {
        sourceResult.error = "Feed não encontrado";
        results.push(sourceResult);
        continue;
      }

      const feedRes = await fetch(feedUrl, {
        headers: { "User-Agent": "BNewsBot/1.0" },
        signal: AbortSignal.timeout(15000),
      });
      if (!feedRes.ok) {
        sourceResult.error = `HTTP ${feedRes.status}`;
        results.push(sourceResult);
        continue;
      }

      const xml = await feedRes.text();
      let items = parseRss(xml);
      sourceResult.items_found = items.length;

      const perSourceCap = Math.min(
        source.max_items_per_run || 20,
        limit_items_per_source || 30
      );
      items = items.slice(0, perSourceCap);

      const includeKw: string[] = source.include_keywords || [];
      const excludeKw: string[] = source.exclude_keywords || [];
      const toInsert: Array<Record<string, unknown>> = [];

      for (const item of items) {
        if (!item.link || !item.title) {
          (sourceResult.skipped_filters as number)++;
          continue;
        }

        // 1) Frescura
        if (item.published) {
          const ts = Date.parse(item.published);
          if (!Number.isNaN(ts) && ts < freshnessCutoff) {
            (sourceResult.skipped_freshness as number)++;
            continue;
          }
        }

        const searchText = `${item.title} ${item.summary}`;

        // 2) Keywords
        if (includeKw.length > 0 && !matchesKeywords(searchText, includeKw)) {
          (sourceResult.skipped_filters as number)++;
          continue;
        }
        const excluded = excludedByKeywords(searchText, excludeKw);
        if (excluded) {
          (sourceResult.skipped_filters as number)++;
          continue;
        }

        // 3) Dedupe — Camada 1: URL
        const urlKey = item.link.toLowerCase();
        if (urlSet.has(urlKey)) {
          (sourceResult.skipped_duplicates as number)++;
          continue;
        }

        // 4) Dedupe — Camada 2: título normalizado
        const normTitle = normalizeTitle(item.title);
        if (normTitle && normTitleSet.has(normTitle)) {
          (sourceResult.skipped_duplicates as number)++;
          continue;
        }

        // 5) Dedupe — Camada 3: similaridade Jaccard título+lead
        const itemFingerprint = `${item.title} ${item.summary.slice(0, 200)}`;
        let isSimilar = false;
        for (const t of titleList) {
          if (jaccard(itemFingerprint, t) >= SIMILARITY_THRESHOLD) {
            isSimilar = true;
            break;
          }
        }
        if (isSimilar) {
          (sourceResult.skipped_similarity as number)++;
          continue;
        }

        // 6) Quota global
        if (
          !dry_run &&
          globalInserted + toInsert.length >= remaining_quota
        ) {
          await db.from("pipeline_logs").insert({
            node: "RSS_FETCH",
            level: "WARN",
            message: `Quota diária atingida durante captura (${captured_today + globalInserted + toInsert.length}/${MAX_CAPTURE_PER_DAY})`,
            source_id: source.id,
          });
          break;
        }

        // Aceitar
        urlSet.add(urlKey);
        if (normTitle) normTitleSet.add(normTitle);
        titleList.push(item.title);

        toInsert.push({
          source_id: source.id,
          source_name: source.name,
          source_url: item.link,
          source_type: "rss",
          ingestion_method: "auto",
          original_title: item.title,
          original_content: item.summary,
          captured_at: item.published
            ? new Date(item.published).toISOString()
            : new Date().toISOString(),
          status: "captured",
          category: item.categories?.[0] || source.categories?.[0] || null,
        });
      }

      if (!dry_run && toInsert.length > 0) {
        const { data: inserted } = await db
          .from("articles")
          .upsert(toInsert, { onConflict: "source_url", ignoreDuplicates: true })
          .select("id");
        const count = inserted?.length || 0;
        sourceResult.inserted = count;
        globalInserted += count;

        if (count > 0) {
          await db.rpc("increment_daily_capture", { _count: count });
          await db.from("sources")
            .update({
              last_fetch_at: new Date().toISOString(),
              articles_captured: (source.articles_captured || 0) + count,
            })
            .eq("id", source.id);
        }
      }

      await db.from("pipeline_logs").insert({
        node: "RSS_FETCH",
        level: "INFO",
        message: `${source.name}: ${sourceResult.inserted} ins, ${sourceResult.skipped_duplicates} dup, ${sourceResult.skipped_similarity} sim, ${sourceResult.skipped_filters} filt, ${sourceResult.skipped_freshness} velhos`,
        meta: { ...sourceResult },
        source_id: source.id,
      });
    } catch (err) {
      sourceResult.error = err instanceof Error ? err.message : String(err);
      await db.from("pipeline_logs").insert({
        node: "RSS_FETCH",
        level: "ERROR",
        message: `Erro em ${source.name}: ${sourceResult.error}`,
        meta: { source_id: source.id, error: sourceResult.error },
        source_id: source.id,
      });
    }
    results.push(sourceResult);
  }

  return new Response(JSON.stringify({
    dry_run,
    sources_processed: results.length,
    total_inserted: globalInserted,
    captured_today_after: captured_today + globalInserted,
    max_per_day: MAX_CAPTURE_PER_DAY,
    results,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
