import { useLoaderData, useOutletContext, Outlet } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireAuth } from "@/shared/utils/auth.server";
import { Campaign } from "~/modules/campaigns/types";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, user } = await requireAuth(request);
  const campaignSlug = params.campaignSlug;

  if (!campaignSlug) {
    throw new Response("Campaign Slug is required", { status: 400 });
  }

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, name, slug") // Only select what we need
    .eq("slug", campaignSlug)
    .eq("created_by", user.id) // 🔒 Security: only user's campaigns
    .single();

  if (campaignError || !campaign) {
    throw new Response("Campaign not found", { status: 404 });
  }

  const { data: npcs, error: npcsError } = await supabase
    .from("npcs")
    .select("*")
    .eq("campaign_id", campaign.id)
    .order("name");

  if (npcsError) {
    throw new Response("Failed to load NPCs", { status: 500 });
  }

  return Response.json({ npcs });
}

export default function NPCsPage() {
  const { npcs } = useLoaderData<typeof loader>();
  const { campaign } = useOutletContext<{ campaign: Campaign }>();

  return (
    <div className="flex-1 overflow-auto">
      <Outlet context={{ npcs, campaign }} />
    </div>
  );
}
