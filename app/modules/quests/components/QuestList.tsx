import { Link } from "@remix-run/react";
import { Quest } from "../types";

interface QuestListProps {
  quests: Quest[];
  campaignSlug: string;
  onOpen: (isOpen: boolean) => void;
}

export function QuestList({ quests, campaignSlug, onOpen }: QuestListProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quests
          </h1>
          <button
            onClick={() => onOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Add Quest
          </button>
        </div>

        {quests.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No Quests
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating your first quest.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quests.map((quest) => (
              <div
                key={quest.id}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {quest.title}
                  </h3>
                  {quest.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {quest.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        quest.status === "active"
                          ? "bg-green-100 text-green-800"
                          : quest.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {quest.status}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        quest.questType === "main"
                          ? "bg-purple-100 text-purple-800"
                          : quest.questType === "side"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {quest.questType}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
