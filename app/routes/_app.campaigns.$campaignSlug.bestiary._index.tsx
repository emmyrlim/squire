import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BestiaryList } from "~/modules/bestiary/components/bestiary-list";
import { BestiaryModal } from "~/modules/bestiary/components/bestiary-modal";
import { requireAuth } from "@/shared/utils/auth.server";
import { useState } from "react";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { supabase, user } = await requireAuth(request);
  const campaignSlug = params.campaignSlug;

  if (!campaignSlug) {
    throw new Response("Campaign Slug is required", { status: 400 });
  }

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, name, slug")
    .eq("slug", campaignSlug)
    .eq("created_by", user.id)
    .single();

  if (campaignError || !campaign) {
    throw new Response("Campaign not found", { status: 404 });
  }

  const { data: monsters, error: monstersError } = await supabase
    .from("monsters")
    .select("*")
    .eq("campaign_id", campaign.id)
    .order("name");

  if (monstersError) {
    throw new Response("Failed to load monsters", { status: 500 });
  }

  return Response.json({ campaign, monsters });
}

export default function BestiaryIndex() {
  const { campaign, monsters } = useLoaderData<typeof loader>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bestiary</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Monster
        </button>
      </div>
      <BestiaryList
        monsters={monsters}
        campaignSlug={campaign.slug}
        onOpen={() => setIsModalOpen(true)}
      />
      <BestiaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={campaign}
      />
    </div>
  );
}
