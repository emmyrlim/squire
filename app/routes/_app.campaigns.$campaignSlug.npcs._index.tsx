import { NPCList } from "~/modules/npcs/components/NPCList";
import { useOutletContext } from "@remix-run/react";
import { Campaign } from "~/modules/campaigns/types";
import { NPC } from "~/modules/npcs/types";
import { useState } from "react";
import { NPCModal } from "~/modules/npcs/components/NPCModal";
import type { ActionFunctionArgs } from "@remix-run/node";
import { requireAuth } from "@/shared/utils/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = await requireAuth(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create-npc") {
    const name = formData.get("name");
    const description = formData.get("description");
    const race = formData.get("race");
    const occupation = formData.get("occupation");
    const campaignId = formData.get("campaignId");

    if (!name || !campaignId) {
      return Response.json(
        { error: "Name and campaign ID are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("npcs").insert({
      name,
      description,
      race,
      occupation,
      campaign_id: campaignId,
    });

    if (error) {
      console.error("Error creating NPC:", error);
      return Response.json({ error: "Failed to create NPC" }, { status: 500 });
    }

    return Response.json({ success: "NPC created successfully" });
  }

  return Response.json({ error: "Invalid intent" }, { status: 400 });
}

export default function NPCsOverview() {
  const { npcs, campaign } = useOutletContext<{
    npcs: NPC[];
    campaign: Campaign;
  }>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (isOpen: boolean) => {
    setIsModalOpen(isOpen);
  };

  return (
    <>
      <NPCList
        npcs={npcs}
        onOpen={handleOpenModal}
        campaignSlug={campaign.slug}
      />
      <NPCModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={campaign}
      />
    </>
  );
}
