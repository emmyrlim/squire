import { Button } from "~/shared/components/ui/button-old";
import { Monster } from "../types";

interface MonsterDetailProps {
  monster: Monster;
  campaignSlug: string;
}

export function MonsterDetail({ monster, campaignSlug }: MonsterDetailProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {monster.name}
        </h1>
        <Button asChild variant="outline">
          <a href={`/campaigns/${campaignSlug}/bestiary`}>Back to List</a>
        </Button>
      </div>

      {monster.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {monster.description}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Creature Type
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {monster.creature_type}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Challenge Rating
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {monster.challenge_rating}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Armor Class
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {monster.armor_class}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Hit Points
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {monster.hit_points}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Speed
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{monster.speed}</p>
        </div>

        {monster.attacks_observed && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Attacks Observed
            </h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {monster.attacks_observed}
            </p>
          </div>
        )}

        {monster.special_abilities && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Special Abilities
            </h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {monster.special_abilities}
            </p>
          </div>
        )}

        {monster.notes && (
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Notes
            </h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {monster.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
