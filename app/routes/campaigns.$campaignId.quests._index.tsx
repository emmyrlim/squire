import { useState } from "react";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { QuestList } from "~/modules/quests/components/QuestList";
import { QuestModal } from "~/modules/quests/components/QuestModal";
import { requireAuth } from "@/shared/utils/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = await requireAuth(request);
  const campaignId = params.campaignId;

  if (!campaignId) {
    throw new Response("Campaign ID is required", { status: 400 });
  }

  const { data: quests, error } = await supabase
    .from("quests")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching quests:", error);
    throw new Response("Failed to fetch quests", { status: 500 });
  }

  return json({ quests });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = await requireAuth(request);
  const campaignId = params.campaignId;

  if (!campaignId) {
    throw new Response("Campaign ID is required", { status: 400 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create-quest") {
    const title = formData.get("title");
    const description = formData.get("description");
    const questType = formData.get("questType");

    if (typeof title !== "string" || title.length === 0) {
      return json({ error: "Title is required" }, { status: 400 });
    }

    if (
      typeof questType !== "string" ||
      !["main", "side", "personal"].includes(questType)
    ) {
      return json({ error: "Invalid quest type" }, { status: 400 });
    }

    const { error } = await supabase.from("quests").insert({
      title,
      description: typeof description === "string" ? description : null,
      quest_type: questType,
      campaign_id: campaignId,
    });

    if (error) {
      console.error("Error creating quest:", error);
      return json({ error: "Failed to create quest" }, { status: 500 });
    }

    return json({ success: true });
  }

  return json({ error: "Invalid intent" }, { status: 400 });
}

export default function QuestsIndex() {
  const { quests } = useLoaderData<typeof loader>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const params = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quests
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Add Quest
          </button>
        </div>

        <QuestList quests={quests} campaignId={params.campaignId!} />
      </div>

      <QuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaignId={params.campaignId!}
      />
    </div>
  );
}
