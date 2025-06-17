import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { requireAuth } from "@/shared/utils/auth.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { supabase, user } = await requireAuth(request);
  const campaignSlug = params.campaignSlug;

  if (!campaignSlug) {
    throw new Response("Campaign Slug is required", { status: 400 });
  }

  // Get campaign with user validation
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, name, slug")
    .eq("slug", campaignSlug)
    .eq("created_by", user.id)
    .single();

  if (campaignError || !campaign) {
    throw new Response("Campaign not found", { status: 404 });
  }

  return json({ campaign });
}

export default function BestiaryLayout() {
  const { campaign } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full">
      <div className="flex-1 space-y-4 p-8">
        <Outlet context={{ campaign }} />
      </div>
    </div>
  );
}
