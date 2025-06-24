import { TopBar } from "~/components/TopBar";
import { ScrollArea } from "~/shared/components/ui/scroll-area";

interface SplitLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  campaignPanel: React.ReactNode;
}

export function SplitLayout({
  leftPanel,
  rightPanel,
  campaignPanel,
}: SplitLayoutProps) {
  return (
    <div className="h-screen flex bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <ScrollArea
        data-testid="campaign-panel"
        className="h-full border-r border-gray-200 dark:border-gray-700 min-h-0"
      >
        {campaignPanel}
      </ScrollArea>
      <div
        data-testid="left-panel"
        className="h-full w-1/2 border-r border-gray-200 dark:border-gray-700 min-h-0"
      >
        {leftPanel}
      </div>
      <ScrollArea data-testid="right-panel" className="h-full w-1/2 min-h-0">
        {rightPanel}
      </ScrollArea>
    </div>
  );
}
