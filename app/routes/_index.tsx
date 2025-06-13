import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
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

export const meta: MetaFunction = () => {
  return [
    { title: "Squire - Your D&D Campaign Companion" },
    {
      name: "description",
      content:
        "Transform your D&D sessions into an organized, AI-enhanced campaign wiki. Track NPCs, locations, quests, and more.",
    },
  ];
};

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-12">
          {/* Hero Section */}
          <div className="space-y-6 max-w-3xl">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white font-fantasy">
              Welcome to Squire
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your AI-powered D&D campaign companion. Transform scattered
              session notes into an organized, searchable campaign wiki.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="space-y-6">
            <Link
              to="/login"
              className="inline-block px-8 py-3 text-lg font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              Get Started
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Join other DMs in creating better organized campaigns
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    title: "Story Tracking",
    description:
      "Transform rough session summaries into thematic, organized story logs with AI assistance.",
  },
  {
    title: "Campaign Wiki",
    description:
      "Maintain a searchable database of NPCs, locations, items, and quests with rich descriptions.",
  },
  {
    title: "Quest Management",
    description:
      "Track active and completed quests with clear progression and next steps.",
  },
  {
    title: "Party Inventory",
    description:
      "Manage collective and individual items with a detailed transaction log.",
  },
  {
    title: "Bestiary",
    description:
      "Catalog monsters encountered with combat statistics and AI-generated images.",
  },
  {
    title: "Collaborative",
    description:
      "Work together with your party to build a comprehensive campaign world.",
  },
];
