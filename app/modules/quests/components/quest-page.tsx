import type { Quest } from "~/modules/quests/types";

interface QuestPageProps {
  quest: Quest;
}

export function QuestPage({ quest }: QuestPageProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {quest.title}
        </h1>
        <div className="flex space-x-2">
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

      {quest.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {quest.description}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quest.progress_summary && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Progress
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {quest.progress_summary}
            </p>
          </div>
        )}

        {quest.next_steps && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Next Steps
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {quest.next_steps}
            </p>
          </div>
        )}

        {quest.reward_description && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Reward
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {quest.reward_description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
