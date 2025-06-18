import { createClient } from "@/shared/lib/supabase.client";

export interface Session {
  id: string;
  campaign_id: string;
  session_number: number;
  title?: string;
  raw_summary: string;
  enhanced_summary?: string;
  session_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export async function getSessions(campaignId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("session_number", { ascending: false });

  if (error) {
    console.error("Error fetching sessions:", error);
    throw new Error("Failed to fetch sessions");
  }

  return data as Session[];
}

export async function createSession(
  campaignId: string,
  userId: string,
  sessionNumber: number
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      campaign_id: campaignId,
      session_number: sessionNumber,
      raw_summary: "", // Empty initial summary
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating session:", error);
    throw new Error("Failed to create session");
  }

  return data as Session;
}

export function subscribeToSessions(
  campaignId: string,
  onSession: (session: Session) => void
) {
  const supabase = createClient();

  return supabase
    .channel(`campaign:${campaignId}:sessions`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "sessions",
        filter: `campaign_id=eq.${campaignId}`,
      },
      (payload) => {
        onSession(payload.new as Session);
      }
    )
    .subscribe();
}
