import { createClient } from "@/shared/lib/supabase.client";
import { SupabaseClient } from "@supabase/supabase-js";
import { UserProfileMap } from "~/modules/campaigns/hooks/use-campaign-user-profiles";

export interface SessionMessage {
  id: string;
  session_id: string;
  user_id: string;
  message_content: string;
  message_type: "text" | "action" | "system";
  created_at: string;
  user: {
    display_name: string;
    avatar_url?: string;
  };
}

export async function getSessionMessages(
  sessionId: string,
  supabase: SupabaseClient
): Promise<SessionMessage[]> {
  console.log("Fetching messages for session:", sessionId);

  // First, let's check if we can access the session
  const { data: sessionData, error: sessionError } = await supabase
    .from("sessions")
    .select("campaign_id")
    .eq("id", sessionId)
    .single();

  console.log("Session data:", { sessionData, sessionError });

  if (sessionError) {
    console.error("Error fetching session:", sessionError);
    throw sessionError;
  }

  // Now fetch messages with user profiles
  const { data, error } = await supabase
    .from("session_messages")
    .select(
      `
      *,
      user:user_profiles(display_name, avatar_url)
    `
    )
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching session messages:", error);
    throw error;
  }

  console.log("Raw query results:", { data, error });

  return data as SessionMessage[];
}

export async function createSessionMessage(
  sessionId: string,
  userId: string,
  content: string,
  type: "text" | "action" | "system" = "text"
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("session_messages")
    .insert({
      session_id: sessionId,
      user_id: userId,
      message_content: content,
      message_type: type,
    })
    .select(
      `
      *,
      user:user_profiles(display_name, avatar_url)
    `
    )
    .single();

  if (error) {
    console.error("Error creating session message:", error);
    throw new Error("Failed to create session message");
  }

  return data as SessionMessage;
}

export function subscribeToSessionMessages(
  sessionId: string,
  supabase: SupabaseClient,
  userProfiles: UserProfileMap,
  onMessage: (message: SessionMessage) => void
) {
  let lastProcessedMessageId: string | null = null;

  const handleNewMessage = async (message: SessionMessage) => {
    if (message.id === lastProcessedMessageId) {
      // Already processed this message
      return;
    }
    lastProcessedMessageId = message.id;
    // Fetch user profile and merge
    const user = userProfiles[message.user_id];
    onMessage({ ...message, user });
  };

  const channel = supabase
    .channel(`session:${sessionId}`, {
      config: {
        broadcast: { self: true },
      },
    })
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "session_messages",
        filter: `session_id=eq.${sessionId}`,
      },
      async (payload) => {
        try {
          console.log("Received real-time message payload:", payload);
          await handleNewMessage(payload.new as SessionMessage);
        } catch (error) {
          console.error("Error processing real-time message:", error);
        }
      }
    )
    .subscribe();

  // Polling fallback (development only)
  if (process.env.NODE_ENV === "development") {
    let lastPolledMessageId: string | null = null;

    const pollMessages = async () => {
      try {
        const messages = await getSessionMessages(sessionId, supabase);
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.id !== lastPolledMessageId) {
          lastPolledMessageId = lastMessage.id;
          await handleNewMessage(lastMessage);
          console.log("Polled message:", lastMessage);
        }
      } catch (error) {
        console.error("Error in polling:", error);
      }
    };

    pollMessages();
    const pollInterval = setInterval(pollMessages, 5000);

    return {
      ...channel,
      unsubscribe: () => {
        clearInterval(pollInterval);
        channel.unsubscribe();
      },
    };
  }

  return channel;
}
