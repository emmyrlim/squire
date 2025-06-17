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

  // First get the campaign
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, name, slug")
    .eq("slug", campaignSlug)
    .single();

  if (campaignError || !campaign) {
    throw new Response("Campaign not found", { status: 404 });
  }

  // Then verify the user is a member of this campaign
  const { data: membership, error: membershipError } = await supabase
    .from("campaign_users")
    .select("role")
    .eq("campaign_id", campaign.id)
    .eq("user_id", user.id)
    .single();

  if (membershipError || !membership) {
    throw new Response("You don't have access to this campaign", {
      status: 403,
    });
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
