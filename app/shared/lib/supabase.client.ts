import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    window.ENV.SUPABASE_URL,
    window.ENV.SUPABASE_ANON_KEY
  );
}
