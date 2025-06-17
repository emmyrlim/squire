import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAuth } from "@/shared/utils/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = await requireAuth(request);
  const campaignId = params.campaignId;
  const questId = params.questId;

  if (!campaignId || !questId) {
    throw new Response("Campaign ID and Quest ID are required", {
      status: 400,
    });
  }

  const { data: quest, error } = await supabase
    .from("quests")
    .select("*")
    .eq("id", questId)
    .eq("campaign_id", campaignId)
    .single();

  if (error) {
    console.error("Error fetching quest:", error);
    throw new Response("Failed to fetch quest", { status: 500 });
  }

  if (!quest) {
    throw new Response("Quest not found", { status: 404 });
  }

  return json({ quest });
}

export default function QuestDetail() {
  const { quest } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {quest.title}
          </h1>
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              {quest.quest_type}
            </span>
          </div>
        </div>

        {quest.description && (
          <div className="prose dark:prose-invert max-w-none">
            <p>{quest.description}</p>
          </div>
        )}

        {/* Add more quest details here as needed */}
      </div>
    </div>
  );
}
