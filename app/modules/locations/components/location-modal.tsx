import { Form, useNavigate } from "@remix-run/react";
import { Location } from "../types";

interface LocationModalProps {
  location?: Location;
  campaignSlug: string;
  parentLocations: Location[];
  sessions: { id: string; session_number: number }[];
  onClose?: () => void;
}

export function LocationModal({
  location,
  campaignSlug,
  parentLocations,
  sessions,
  onClose,
}: LocationModalProps) {
  const navigate = useNavigate();
  const isEditing = !!location;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(`/campaigns/${campaignSlug}/locations`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create location");
      }

      // Close modal and refresh the page
      if (onClose) {
        onClose();
      }
      navigate(`/campaigns/${campaignSlug}/locations`, { replace: true });
    } catch (error) {
      console.error("Error creating location:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Form method="post" onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          defaultValue={location?.name}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          defaultValue={location?.description}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="parent_location_id"
          className="block text-sm font-medium text-gray-700"
        >
          Parent Location
        </label>
        <select
          name="parent_location_id"
          id="parent_location_id"
          defaultValue={location?.parent_location_id}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">None</option>
          {parentLocations.map(parent => (
            <option key={parent.id} value={parent.id}>
              {parent.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="discovered_in_session_id"
          className="block text-sm font-medium text-gray-700"
        >
          Discovered In Session
        </label>
        <select
          name="discovered_in_session_id"
          id="discovered_in_session_id"
          defaultValue={location?.discovered_in_session_id}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Not yet discovered</option>
          {sessions.map(session => (
            <option key={session.id} value={session.id}>
              Session {session.session_number}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {isEditing ? "Save Changes" : "Create Location"}
        </button>
      </div>
    </Form>
  );
}
