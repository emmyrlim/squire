import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BestiaryList } from "@/modules/bestiary/components/BestiaryList";
import { requireAuth } from "@/shared/utils/auth.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { supabase } = await requireAuth(request);
  const campaignSlug = params.campaignSlug;

  if (!campaignSlug) {
    throw new Response("Campaign Slug is required", { status: 400 });
  }

  // Get campaign with user validation
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id")
    .eq("slug", campaignSlug)
    .single();

  if (campaignError || !campaign) {
    throw new Response("Campaign not found", { status: 404 });
  }

  // Get monsters for the campaign
  const { data: monsters, error: monstersError } = await supabase
    .from("monsters")
    .select("*")
    .eq("campaign_id", campaign.id)
    .order("name");

  if (monstersError) {
    throw new Response("Error loading monsters", { status: 500 });
  }

  return json({ monsters, campaignSlug });
}

export default function BestiaryIndexRoute() {
  const { monsters, campaignSlug } = useLoaderData<typeof loader>();

  return <BestiaryList monsters={monsters} campaignSlug={campaignSlug} />;
}
