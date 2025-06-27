import { useState } from "react";
import { Button } from "~/shared/components/ui/button";
import { Input } from "~/shared/components/ui/input";
import { Plus, ArrowLeft, Send, Mic } from "lucide-react";
import { SessionList } from "./session-list";
import { SessionMessage } from "./session-message";
import { createSessionMessage } from "../services/session-messages";
import { useUser } from "@/shared/hooks/use-user";
import { useSessionMessages } from "../hooks/use-session-messages";
import { useSessions } from "../hooks/use-sessions";
import type { SessionMessage as SessionMessageType } from "../services/session-messages";
import { UserProfilePanel } from "../../user-profile/components/user-profile-panel";
import { ScrollArea } from "~/shared/components/ui/scroll-area";
import { Campaign } from "~/modules/campaigns/types";
import { Session } from "../types";
import { useNavigate, useFetcher } from "@remix-run/react";

interface SessionPanelProps {
  campaign: Campaign;
  sessions: Session[];
  activeSessionId?: string;
}

type TranscribeResult = {
  status: string;
  entities?: unknown[];
  relationships?: unknown[];
  [key: string]: unknown;
};

// Helper to safely stringify fetcher data for debug display
function safeStringifyFetcherData(data: unknown): string {
  if (typeof data === "string") return data;
  if (typeof data === "object" && data !== null)
    return JSON.stringify(data, null, 2);
  return String(data);
}

export function SessionPanel({
  campaign,
  sessions,
  activeSessionId,
}: SessionPanelProps) {
  const { user } = useUser();
  const [newMessage, setNewMessage] = useState("");
  const navigate = useNavigate();
  const fetcher = useFetcher<TranscribeResult>();

  const { createSession, isCreating } = useSessions(campaign.id);
  const { data: messages = [] } = useSessionMessages(activeSessionId);
  console.log("activeSessionId", activeSessionId);
  console.log("messages", messages);

  const handleNewSession = async () => {
    if (!user) return;

    try {
      const newSession = await createSession({ userId: user.id });
      if (newSession) {
        navigate(`/campaigns/${campaign.slug}/${newSession.slug}`);
      }
    } catch (error) {
      console.error("Error creating session:", error);
      // TODO: Show error toast
    }
  };

  const handleTranscribe = async () => {
    if (!activeSessionId) return;
    fetcher.submit(
      {
        sessionId: activeSessionId,
      },
      {
        method: "post",
        action: `/campaigns/${campaign.id}/transcribe`,
        encType: "application/json",
      }
    );
  };

  const handleSendMessage = async () => {
    console.log("handleSendMessage", newMessage, activeSessionId, user);
    if (!newMessage.trim() || !activeSessionId || !user) return;

    try {
      setNewMessage("");
      await createSessionMessage(activeSessionId, user.id, newMessage.trim());
    } catch (error) {
      console.error("Error sending message:", error);
      // TODO: Show error toast
    }
  };

  return (
    <div
      className="h-screen flex flex-col relative"
      data-testid="session-panel"
    >
      {/* Session Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          {activeSessionId ? (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/campaigns/${campaign.slug}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Session{" "}
                {sessions.find((s) => s.id === activeSessionId)?.session_number}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTranscribe}
                disabled={
                  fetcher.state === "submitting" || fetcher.state === "loading"
                }
              >
                <Mic className="h-4 w-4 mr-2" />
                {fetcher.state === "submitting" || fetcher.state === "loading"
                  ? "Transcribing..."
                  : "Transcribe"}
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Session Log
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewSession}
                disabled={isCreating}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Optionally, log result or error */}
      {fetcher.data && (
        <pre className="p-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded mt-2 overflow-x-auto">
          {safeStringifyFetcherData(fetcher.data)}
        </pre>
      )}

      {/* Session List or Chat */}
      <ScrollArea className="flex-1 overflow-y-auto">
        {activeSessionId ? (
          <div className="h-full overflow-y-auto p-4">
            {messages.map((message: SessionMessageType) => (
              <SessionMessage
                key={message.id}
                content={message.message_content}
                userName={message.user.display_name ?? ""}
                userAvatar={message.user.avatar_url}
                timestamp={new Date(message.created_at)}
              />
            ))}
          </div>
        ) : (
          <SessionList sessions={sessions} campaignSlug={campaign.slug} />
        )}
      </ScrollArea>

      <div className="flex w-full">
        <UserProfilePanel />
        {/* Message Input */}
        {activeSessionId != null ? (
          <div className="p-4 flex-1 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !user}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
