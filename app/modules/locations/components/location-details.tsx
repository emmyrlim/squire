import { Link } from "@remix-run/react";
import { LocationWithRelations } from "../types";

interface LocationDetailsProps {
  location: LocationWithRelations;
  campaignSlug: string;
}

export function LocationDetails({
  location,
  campaignSlug,
}: LocationDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{location.name}</h1>
        <Link
          to={`/campaigns/${campaignSlug}/locations/${location.slug}/edit`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Edit Location
        </Link>
      </div>

      <div className="space-y-4">
        {location.description && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {location.description}
            </p>
          </div>
        )}

        {location.parent_location && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Parent Location</h2>
            <Link
              to={`/campaigns/${campaignSlug}/locations/${location.parent_location.slug}`}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {location.parent_location.name}
            </Link>
          </div>
        )}

        {location.discovered_in_session && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Discovered In</h2>
            <Link
              to={`/campaigns/${campaignSlug}/sessions/${location.discovered_in_session.id}`}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Session {location.discovered_in_session.session_number}
            </Link>
          </div>
        )}

        {location.sub_locations && location.sub_locations.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Sub-locations</h2>
            <div className="space-y-2">
              {location.sub_locations.map((subLocation) => (
                <div key={subLocation.id}>
                  <Link
                    to={`/campaigns/${campaignSlug}/locations/${subLocation.slug}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {subLocation.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
