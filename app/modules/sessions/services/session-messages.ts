import { createClient } from "@/shared/lib/supabase.client";

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
  sessionId: string
): Promise<SessionMessage[]> {
  const supabase = createClient();

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

  console.log("Raw query results:", { data, error });

  if (error) {
    console.error("Error fetching session messages:", error);
    throw error;
  }

  // Let's also check if we can access the user profiles directly
  const userIds = data.map((msg) => msg.user_id);
  const { data: userData, error: userError } = await supabase
    .from("user_profiles")
    .select("id, display_name, avatar_url")
    .in("id", userIds);

  console.log("User profiles data:", { userData, userError });

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
  onMessage: (message: SessionMessage) => void
) {
  console.log("Setting up real-time subscription for session:", sessionId);
  const supabase = createClient();

  // First, let's verify the client is properly initialized
  console.log("Supabase client initialized:", !!supabase);

  const channel = supabase
    .channel(`session:${sessionId}`, {
      config: {
        broadcast: { self: true }, // Enable receiving our own messages
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
        console.log("Received real-time message payload:", payload);
        try {
          // Fetch the full message with user data
          const messages = await getSessionMessages(sessionId);
          console.log("Fetched messages:", messages);
          const message = messages.find((m) => m.id === payload.new.id);
          if (message) {
            console.log("Found matching message:", message);
            onMessage(message);
          } else {
            console.warn("Message not found in fetched messages");
          }
        } catch (error) {
          console.error("Error processing real-time message:", error);
        }
      }
    )
    .subscribe((status) => {
      console.log("Subscription status:", status);
      if (status === "SUBSCRIBED") {
        console.log("Successfully subscribed to real-time updates");
      } else if (status === "CLOSED") {
        console.log("Subscription closed");
      } else if (status === "CHANNEL_ERROR") {
        console.error("Channel error occurred");
      }
    });

  // Add a fallback polling mechanism for development
  if (process.env.NODE_ENV === "development") {
    let lastMessageId: string | null = null;

    const pollMessages = async () => {
      try {
        const messages = await getSessionMessages(sessionId);
        const lastMessage = messages[messages.length - 1];

        if (lastMessage) {
          // If this is the first poll, just set the ID without sending
          if (lastMessageId === null) {
            lastMessageId = lastMessage.id;
            console.log("Initialized lastMessageId with:", lastMessageId);
          }
          // Only send the message if it's new
          else if (lastMessage.id !== lastMessageId) {
            console.log("Polling found new message:", lastMessage.id);
            lastMessageId = lastMessage.id;
            onMessage(lastMessage);
          }
        }
      } catch (error) {
        console.error("Error in polling:", error);
      }
    };

    // Initial poll
    pollMessages();

    const pollInterval = setInterval(pollMessages, 5000);

    // Clean up the polling when the component unmounts
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
