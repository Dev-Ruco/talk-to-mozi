/**
 * Helper to call Edge Functions deployed on Lovable Cloud (kwwz...)
 * while the Supabase client points to the external project (cmxh...).
 */
export async function invokeEdgeFunction<T = any>(
  name: string,
  body?: Record<string, unknown>
): Promise<{ data: T | null; error: string | null }> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
      return { data: null, error: data?.error || `HTTP ${res.status}` };
    }
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}
