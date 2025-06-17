interface Quest {
  id: string;
  title: string;
  description: string;
  campaignId: string;
  questType: "main" | "side" | "personal";
  status: "active" | "completed" | "archived";
  progress_summary: string;
  next_steps: string;
  location_id: string;
  quest_giver_npc_id: string;
  started_in_session_id: string;
  completed_in_session_id: string;
  reward_description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type { Quest };
