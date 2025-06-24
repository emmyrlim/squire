import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireAuth } from "@/shared/utils/auth.server";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { SessionMessage } from "@/modules/sessions/components/session-message";
import { useSessionMessages } from "@/modules/sessions/hooks/use-session-messages";
import { Campaign } from "~/modules/campaigns/types";
import { Session } from "~/modules/sessions/types";
import { SessionPanel } from "~/modules/sessions/components/session-panel";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = await requireAuth(request);
  const campaignSlug = params.campaignSlug;
  const sessionSlug = params.sessionSlug;

  if (!campaignSlug || !sessionSlug) {
    throw new Response("Campaign and Session Slug are required", {
      status: 400,
    });
  }

  // Get campaign to ensure user has access
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id")
    .eq("slug", campaignSlug)
    .single();

  if (campaignError || !campaign) {
    throw new Response("Campaign not found", { status: 404 });
  }

  // Get session by campaign_id and slug
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("campaign_id", campaign.id)
    .eq("slug", sessionSlug)
    .single();

  if (sessionError || !session) {
    throw new Response("Session not found", { status: 404 });
  }

  return Response.json({ session });
}

export default function SessionChatPanel() {
  const { campaign, sessions } = useOutletContext<{
    campaign: Campaign;
    sessions: Session[];
    isDM: boolean;
  }>();
  const { session } = useLoaderData<typeof loader>();

  return (
    <SessionPanel
      campaign={campaign}
      sessions={sessions}
      activeSessionId={session.id}
    />
  );
}
