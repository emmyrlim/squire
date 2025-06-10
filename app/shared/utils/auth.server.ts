import { redirect } from "@remix-run/node";
import { createSupabaseServerClient } from "@/shared/lib/supabase.server";

export async function requireAuth(request: Request) {
  const { supabase } = createSupabaseServerClient(request);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw redirect("/login");
  }

  return { session, supabase };
}

export async function getOptionalAuth(request: Request) {
  const { supabase } = createSupabaseServerClient(request);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return { session, supabase };
}
