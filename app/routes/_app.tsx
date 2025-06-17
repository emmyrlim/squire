import type { MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { TopBar } from "~/components/TopBar";

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
      <TopBar />
      <Outlet />
    </div>
  );
}
