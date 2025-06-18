import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireAuth } from "@/shared/utils/auth.server";
import { NPCDetails } from "~/modules/npcs/components/npc-details";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, user } = await requireAuth(request);
  const { campaignSlug, npcSlug } = params;

  const { data: npc, error } = await supabase
    .from("npcs")
    .select(
      `
      *,
      campaigns!inner (
        id,
        slug
      )
    `
    )
    .eq("slug", npcSlug)
    .eq("campaigns.slug", campaignSlug)
    .eq("campaigns.created_by", user.id) // Security check
    .single();

  if (error) {
    console.error("Error:", error);
    throw new Response(`Failed to load NPC: ${error.message}`, {
      status: 500,
    });
  }

  if (!npc) {
    throw new Response("NPC not found", { status: 404 });
  }

  return { npc };
}

export default function NPCRoute() {
  const { npc } = useLoaderData<typeof loader>();
  return <NPCDetails npc={npc} />;
}
