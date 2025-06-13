import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createClient } from "@/shared/lib/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = createClient(request);
  await supabase.auth.signOut();
  return redirect("/login", { headers });
}
