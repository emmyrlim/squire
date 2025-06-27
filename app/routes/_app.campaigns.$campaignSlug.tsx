import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireAuth } from "@/shared/utils/auth.server";
import { CampaignPanel } from "~/modules/campaigns/components/campaign-panel";
import { SplitLayout } from "~/shared/components/split-layout";
import { KnowledgePanel } from "~/modules/detail-items/components/knowledge-panel";
import {
  useCampaignUserProfiles,
  UserProfileMap,
} from "~/modules/campaigns/hooks/use-campaign-user-profiles";

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

  // Fetch all campaigns for the user (for avatar panel)
  const { data: campaigns, error: campaignsError } = await supabase
    .from("campaigns")
    .select(
      `
      *,
      campaign_users!inner (
        role
      )
    `
    )
    .eq("campaign_users.user_id", user.id)
    .order("created_at", { ascending: false });

  if (campaignsError) {
    console.error("Error loading campaigns:", campaignsError);
    throw new Response("Failed to load campaigns", { status: 500 });
  }

  // Fetch sessions for this campaign
  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("*")
    .eq("campaign_id", campaign.id)
    .order("session_number", { ascending: false });

  if (error) {
    console.error("Error fetching sessions:", sessionsError);
    throw new Error("Failed to fetch sessions");
  }

  // Fetch all campaign users and their profiles
  const { data: campaignUsers } = await supabase
    .from("campaign_users")
    .select("user_id")
    .eq("campaign_id", campaign.id);

  const userIds = campaignUsers?.map((cu) => cu.user_id) ?? [];

  let userProfileMap = {};
  if (userIds.length > 0) {
    const { data: userProfiles } = await supabase
      .from("user_profiles")
      .select("id, display_name, avatar_url")
      .in("id", userIds);
    if (userProfiles) {
      userProfileMap = userProfiles.reduce((acc: UserProfileMap, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {});
    }
  }

  // Check if user is DM
  const isDM = campaign.campaign_users[0]?.role === "dm";

  return Response.json({
    campaign,
    campaigns,
    user,
    isDM,
    request,
    sessions,
    userProfiles: userProfileMap,
  });
}

export default function CampaignLayout() {
  const { campaign, campaigns, user, isDM, request, sessions, userProfiles } =
    useLoaderData<typeof loader>();

  const { loading, setUserProfiles } = useCampaignUserProfiles();
  setUserProfiles(userProfiles);

  console.log("sessions", sessions);

  return (
    <main className="h-screen bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <SplitLayout
        campaignPanel={
          <CampaignPanel
            campaigns={campaigns}
            currentCampaignId={campaign.id}
          />
        }
        leftPanel={
          loading ? (
            <div>Loading...</div>
          ) : (
            <Outlet
              context={{
                campaign,
                sessions,
                user,
                isDM,
                request,
                userProfiles,
              }}
            />
          )
        }
        rightPanel={<KnowledgePanel campaignId={campaign.id} />}
      />
    </main>
  );
}
