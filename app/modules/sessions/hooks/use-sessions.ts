import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getSessions,
  createSession,
  subscribeToSessions,
  type Session,
} from "../services/sessions";
import { useEffect } from "react";

export function useSessions(campaignId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Session[]>({
    queryKey: ["sessions", campaignId],
    queryFn: () => getSessions(campaignId),
    staleTime: 1000 * 60, // 1 minute
  });

  const createSessionMutation = useMutation<Session, Error, { userId: string }>(
    {
      mutationFn: ({ userId }) =>
        createSession(campaignId, userId, (query.data?.length ?? 0) + 1),
      onSuccess: (newSession) => {
        queryClient.setQueryData<Session[]>(["sessions", campaignId], (old) => [
          newSession,
          ...(old ?? []),
        ]);
      },
    }
  );

  useEffect(() => {
    const subscription = subscribeToSessions(campaignId, (session) => {
      queryClient.setQueryData<Session[]>(["sessions", campaignId], (old) => [
        session,
        ...(old ?? []),
      ]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [campaignId, queryClient]);

  return {
    sessions: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createSession: createSessionMutation.mutateAsync,
    isCreating: createSessionMutation.isPending,
  };
}
