import { useLoaderData, useActionData } from "@remix-run/react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { requireAuth } from "@/shared/utils/auth.server";
import { CampaignList } from "@/modules/campaigns/components/campaign-list";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { CharacterList } from "@/modules/characters/components/character-list";

export const meta: MetaFunction = () => {
  return [
    { title: "Squire - Your D&D Campaign Companion" },
    {
      name: "description",
      content:
        "Transform your D&D sessions into an organized, AI-enhanced campaign wiki. Track NPCs, locations, quests, and more.",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, user } = await requireAuth(request);

  // Get all campaigns where user is a member (including as DM)
  const { data: campaigns, error: campaignsError } = await supabase
    .from("campaigns")
    .select(
      `
      *,
      campaign_users!inner (
        role
      )
    `
    )
    .eq("campaign_users.user_id", user.id)
    .order("created_at", { ascending: false });

  if (campaignsError) {
    console.error("Error loading campaigns:", campaignsError);
    throw new Response("Failed to load campaigns", { status: 500 });
  }

  // Get all characters created by the user
  const { data: characters, error: charactersError } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (charactersError) {
    console.error("Error loading characters:", charactersError);
    throw new Response("Failed to load characters", { status: 500 });
  }

  return { campaigns, characters };
}

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

  if (intent === "join-campaign") {
    const inviteCode = String(formData.get("invite_code")).trim();

    if (!inviteCode) {
      return Response.json(
        { error: "Invite code is required", success: null },
        { status: 400 }
      );
    }

    console.log("Attempting to join campaign with invite code:", inviteCode);

    // First, check if campaign exists without RLS
    const { data: campaignCheck, error: checkError } = await supabase
      .from("campaigns")
      .select("id, name, invite_code")
      .eq("invite_code", inviteCode);

    console.log("Campaign existence check:", {
      found: Array.isArray(campaignCheck) && campaignCheck.length > 0,
      data: campaignCheck,
      error: checkError,
    });

    // Then try to get the campaign with RLS
    const { data: campaign, error: campaignJoinError } = await supabase
      .from("campaigns")
      .select("id, name")
      .eq("invite_code", inviteCode)
      .single();

    if (campaignJoinError || !campaign) {
      console.log("campaign joining error", campaignJoinError);
      console.log("Query details:", {
        inviteCode,
        error: campaignJoinError,
        data: campaign,
      });
      return Response.json(
        { error: "Invalid invite code", success: null },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const { data: existingMembership, error: membershipError } = await supabase
      .from("campaign_users")
      .select("id")
      .eq("campaign_id", campaign.id)
      .eq("user_id", user.id)
      .single();

    if (membershipError && membershipError.code !== "PGRST116") {
      console.error("Error checking membership:", membershipError);
      return Response.json(
        { error: "Failed to check campaign membership", success: null },
        { status: 500 }
      );
    }

    if (existingMembership) {
      return Response.json(
        { error: "You are already a member of this campaign", success: null },
        { status: 400 }
      );
    }

    // Add user as a player to the campaign
    const { error: joinError } = await supabase.from("campaign_users").insert({
      campaign_id: campaign.id,
      user_id: user.id,
      role: "player",
    });

    if (joinError) {
      console.error("Error joining campaign:", joinError);
      return Response.json(
        { error: "Failed to join campaign. Please try again.", success: null },
        { status: 500 }
      );
    }

    return Response.json({
      success: `Successfully joined ${campaign.name}!`,
      error: null,
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
