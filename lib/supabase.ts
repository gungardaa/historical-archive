import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ponytail: anon key only, lazy singleton, null when unconfigured — service-role key must never enter this codebase.
let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && key ? createClient(url, key) : null;
  return client;
}

export function hasSupabase(): boolean {
  return getSupabase() !== null;
}
