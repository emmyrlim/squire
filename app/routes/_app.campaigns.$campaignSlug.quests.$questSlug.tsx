import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireAuth } from "@/shared/utils/auth.server";
import { QuestPage } from "~/modules/quests/components/QuestPage";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = await requireAuth(request);
  const { questId } = params;

  if (!questId) {
    throw new Response("Quest ID is required", { status: 400 });
  }

  const { data: quest, error } = await supabase
    .from("quests")
    .select("*")
    .eq("id", questId)
    .single();

  if (error) {
    console.error("Error:", error);
    throw new Response(`Failed to load quest: ${error.message}`, {
      status: 500,
    });
  }

  if (!quest) {
    throw new Response("Quest not found", { status: 404 });
  }

  return { quest };
}

export default function QuestRoute() {
  const { quest } = useLoaderData<typeof loader>();
  return <QuestPage quest={quest} />;
}
