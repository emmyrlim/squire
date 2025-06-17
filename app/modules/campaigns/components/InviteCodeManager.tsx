import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { KeyIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface InviteCodeManagerProps {
  campaignId: string;
  inviteCode: string;
  isDM: boolean;
}

export function InviteCodeManager({
  campaignId,
  inviteCode,
  isDM,
}: InviteCodeManagerProps) {
  const [showCode, setShowCode] = useState(false);
  const actionData = useActionData<{ error?: string; success?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  if (!isDM) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
          Campaign Invite Code
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
          <p>
            Share this code with players to let them join your campaign. Only you
            can see and regenerate this code.
          </p>
        </div>
        <div className="mt-5">
          <Form method="post" className="flex items-center space-x-4">
            <input type="hidden" name="intent" value="regenerate-invite-code" />
            <input type="hidden" name="campaign_id" value={campaignId} />

            <div className="flex-1">
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type={showCode ? "text" : "password"}
                  value={inviteCode}
                  readOnly
                  className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white dark:bg-gray-700"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="inline-flex items-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              {showCode ? "Hide" : "Show"}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`-ml-0.5 mr-1.5 h-5 w-5 ${
                  isSubmitting ? "animate-spin" : ""
                }`}
                aria-hidden="true"
              />
              Regenerate
            </button>
          </Form>

          {actionData?.error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {actionData.error}
            </p>
          )}

          {actionData?.success && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              {actionData.success}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}