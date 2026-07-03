import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

export const TENANT_NAME: string = import.meta.env.VITE_TENANT_NAME || "";

export const isSupabaseConfigured: boolean =
  !!SUPABASE_URL && !!SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

/**
 * Lazy Supabase client. Public pages load even when env vars are absent;
 * any code that actually calls supabase.* will throw a clear error so the
 * UI can surface "Registration is not configured yet" instead of a blank
 * white screen at boot.
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_client) {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error(
          "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local.",
        );
      }
      _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      });
    }
    return (_client as unknown as Record<string | symbol, unknown>)[
      prop as string
    ];
  },
});
