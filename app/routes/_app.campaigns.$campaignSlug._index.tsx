import { useOutletContext, useActionData } from "@remix-run/react";
import type { Campaign } from "~/modules/campaigns/types";
import { InviteCodeManager } from "~/modules/campaigns/components/invite-code-manager";
import type { ActionFunctionArgs } from "@remix-run/node";
import { requireAuth } from "@/shared/utils/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = await requireAuth(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "regenerate-invite-code") {
    const campaignId = formData.get("campaign_id");

    if (!campaignId) {
      return Response.json(
        { error: "Campaign ID is required", success: null },
        { status: 400 }
      );
    }

    // Regenerate invite code
    const { data, error } = await supabase.rpc(
      "regenerate_campaign_invite_code",
      {
        campaign_id: campaignId,
      }
    );

    if (error) {
      console.error("Error regenerating invite code:", error);
      return Response.json(
        { error: "Failed to regenerate invite code", success: null },
        { status: 500 }
      );
    }

    return Response.json({
      success: "Invite code regenerated successfully",
      error: null,
      inviteCode: data[0].invite_code,
    });
  }

  return Response.json(
    { error: "Invalid action", success: null },
    { status: 400 }
  );
}

export default function CampaignOverview() {
  const { campaign, isDM } = useOutletContext<{
    campaign: Campaign;
    isDM: boolean;
  }>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {campaign.name}
        </h1>

        {campaign.description && (
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {campaign.description}
          </p>
        )}

        {campaign.setting && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Setting
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {campaign.setting}
            </p>
          </div>
        )}
      </div>

      <InviteCodeManager
        campaignId={campaign.id}
        inviteCode={actionData?.inviteCode || campaign.invite_code}
        isDM={isDM}
      />
    </div>
  );
}
