import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAuth } from "@/shared/utils/auth.server";
import { LocationDetails } from "@/modules/locations/components/location-details";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { supabase, user } = await requireAuth(request);
  const { campaignSlug, locationSlug } = params;

  if (!campaignSlug || !locationSlug) {
    throw new Response("Campaign and Location slugs are required", {
      status: 400,
    });
  }

  // Get location with its relationships
  const { data: location, error: locationError } = await supabase
    .from("locations")
    .select(
      `
      *,
      parent_location:locations!locations_parent_location_id_fkey(*),
      discovered_in_session:sessions(id, session_number),
      sub_locations:locations!locations_parent_location_id_fkey(*)
    `
    )
    .eq("slug", locationSlug)
    .eq("campaigns.slug", campaignSlug)
    .single();

  if (locationError || !location) {
    throw new Response("Location not found", { status: 404 });
  }

  return Response.json({ location, campaignSlug });
}

export default function LocationDetailsRoute() {
  const { location, campaignSlug } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <LocationDetails location={location} campaignSlug={campaignSlug} />
    </div>
  );
}
