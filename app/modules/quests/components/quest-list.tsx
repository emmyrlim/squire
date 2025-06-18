import { Link } from "@remix-run/react";
import type { Quest } from "../types";
import { AddButton } from "@/shared/components/ui/add-button";

interface QuestListProps {
  quests: Quest[];
  campaignSlug: string;
  onOpen: () => void;
}

export function QuestList({ quests, campaignSlug, onOpen }: QuestListProps) {
  if (!quests.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No quests yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Create your first quest to get started
        </p>
        <AddButton onClick={onOpen} variant="glowing">
          Add Quest
        </AddButton>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quests
          </h1>
          <AddButton onClick={onOpen} variant="default">
            Add Quest
          </AddButton>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quests.map((quest) => (
            <Link
              key={quest.id}
              to={`/campaigns/${campaignSlug}/quests/${quest.id}`}
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {quest.title}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    quest.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      : quest.status === "completed"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                  }`}
                >
                  {quest.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {quest.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`text-xs font-medium ${
                    quest.questType === "main"
                      ? "text-primary-600 dark:text-primary-400"
                      : quest.questType === "side"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-purple-600 dark:text-purple-400"
                  }`}
                >
                  {quest.questType}
                </span>
                {quest.progress_summary && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {quest.progress_summary}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
