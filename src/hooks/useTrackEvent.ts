import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAnonymousId } from './useAnonymousId';

export type TrackEventType =
  | 'impression'
  | 'view'
  | 'read_complete'
  | 'like'
  | 'save'
  | 'share'
  | 'ai_action';

export interface TrackPayload {
  articleId?: string | null;
  category?: string | null;
  metadata?: Record<string, unknown>;
}

interface QueuedEvent {
  anonymous_id: string;
  session_id: string | null;
  event_type: TrackEventType;
  article_id: string | null;
  category: string | null;
  metadata: Record<string, unknown>;
}

const FLUSH_INTERVAL_MS = 4000;
const FLUSH_BATCH_SIZE = 5;
const DEDUPE_WINDOW_MS = 30_000;

// Module-level singletons so tracking works across components
const queue: QueuedEvent[] = [];
const dedupeKeys = new Map<string, number>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;

function dedupeKey(e: QueuedEvent) {
  return `${e.event_type}:${e.article_id ?? ''}:${e.category ?? ''}`;
}

function shouldDedupe(e: QueuedEvent): boolean {
  if (e.event_type !== 'view' && e.event_type !== 'read_complete' && e.event_type !== 'impression') {
    return false;
  }
  const key = dedupeKey(e);
  const now = Date.now();
  const last = dedupeKeys.get(key);
  if (last && now - last < DEDUPE_WINDOW_MS) return true;
  dedupeKeys.set(key, now);
  // Garbage collect old keys
  if (dedupeKeys.size > 200) {
    for (const [k, t] of dedupeKeys) {
      if (now - t > DEDUPE_WINDOW_MS * 4) dedupeKeys.delete(k);
    }
  }
  return false;
}

async function flush() {
  if (flushing || queue.length === 0) return;
  flushing = true;
  const batch = queue.splice(0, queue.length);
  try {
    const { error } = await supabase.from('user_events').insert(batch as any);
    if (error) {
      // best-effort: drop on failure to avoid runaway memory
      console.warn('[useTrackEvent] insert failed', error.message);
    }
  } catch (e) {
    console.warn('[useTrackEvent] flush error', e);
  } finally {
    flushing = false;
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, FLUSH_INTERVAL_MS);
}

function enqueue(e: QueuedEvent) {
  if (!e.anonymous_id) return;
  if (shouldDedupe(e)) return;
  queue.push(e);
  if (queue.length >= FLUSH_BATCH_SIZE) {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    void flush();
  } else {
    scheduleFlush();
  }
}

// Flush on tab hide / unload
if (typeof window !== 'undefined') {
  const handler = () => {
    if (queue.length > 0) void flush();
  };
  window.addEventListener('visibilitychange', handler);
  window.addEventListener('pagehide', handler);
}

export function useTrackEvent() {
  const { anonymousId, sessionId } = useAnonymousId();
  const aidRef = useRef(anonymousId);
  const sidRef = useRef(sessionId);

  useEffect(() => {
    aidRef.current = anonymousId;
    sidRef.current = sessionId;
  }, [anonymousId, sessionId]);

  const track = useCallback((eventType: TrackEventType, payload: TrackPayload = {}) => {
    enqueue({
      anonymous_id: aidRef.current,
      session_id: sidRef.current || null,
      event_type: eventType,
      article_id: payload.articleId ?? null,
      category: payload.category ?? null,
      metadata: payload.metadata ?? {},
    });
  }, []);

  return { track };
}
