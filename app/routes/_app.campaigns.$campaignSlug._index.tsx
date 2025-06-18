import { useOutletContext } from "@remix-run/react";
import type { Campaign } from "~/modules/campaigns/types";
import { SessionPanel } from "~/modules/sessions/components/session-panel";
import { KnowledgePanel } from "~/modules/detail-items/components/knowledge-panel";

export default function CampaignOverview() {
  const { campaign } = useOutletContext<{
    campaign: Campaign;
    isDM: boolean;
  }>();

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Panel - Session Logging */}
      <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <SessionPanel campaignId={campaign.id} />
      </div>
      {/* Right Panel - Knowledge Base */}
      <div className="w-1/2 overflow-y-auto">
        <KnowledgePanel campaignId={campaign.id} />
      </div>
    </div>
  );
}
