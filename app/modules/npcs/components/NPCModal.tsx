import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { Campaign } from "~/modules/campaigns/types";

interface NPCModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
}

export function NPCModal({ isOpen, onClose, campaign }: NPCModalProps) {
  const actionData = useActionData<{ error?: string; success?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Close modal on successful NPC creation
  useEffect(() => {
    if (actionData?.success) {
      onClose();
    }
  }, [actionData?.success, onClose]);

  console.log("NPCModal render:", { isOpen, actionData, navigation });

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-gray-500/75 p-0 rounded-lg max-w-md w-full bg-white dark:bg-gray-800"
      onClose={onClose}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Create New NPC
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="create-npc" />
          <input type="hidden" name="campaignId" value={campaign.id} />

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Name *
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              maxLength={100}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter NPC name"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description (optional)
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter NPC description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="race"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Race
              </label>
              <input
                type="text"
                name="race"
                id="race"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g., Human, Elf"
              />
            </div>

            <div>
              <label
                htmlFor="occupation"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Occupation
              </label>
              <input
                type="text"
                name="occupation"
                id="occupation"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g., Merchant, Guard"
              />
            </div>
          </div>

          {actionData?.error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {actionData.error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create NPC"}
            </button>
          </div>
        </Form>
      </div>
    </dialog>
  );
}
