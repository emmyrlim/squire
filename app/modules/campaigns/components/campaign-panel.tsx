import { PlusIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "~/shared/components/ui/avatar";
import { Link } from "@remix-run/react";
import type { Campaign } from "@/campaigns/types";

export function CampaignPanel({
  campaigns,
  currentCampaignId,
}: {
  campaigns: Campaign[];
  currentCampaignId: string;
}) {
  return (
    <div
      className="flex flex-col gap-2 items-center"
      data-testid="campaign-avatar-panel"
    >
      {campaigns.map((campaign) => {
        const isActive = campaign.id === currentCampaignId;
        const initials = campaign.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        return (
          <Link
            key={campaign.id}
            to={`/campaigns/${campaign.slug}`}
            data-testid={`campaign-avatar-${campaign.slug}`}
            prefetch="intent"
            className={
              isActive
                ? "ring-2 ring-primary-500 rounded-full"
                : "opacity-70 hover:opacity-100"
            }
            aria-current={isActive ? "page" : undefined}
            style={{ display: "inline-block" }}
          >
            <Avatar>
              {/* TODO: Replace with campaign image if available */}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Link>
        );
      })}
      <PlusIcon
        className="ml-2 cursor-pointer"
        data-testid="add-campaign-button"
      />
    </div>
  );
}
