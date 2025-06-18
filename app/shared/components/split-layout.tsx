import { TopBar } from "~/components/TopBar";

interface SplitLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function SplitLayout({ leftPanel, rightPanel }: SplitLayoutProps) {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Panel - Session Logging */}
      <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        {leftPanel}
      </div>
      {/* Right Panel - Knowledge Base */}
      <div className="w-1/2 overflow-y-auto">{rightPanel}</div>
    </div>
  );
}
