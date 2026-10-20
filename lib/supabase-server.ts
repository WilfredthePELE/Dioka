import { createClient } from "@supabase/supabase-js";
import { HttpError } from "@/lib/http";
export function hasSupabase() { return Boolean((process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) && process.env.SUPABASE_SERVICE_ROLE_KEY); }
export function supabaseServer() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new HttpError(503, "Connect the store's Supabase project to enable file uploads.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
