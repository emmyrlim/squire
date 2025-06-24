import type { MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

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
  return <Outlet />;
}
