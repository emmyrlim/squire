import { redirect } from "@remix-run/node";
import { createClient } from "@/shared/lib/supabase.server";

export async function requireAuth(request: Request) {
  const { supabase } = createClient(request);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !session) {
    throw redirect("/login");
  }

  return { session, supabase, user };
}

export async function getOptionalAuth(request: Request) {
  const { supabase } = createClient(request);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return { session, supabase };
}
