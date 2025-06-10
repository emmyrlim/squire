import { useLoaderData, Link } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "@/shared/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = await requireAuth(request);

  const { data: campaigns, error } = await supabase.from("campaigns").select(`
      *,
      campaign_users!inner(role),
      sessions(id)
    `);

  if (error) {
    throw new Response("Failed to load campaigns", { status: 500 });
  }

  return json({ campaigns });
}

export default function CampaignIndex() {
  const { campaigns } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 font-fantasy">
            Your Campaigns
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Select a campaign to continue your adventure
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/campaigns/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
          >
            Create Campaign
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <Link
            key={campaign.id}
            to={`/campaigns/${campaign.id}`}
            className="block bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {campaign.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {campaign.description}
                  </p>
                  <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Sessions: {campaign.sessions?.length || 0}</span>
                    <span>Role: {campaign.campaign_users[0]?.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No campaigns
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first campaign.
          </p>
          <div className="mt-6">
            <Link
              to="/campaigns/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Create Campaign
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
