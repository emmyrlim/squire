import { type LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { requireAuth } from "@/shared/utils/auth.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
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

  return Response.json({ campaign });
}

export default function BestiaryLayout() {
  const { campaign } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full">
      <div className="flex-1 space-y-4 p-8">
        <Outlet context={{ campaign }} />
      </div>
    </div>
  );
}
