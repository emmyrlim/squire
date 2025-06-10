import { useState } from "react";
import { Form, useActionData } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { createSupabaseServerClient } from "@/shared/lib/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const intent = String(formData.get("intent"));

  if (intent === "signin") {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return json({ type: "error", error: error.message } as const, {
        status: 400,
      });
    }
  } else if (intent === "signup") {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return json({ type: "error", error: error.message } as const, {
        status: 400,
      });
    }

    return json({
      type: "success",
      message: "Check your email for confirmation link",
    } as const);
  }

  return redirect("/campaigns");
}

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const actionData = useActionData<typeof action>();
  // const { supabase } = useOutletContext<{ supabase: any }>();
  // const navigate = useNavigate();

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

          {actionData?.type === "success" && (
            <div className="text-green-600 text-sm">{actionData.message}</div>
          )}

          <div>
            <button
              type="submit"
              name="intent"
              value={isSignUp ? "signup" : "signin"}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary-600 hover:text-primary-500"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
