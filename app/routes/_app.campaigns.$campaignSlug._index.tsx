import { useOutletContext } from "@remix-run/react";
import type { Campaign } from "~/modules/campaigns/types";
import { SessionPanel } from "~/modules/sessions/components/session-panel";
import { Session } from "~/modules/sessions/types";

export default function CampaignOverview() {
  const { campaign, sessions } = useOutletContext<{
    campaign: Campaign;
    sessions: Session[];
    isDM: boolean;
  }>();

  return <SessionPanel campaign={campaign} sessions={sessions} />;
}
