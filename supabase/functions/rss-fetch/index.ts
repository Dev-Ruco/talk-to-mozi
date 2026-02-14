import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

interface PreviewItem extends FeedItem {
  accepted: boolean;
  reason?: string;
}

// ─── XML helpers (no external deps) ───

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
  // RSS 2.0
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
      summary: stripHtml(summary).slice(0, 1000),
      categories: cats,
    });
  }
  // Atom
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
      const cats = (
        raw.match(/<category[^>]*>/gi) || []
      ).map((c) => extractAttr(c, "category", "term").toLowerCase());
      items.push({
        title: stripHtml(title),
        link: link.trim(),
        published,
        summary: stripHtml(summary).slice(0, 1000),
        categories: cats,
      });
    }
  }
  return items;
}

// ─── Feed discovery ───

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
        ct.includes("xml") ||
        ct.includes("rss") ||
        ct.includes("atom") ||
        text.trimStart().startsWith("<?xml") ||
        text.includes("<rss") ||
        text.includes("<feed")
      ) {
        return url;
      }
    } catch {
      continue;
    }
  }
  return null;
}

// ─── Keyword filter ───

function matchesKeywords(
  text: string,
  keywords: string[]
): boolean {
  if (!keywords || keywords.length === 0) return true;
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

function excludedByKeywords(
  text: string,
  keywords: string[]
): string | null {
  if (!keywords || keywords.length === 0) return null;
  const lower = text.toLowerCase();
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) return kw;
  }
  return null;
}

// ─── Main handler ───

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const db = createClient(supabaseUrl, serviceKey);

  let body: FetchBody = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }

  const {
    source_id,
    limit_sources = 20,
    limit_items_per_source = 30,
    dry_run = false,
  } = body;

  // 1) Fetch sources
  let query = db
    .from("sources")
    .select("*")
    .eq("is_active", true)
    .limit(limit_sources);
  if (source_id) {
    query = db.from("sources").select("*").eq("id", source_id).limit(1);
  }
  const { data: sources, error: srcErr } = await query;
  if (srcErr || !sources || sources.length === 0) {
    return new Response(
      JSON.stringify({ error: "No sources found", detail: srcErr?.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // 2) Get existing source_urls for dedup
  const { data: existingUrls } = await db
    .from("articles")
    .select("source_url")
    .not("source_url", "is", null);
  const urlSet = new Set((existingUrls || []).map((r: any) => r.source_url));

  const results: any[] = [];

  for (const source of sources) {
    const sourceResult: any = {
      source_id: source.id,
      source_name: source.name,
      feed_url: null,
      items_found: 0,
      inserted: 0,
      skipped_duplicates: 0,
      skipped_filters: 0,
      error: null,
      preview: [] as PreviewItem[],
    };

    try {
      // Resolve feed
      let feedUrl = source.feed_url || null;
      if (!feedUrl) {
        feedUrl = await discoverFeed(source.url);
      }
      sourceResult.feed_url = feedUrl;

      if (!feedUrl) {
        sourceResult.error = "No RSS feed found";
        await db.from("pipeline_logs").insert({
          node: "RSS_FETCH",
          level: "ERROR",
          message: `Feed não encontrado para ${source.name}`,
          meta: { source_id: source.id, source_name: source.name, base_url: source.url },
          source_id: source.id,
        });
        results.push(sourceResult);
        continue;
      }

      // Fetch feed
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

      // Limit
      items = items.slice(0, limit_items_per_source);

      const includeKw: string[] = source.include_keywords || [];
      const excludeKw: string[] = source.exclude_keywords || [];

      const toInsert: any[] = [];

      for (const item of items) {
        const preview: PreviewItem = { ...item, accepted: true };
        const searchText = `${item.title} ${item.summary}`;

        // Filter: include keywords
        if (includeKw.length > 0 && !matchesKeywords(searchText, includeKw)) {
          preview.accepted = false;
          preview.reason = `Nenhuma keyword de inclusão encontrada`;
          sourceResult.skipped_filters++;
          sourceResult.preview.push(preview);
          continue;
        }

        // Filter: exclude keywords
        const excluded = excludedByKeywords(searchText, excludeKw);
        if (excluded) {
          preview.accepted = false;
          preview.reason = `Excluído por keyword: "${excluded}"`;
          sourceResult.skipped_filters++;
          sourceResult.preview.push(preview);
          continue;
        }

        // Dedup
        if (!item.link) {
          preview.accepted = false;
          preview.reason = "Sem link";
          sourceResult.skipped_filters++;
          sourceResult.preview.push(preview);
          continue;
        }
        if (urlSet.has(item.link)) {
          preview.accepted = false;
          preview.reason = "Duplicado";
          sourceResult.skipped_duplicates++;
          sourceResult.preview.push(preview);
          continue;
        }

        sourceResult.preview.push(preview);
        urlSet.add(item.link); // prevent intra-batch dupes

        if (!dry_run) {
          toInsert.push({
            source_id: source.id,
            source_name: source.name,
            source_url: item.link,
            original_title: item.title,
            original_content: item.summary,
            captured_at: item.published ? new Date(item.published).toISOString() : new Date().toISOString(),
            status: "captured",
            category: item.categories?.[0] || (source.categories?.[0] || null),
          });
        }
      }

      // Insert
      if (!dry_run && toInsert.length > 0) {
        const { data: inserted, error: insErr } = await db
          .from("articles")
          .upsert(toInsert, { onConflict: "source_url", ignoreDuplicates: true })
          .select("id");

        const count = inserted?.length || 0;
        sourceResult.inserted = count;

        // Update source stats
        await db
          .from("sources")
          .update({
            last_fetch_at: new Date().toISOString(),
            articles_captured: (source.articles_captured || 0) + count,
          })
          .eq("id", source.id);
      } else if (dry_run) {
        sourceResult.inserted = sourceResult.preview.filter((p: PreviewItem) => p.accepted).length;
      }

      // Log
      if (!dry_run) {
        await db.from("pipeline_logs").insert({
          node: "RSS_FETCH",
          level: "INFO",
          message: `${source.name}: ${sourceResult.inserted} inseridos, ${sourceResult.skipped_duplicates} duplicados, ${sourceResult.skipped_filters} filtrados`,
          meta: {
            source_id: source.id,
            source_name: source.name,
            feed_url: feedUrl,
            inserted: sourceResult.inserted,
            skipped_duplicates: sourceResult.skipped_duplicates,
            skipped_filters: sourceResult.skipped_filters,
            items_found: sourceResult.items_found,
          },
          source_id: source.id,
        });
      }
    } catch (err: any) {
      sourceResult.error = err.message;
      await db.from("pipeline_logs").insert({
        node: "RSS_FETCH",
        level: "ERROR",
        message: `Erro ao processar ${source.name}: ${err.message}`,
        meta: { source_id: source.id, error: err.message },
        source_id: source.id,
      });
    }

    results.push(sourceResult);
  }

  const totalInserted = results.reduce((s, r) => s + (r.inserted || 0), 0);
  const totalDuplicates = results.reduce((s, r) => s + (r.skipped_duplicates || 0), 0);

  return new Response(
    JSON.stringify({
      dry_run,
      sources_processed: results.length,
      total_inserted: totalInserted,
      total_duplicates: totalDuplicates,
      results,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
