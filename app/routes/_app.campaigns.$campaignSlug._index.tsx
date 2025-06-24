import { useOutletContext } from "@remix-run/react";
import type { Campaign } from "~/modules/campaigns/types";
import { SessionPanel } from "~/modules/sessions/components/session-panel";
import { Session } from "~/modules/sessions/types";
import { SessionList } from "@/modules/sessions/components/session-list";

export default function CampaignOverview() {
  const { campaign, sessions } = useOutletContext<{
    campaign: Campaign;
    sessions: Session[];
    isDM: boolean;
  }>();

  return <SessionPanel campaign={campaign} sessions={sessions} />;
}

export function SessionListPanel() {
  const { sessions, campaign } = useOutletContext<{
    campaign: Campaign;
    sessions: Session[];
    isDM: boolean;
  }>();
  return <SessionList sessions={sessions} campaignSlug={campaign.slug} />;
}
