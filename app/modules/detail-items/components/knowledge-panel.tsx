import { Input } from "~/shared/components/ui/input";
import { Search } from "lucide-react";

interface KnowledgePanelProps {
  campaignId: string;
}

export function KnowledgePanel({ campaignId }: KnowledgePanelProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search knowledge base..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2 overflow-x-auto">
          {[
            "All",
            "NPCs",
            "Locations",
            "Monsters",
            "Quests",
            "Mysteries",
            "Items",
          ].map((category) => (
            <button
              key={category}
              className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Detail Items Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* TODO: Add detail items grid component */}
        <p className="text-gray-500 dark:text-gray-400">
          No items found. Start a session to begin building your knowledge base.
        </p>
      </div>
    </div>
  );
}
