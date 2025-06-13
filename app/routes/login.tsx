import { Form, useActionData, useSearchParams } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createClient } from "@/shared/lib/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = createClient(request);

  // Check if user is already authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // User is already logged in, redirect to dashboard
    return redirect("/dashboard", { headers });
  }

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = createClient(request);
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return Response.json({ type: "error", error: error.message } as const, {
      status: 400,
    });
  }

  // Check if user has a profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("id", (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile) {
    return redirect("/create-profile", { headers });
  }

  const response = redirect("/dashboard", {
    headers,
  });

  return response;
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-fantasy">
            Welcome to Squire
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your D&D campaign companion
          </p>
        </div>
        <Form className="mt-8 space-y-6" method="post">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {actionData?.type === "error" && (
            <div className="text-red-600 text-sm">{actionData.error}</div>
          )}

          {error === "profile_not_found" && (
            <div className="text-red-600 text-sm">
              Please{" "}
              <a
                href="/create-profile"
                className="text-primary-600 hover:text-primary-500 font-medium underline"
              >
                create a profile
              </a>{" "}
              to continue
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Sign In
            </button>
          </div>

          <div className="text-center">
            <a
              href="/signup"
              className="text-primary-600 hover:text-primary-500"
            >
              Don&apos;t have an account? Sign up
            </a>
          </div>
        </Form>
      </div>
    </div>
  );
}
