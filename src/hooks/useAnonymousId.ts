import { useEffect, useState } from 'react';

const STORAGE_KEY = 'bnews_aid';
const SESSION_KEY = 'bnews_sid';

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback
  return 'aid-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  // 2 years
  const maxAge = 60 * 60 * 24 * 365 * 2;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function getOrCreateAnonymousId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem(STORAGE_KEY) || readCookie(STORAGE_KEY);
    if (!id) {
      id = generateId();
    }
    // Ensure both stores have it (sync)
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* storage blocked */
    }
    writeCookie(STORAGE_KEY, id);
    return id;
  } catch {
    return generateId();
  }
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = generateId();
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return generateId();
  }
}

/**
 * Returns a stable anonymous identifier persisted in localStorage + cookie,
 * plus a per-tab session id. Ready to be replaced by auth.uid() later
 * without changing the user_events table shape.
 */
export function useAnonymousId() {
  const [anonymousId, setAnonymousId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    setAnonymousId(getOrCreateAnonymousId());
    setSessionId(getOrCreateSessionId());
  }, []);

  return { anonymousId, sessionId };
}
