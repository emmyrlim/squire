import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSessionMessages,
  subscribeToSessionMessages,
  type SessionMessage,
} from "../services/session-messages";
import { useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase.client";
import { SupabaseClient } from "@supabase/supabase-js";
import { useCampaignUserProfiles } from "~/modules/campaigns/hooks/use-campaign-user-profiles";

export function useSessionMessages(sessionId: string | undefined) {
  const queryClient = useQueryClient();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const { userProfiles } = useCampaignUserProfiles();

  useEffect(() => {
    // Only run on client
    const supabase = createClient();
    setSupabase(supabase);
  }, []);

  const query = useQuery<SessionMessage[]>({
    queryKey: ["session-messages", sessionId, supabase?.auth.getUser()],
    queryFn: () => {
      if (!sessionId || !supabase) return [];
      return getSessionMessages(sessionId, supabase);
    },
    enabled: !!sessionId,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!sessionId || !supabase) {
      console.log("No sessionId, skipping subscription");
      return;
    }

    console.log("Setting up subscription for session:", sessionId);
    const subscription = subscribeToSessionMessages(
      sessionId,
      supabase,
      userProfiles,
      (message) => {
        // Update query cache with new message
        queryClient.setQueryData<SessionMessage[]>(
          ["session-messages", sessionId, supabase?.auth.getUser()],
          (old) => [...(old || []), message]
        );
      }
    );

    // Cleanup subscription when query is unmounted or sessionId changes
    return () => {
      console.log("Cleaning up subscription for session:", sessionId);
      subscription.unsubscribe();
    };
  }, [queryClient, sessionId, supabase]);

  console.log("Fetched messages:", query.data, "for session:", sessionId);

  return query;
}
