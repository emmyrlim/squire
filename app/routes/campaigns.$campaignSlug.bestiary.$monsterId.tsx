import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { MonsterDetail } from "@/modules/bestiary/components/MonsterDetail";
import { requireAuth } from "@/shared/utils/auth.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { supabase, user } = await requireAuth(request);
  const campaignSlug = params.campaignSlug;
  const monsterId = params.monsterId;

  if (!campaignSlug || !monsterId) {
    throw new Response("Campaign Slug and Monster ID are required", {
      status: 400,
    });
  }

  // Get campaign with user validation
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id")
    .eq("slug", campaignSlug)
    .eq("created_by", user.id)
    .single();

  if (campaignError || !campaign) {
    throw new Response("Campaign not found", { status: 404 });
  }

  // Get monster with campaign validation
  const { data: monster, error: monsterError } = await supabase
    .from("monsters")
    .select("*")
    .eq("id", monsterId)
    .eq("campaign_id", campaign.id)
    .single();

  if (monsterError || !monster) {
    throw new Response("Monster not found", { status: 404 });
  }

  return json({ monster, campaignSlug });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { user, supabase } = await requireAuth(request);
  const campaignSlug = params.campaignSlug;
  const monsterId = params.monsterId;

  if (!campaignSlug || !monsterId) {
    throw new Response("Campaign Slug and Monster ID are required", {
      status: 400,
    });
  }

  // Get campaign with user validation
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id")
    .eq("slug", campaignSlug)
    .eq("created_by", user.id)
    .single();

  if (campaignError || !campaign) {
    throw new Response("Campaign not found", { status: 404 });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const creature_type = formData.get("creature_type") as string;
  const armor_class = parseInt(formData.get("armor_class") as string);
  const hit_points = formData.get("hit_points") as string;
  const speed = formData.get("speed") as string;
  const challenge_rating = formData.get("challenge_rating") as string;
  const description = formData.get("description") as string;
  const attacks_observed = formData.get("attacks_observed") as string;
  const special_abilities = formData.get("special_abilities") as string;
  const notes = formData.get("notes") as string;

  const { error: updateError } = await supabase
    .from("monsters")
    .update({
      name,
      creature_type,
      armor_class,
      hit_points,
      speed,
      challenge_rating,
      description,
      attacks_observed,
      special_abilities,
      notes,
    })
    .eq("id", monsterId)
    .eq("campaign_id", campaign.id);

  if (updateError) {
    throw new Response("Error updating monster", { status: 500 });
  }

  return redirect(`/campaigns/${campaignSlug}/bestiary`);
}

export default function BestiaryDetailRoute() {
  const { monster, campaignSlug } = useLoaderData<typeof loader>();

  return <MonsterDetail monster={monster} campaignSlug={campaignSlug} />;
}
