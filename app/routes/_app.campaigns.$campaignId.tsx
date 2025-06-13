import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireAuth } from "@/shared/utils/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = await requireAuth(request);
  const campaignId = params.campaignId;

  if (!campaignId) {
    throw new Response("Campaign ID is required", { status: 400 });
  }

  // Get campaign
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (error) {
    console.error("Error:", error);
    throw new Response(`Failed to load campaign: ${error.message}`, {
      status: 500,
    });
  }

  if (!campaign) {
    throw new Response("Campaign not found", { status: 404 });
  }

  return { campaign };
}

export default function CampaignPage() {
  const { campaign } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
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
    </div>
  );
}
