import { PlusIcon } from "@heroicons/react/24/outline";
import { Link } from "@remix-run/react";
import type { NPC } from "@/npcs/types";

interface NPCListProps {
  npcs: NPC[];
  campaignSlug: string;
  onOpen: (isOpen: boolean) => void;
}

export function NPCList({ npcs, campaignSlug, onOpen }: NPCListProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            NPCs
          </h1>
          <button
            onClick={() => onOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add NPC
          </button>
        </div>

        {npcs.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No NPCs
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating your first NPC.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {npcs.map((npc) => (
              <Link
                key={npc.id}
                to={`/campaigns/${campaignSlug}/npcs/${npc.slug}`}
                className="block"
              >
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {npc.name}
                    </h3>
                    {npc.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {npc.description}
                      </p>
                    )}
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      {npc.race && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Race:
                          </span>{" "}
                          <span className="text-gray-900 dark:text-gray-100">
                            {npc.race}
                          </span>
                        </div>
                      )}
                      {npc.occupation && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Occupation:
                          </span>{" "}
                          <span className="text-gray-900 dark:text-gray-100">
                            {npc.occupation}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
