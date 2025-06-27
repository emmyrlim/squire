import { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";
import { createClient } from "@/shared/lib/supabase.client";
import type {
  SupabaseClient,
  RealtimeChannel,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
  RealtimePostgresDeletePayload,
} from "@supabase/supabase-js";

// Types
export type UserProfile = {
  id: string;
  display_name: string;
  avatar_url?: string;
};

export type UserProfileMap = Record<string, UserProfile>;

// Atom: user profiles for the current campaign
const campaignUserProfilesAtom = atom<UserProfileMap>({});

// Row types for payload generics
interface CampaignUserRow {
  user_id: string;
  campaign_id: string;
}
interface UserProfileRow {
  id: string;
  display_name: string;
  avatar_url?: string;
}

// Hook
export function useCampaignUserProfiles(campaignId: string) {
  const [userProfiles, setUserProfiles] = useAtom(campaignUserProfilesAtom);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  // Only create the client on the client side
  useEffect(() => {
    setSupabase(createClient());
  }, []);

  // Subscribe to campaign_users and user_profiles for real-time updates
  useEffect(() => {
    if (!campaignId || !supabase) return;
    let campaignUsersChannel: RealtimeChannel | null = null;
    let userProfilesChannel: RealtimeChannel | null = null;

    // Subscribe to campaign_users for join/leave
    campaignUsersChannel = supabase
      .channel(`campaign_users:${campaignId}`)
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "campaign_users",
          filter: `campaign_id=eq.${campaignId}`,
        },
        async (
          payload:
            | RealtimePostgresInsertPayload<CampaignUserRow>
            | RealtimePostgresDeletePayload<CampaignUserRow>
        ) => {
          if (payload.eventType === "INSERT") {
            const userId = payload.new.user_id;
            if (!supabase) return;
            const { data: profile } = await supabase
              .from("user_profiles")
              .select("id, display_name, avatar_url")
              .eq("id", userId)
              .single();
            if (profile) {
              setUserProfiles((prev) => ({ ...prev, [userId]: profile }));
            }
          }
          if (payload.eventType === "DELETE") {
            const userId = payload.old.user_id;
            setUserProfiles((prev) => {
              const copy = { ...prev };
              delete copy[userId];
              return copy;
            });
          }
        }
      )
      .subscribe();

    // Subscribe to user_profiles for profile updates
    userProfilesChannel = supabase
      .channel(`user_profiles:${campaignId}`)
      .on(
        "postgres_changes" as any,
        { event: "UPDATE", schema: "public", table: "user_profiles" },
        (payload: RealtimePostgresUpdatePayload<UserProfileRow>) => {
          const updated = payload.new;
          if (typeof updated.id !== "string" || !updated.id) return;
          setUserProfiles((prev) =>
            prev[updated.id as string]
              ? {
                  ...prev,
                  [updated.id as string]: {
                    ...prev[updated.id as string],
                    ...updated,
                  },
                }
              : prev
          );
        }
      )
      .subscribe();

    return () => {
      if (campaignUsersChannel) campaignUsersChannel.unsubscribe();
      if (userProfilesChannel) userProfilesChannel.unsubscribe();
    };
  }, [campaignId, setUserProfiles, supabase]);

  const loading = Object.keys(userProfiles).length === 0;
  return { setUserProfiles, userProfiles, loading };
}
