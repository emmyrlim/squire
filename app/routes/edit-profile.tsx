import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireAuth } from "@/shared/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, user } = await requireAuth(request);

  // Get user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return redirect("/create-profile");
  }

  return { profile };
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, user } = await requireAuth(request);
  const formData = await request.formData();
  const displayName = String(formData.get("displayName")).trim();

  if (displayName.length < 3 || displayName.length > 30) {
    return Response.json(
      {
        error: "Display name must be between 3 and 30 characters",
        success: null,
      },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase.rpc("upsert_user_profile", {
    profile_display_name: displayName || null,
  });

  if (updateError) {
    console.error("Error updating profile:", updateError);
    return Response.json(
      { error: "Failed to update profile. Please try again.", success: null },
      { status: 500 }
    );
  }

  return Response.json({
    success: "Profile updated successfully",
    error: null,
  });
}

export default function EditProfile() {
  const { profile } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-fantasy">
            Edit Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Update your profile information
          </p>
        </div>
        <Form className="mt-8 space-y-6" method="post">
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="displayName" className="sr-only">
                Display Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                defaultValue={profile.display_name || ""}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Display Name (optional)"
              />
            </div>
          </div>

          {actionData?.error && (
            <div className="text-red-600 text-sm">{actionData.error}</div>
          )}

          {actionData?.success && (
            <div className="text-green-600 text-sm">{actionData.success}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Update Profile
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
