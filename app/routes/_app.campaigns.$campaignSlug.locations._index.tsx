import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAuth } from "@/shared/utils/auth.server";
import { LocationList } from "@/modules/locations/components/location-list";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { supabase, user } = await requireAuth(request);
  const campaignSlug = params.campaignSlug;

  if (!campaignSlug) {
    throw new Response("Campaign Slug is required", { status: 400 });
  }

  // Get campaign and verify access
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, name, slug")
    .eq("slug", campaignSlug)
    .single();

  if (campaignError || !campaign) {
    throw new Response("Campaign not found", { status: 404 });
  }

  // Get all locations for this campaign
  const { data: locations, error: locationsError } = await supabase
    .from("locations")
    .select("*")
    .eq("campaign_id", campaign.id)
    .order("name");

  if (locationsError) {
    throw new Response("Failed to load locations", { status: 500 });
  }

  // Get all sessions for discovery selection
  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("id, session_number")
    .eq("campaign_id", campaign.id)
    .order("session_number");

  if (sessionsError) {
    throw new Response("Failed to load sessions", { status: 500 });
  }

  return Response.json({ locations, campaignSlug, sessions });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, user } = await requireAuth(request);
  const campaignSlug = params.campaignSlug;

  if (!campaignSlug) {
    throw new Response("Campaign Slug is required", { status: 400 });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const parent_location_id = formData.get("parent_location_id") as string;
  const discovered_in_session_id = formData.get(
    "discovered_in_session_id"
  ) as string;

  // Get campaign ID
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id")
    .eq("slug", campaignSlug)
    .single();

  if (campaignError || !campaign) {
    throw new Response("Campaign not found", { status: 404 });
  }

  // Create new location
  const { data: location, error: locationError } = await supabase
    .from("locations")
    .insert({
      name,
      description,
      parent_location_id: parent_location_id || null,
      discovered_in_session_id: discovered_in_session_id || null,
      campaign_id: campaign.id,
    })
    .select()
    .single();

  if (locationError) {
    throw new Response("Failed to create location", { status: 500 });
  }

  return json({ location });
}

export default function LocationsIndex() {
  const { locations, campaignSlug, sessions } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <LocationList
        locations={locations}
        campaignSlug={campaignSlug}
        sessions={sessions}
      />
    </div>
  );
}
