import type { NPC } from "~/modules/npcs/types";

interface NPCPageProps {
  npc: NPC;
}

export function NPCPage({ npc }: NPCPageProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        {npc.name}
      </h1>

      {npc.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {npc.description}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {npc.race && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Race
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{npc.race}</p>
          </div>
        )}

        {npc.occupation && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Occupation
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{npc.occupation}</p>
          </div>
        )}

        {npc.class && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Class
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{npc.class}</p>
          </div>
        )}

        {npc.disposition && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Disposition
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {npc.disposition}
            </p>
          </div>
        )}

        {npc.notes && (
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Notes
            </h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {npc.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
