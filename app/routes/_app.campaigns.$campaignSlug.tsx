import { useLoaderData, Outlet } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireAuth } from "@/shared/utils/auth.server";
import { Sidebar } from "~/modules/campaigns/components/sidebar";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, user } = await requireAuth(request);
  const campaignSlug = params.campaignSlug;

  if (!campaignSlug) {
    throw new Response("Campaign Slug is required", { status: 400 });
  }

  // Get campaign with user's role
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select(
      `
      *,
      campaign_users!inner (
        role
      )
    `
    )
    .eq("slug", campaignSlug)
    .eq("campaign_users.user_id", user.id)
    .single();

  if (error) {
    console.error("Error:", error);
    throw new Response("Campaign not found", { status: 404 });
  }

  if (!campaign) {
    throw new Response("Campaign not found", { status: 404 });
  }

  // Check if user is DM
  const isDM = campaign.campaign_users[0]?.role === "dm";

  return { campaign, isDM };
}

export default function CampaignLayout() {
  const { campaign, isDM } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar campaignSlug={campaign.slug} />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet context={{ campaign, isDM }} />
      </main>
    </div>
  );
}
