import { Link } from "@remix-run/react";
import { useState } from "react";
import { Location } from "../types";
import { LocationModal } from "./location-modal";
import { AddButton } from "@/shared/components/ui/add-button";

interface LocationListProps {
  locations: Location[];
  campaignSlug: string;
  sessions: { id: string; session_number: number }[];
}

export function LocationList({
  locations,
  campaignSlug,
  sessions,
}: LocationListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Group locations by parent
  const rootLocations = locations.filter((loc) => !loc.parent_location_id);
  const childLocations = locations.filter((loc) => loc.parent_location_id);

  const renderLocation = (location: Location, depth = 0) => {
    const children = childLocations.filter(
      (child) => child.parent_location_id === location.id
    );

    return (
      <div key={location.id} className="space-y-2">
        <div className="flex items-center space-x-2">
          <div style={{ marginLeft: `${depth * 1.5}rem` }} />
          <Link
            to={`/campaigns/${campaignSlug}/locations/${location.slug}`}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {location.name}
          </Link>
        </div>
        {children.map((child) => renderLocation(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Locations</h2>
        <AddButton
          onClick={() => setIsModalOpen(true)}
          variant={locations.length === 0 ? "glowing" : "default"}
        >
          Add Location
        </AddButton>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No Locations
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by adding your first location to the map.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rootLocations.map((location) => renderLocation(location))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">New Location</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <LocationModal
              campaignSlug={campaignSlug}
              parentLocations={locations}
              sessions={sessions}
            />
          </div>
        </div>
      )}
    </div>
  );
}
