import { useOutletContext } from "@remix-run/react";
import { Campaign } from "~/modules/campaigns/types";
import { Quest } from "~/modules/quests/types";
import { useState } from "react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { requireAuth } from "@/shared/utils/auth.server";
import { QuestList } from "~/modules/quests/components/quest-list";
import { QuestModal } from "~/modules/quests/components/quest-modal";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = await requireAuth(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create-quest") {
    const title = formData.get("title");
    const description = formData.get("description");
    const questType = formData.get("questType");
    const campaignSlug = params.campaignSlug;

    if (!title || !campaignSlug) {
      return Response.json(
        { error: "Title and campaign slug are required" },
        { status: 400 }
      );
    }

    // Get campaign ID from slug
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id")
      .eq("slug", campaignSlug)
      .single();

    if (campaignError || !campaign) {
      return Response.json({ error: "Campaign not found" }, { status: 404 });
    }

    const { error } = await supabase.from("quests").insert({
      title,
      description,
      quest_type: questType,
      campaign_id: campaign.id,
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
        campaignSlug={campaign.slug}
      />
    </>
  );
}
