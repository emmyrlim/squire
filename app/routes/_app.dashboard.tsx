import { useLoaderData, useActionData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireAuth } from "@/shared/utils/auth.server";
import { CampaignList } from "~/modules/campaigns/components/CampaignList";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { CharacterList } from "@/modules/characters/components/CharacterList";

// Alternative: If you want to handle the response differently
export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, user } = await requireAuth(request);

  try {
    // Get both profile and campaigns
    const [profileResponse, campaignsResponse, charactersResponse] =
      await Promise.all([
        supabase.rpc("get_current_user_profile"),
        supabase.rpc("get_user_campaigns_with_details"),
        supabase.rpc("get_user_characters_with_campaigns"),
      ]);

    if (profileResponse.error) {
      throw new Error(`Profile error: ${profileResponse.error.message}`);
    }

    if (campaignsResponse.error) {
      throw new Error(`Campaigns error: ${campaignsResponse.error.message}`);
    }

    if (charactersResponse.error) {
      throw new Error(`Characters error: ${charactersResponse.error.message}`);
    }

    const profile = profileResponse.data?.[0];
    const campaigns = campaignsResponse.data || [];
    const characters = charactersResponse.data || [];

    return Response.json({
      campaigns,
      user,
      profile,
      characters,
      error: null,
    });
  } catch (error) {
    console.error("Loader error:", error);

    return Response.json({
      campaigns: [],
      user,
      profile: null,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Action: Create a new campaign
export async function action({ request }: ActionFunctionArgs) {
  const { supabase, user } = await requireAuth(request);

  const formData = await request.formData();
  const intent = String(formData.get("intent"));

  // Get user profile (id matches auth.users.id directly)
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id, display_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return Response.json(
      { error: "User profile not found", success: null },
      { status: 400 }
    );
  }

  if (intent === "create-campaign") {
    const name = String(formData.get("name")).trim();
    const description = String(formData.get("description")).trim();

    // Validation
    if (!name) {
      return Response.json(
        { error: "Campaign name is required", success: null },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return Response.json(
        {
          error: "Campaign name must be less than 100 characters",
          success: null,
        },
        { status: 400 }
      );
    }

    // Create the campaign
    const { data: newCampaign, error: createError } = await supabase.rpc(
      "create_campaign_with_dm",
      {
        campaign_name: name,
        campaign_description: description || null,
      }
    );

    if (createError) {
      console.error("Error creating campaign:", createError);
      return Response.json(
        {
          error: "Failed to create campaign. Please try again.",
          success: null,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: "Campaign created successfully!",
      error: null,
      campaign: newCampaign,
    });
  }

  if (intent === "create-character") {
    const name = String(formData.get("name")).trim();
    const description = String(formData.get("description")).trim();
    const characterClass = String(formData.get("class")).trim();
    const level = parseInt(String(formData.get("level")), 10);
    const race = String(formData.get("race")).trim();
    const background = String(formData.get("background")).trim();

    // Validation
    if (!name) {
      return Response.json(
        { error: "Character name is required", success: null },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return Response.json(
        {
          error: "Character name must be less than 100 characters",
          success: null,
        },
        { status: 400 }
      );
    }

    // Create the character
    const { data: newCharacter, error: createError } = await supabase
      .from("characters")
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        class: characterClass || null,
        level: level || 1,
        race: race || null,
        background: background || null,
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating character:", createError);
      return Response.json(
        {
          error: "Failed to create character. Please try again.",
          success: null,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: "Character created successfully!",
      error: null,
      character: newCharacter,
    });
  }

  return Response.json(
    { error: "Invalid action", success: null },
    { status: 400 }
  );
}

export default function CampaignIndex() {
  const { campaigns, characters } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  // Show success toast when campaign is created
  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    }
  }, [actionData]);

  return (
    <>
      <CampaignList campaigns={campaigns} />
      <CharacterList characters={characters} />
    </>
  );
}
