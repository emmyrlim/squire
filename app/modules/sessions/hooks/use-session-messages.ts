import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSessionMessages,
  subscribeToSessionMessages,
  type SessionMessage,
} from "../services/session-messages";
import { useEffect } from "react";

export function useSessionMessages(sessionId: string | null) {
  const queryClient = useQueryClient();

  console.log("useSessionMessages hook - sessionId:", sessionId);

  const query = useQuery<SessionMessage[]>({
    queryKey: ["session-messages", sessionId],
    queryFn: () => {
      if (!sessionId) return [];
      console.log("Fetching messages for session:", sessionId);
      return getSessionMessages(sessionId);
    },
    enabled: !!sessionId,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!sessionId) {
      console.log("No sessionId, skipping subscription");
      return;
    }

    console.log("Setting up subscription for session:", sessionId);
    const subscription = subscribeToSessionMessages(sessionId, (message) => {
      console.log("Received new message in hook:", message);
      // Update query cache with new message
      queryClient.setQueryData<SessionMessage[]>(
        ["session-messages", sessionId],
        (old) => [...(old || []), message]
      );
    });

    // Cleanup subscription when query is unmounted or sessionId changes
    return () => {
      console.log("Cleaning up subscription for session:", sessionId);
      subscription.unsubscribe();
    };
  }, [queryClient, sessionId]);

  return query;
}
