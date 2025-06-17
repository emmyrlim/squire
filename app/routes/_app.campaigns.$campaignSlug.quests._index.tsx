import { useOutletContext } from "@remix-run/react";
import { Campaign } from "~/modules/campaigns/types";
import { Quest } from "~/modules/quests/types";
import { useState } from "react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { requireAuth } from "@/shared/utils/auth.server";
import { QuestList } from "~/modules/quests/components/QuestList";
import { QuestModal } from "~/modules/quests/components/QuestModal";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = await requireAuth(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create-quest") {
    const title = formData.get("title");
    const description = formData.get("description");
    const questType = formData.get("questType");
    const campaignId = params.campaignId;

    if (!title || !campaignId) {
      return Response.json(
        { error: "Title and campaign ID are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("quests").insert({
      title,
      description,
      quest_type: questType,
      campaign_id: campaignId,
      status: "active",
    });

    if (error) {
      console.error("Error creating quest:", error);
      return Response.json(
        { error: "Failed to create quest" },
        { status: 500 }
      );
    }

    return Response.json({ success: "Quest created successfully" });
  }

  return Response.json({ error: "Invalid intent" }, { status: 400 });
}

export default function QuestsOverview() {
  const { quests, campaign } = useOutletContext<{
    quests: Quest[];
    campaign: Campaign;
  }>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <QuestList
        quests={quests}
        campaignSlug={campaign.slug}
        onOpen={setIsModalOpen}
      />
      <QuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaignId={campaign.id}
      />
    </>
  );
}
