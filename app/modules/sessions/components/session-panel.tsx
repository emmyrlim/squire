import { useState } from "react";
import { Button } from "~/shared/components/ui/button";
import { Input } from "~/shared/components/ui/input";
import { Plus, ArrowLeft, Send } from "lucide-react";
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
import { useNavigate } from "@remix-run/react";

interface SessionPanelProps {
  campaign: Campaign;
  sessions: Session[];
  activeSessionId: string;
}

export function SessionPanel({
  campaign,
  sessions,
  activeSessionId,
}: SessionPanelProps) {
  const { user } = useUser();
  const [newMessage, setNewMessage] = useState("");
  const navigate = useNavigate();

  const { createSession, isCreating } = useSessions(campaign.id);
  const { data: messages = [] } = useSessionMessages(activeSessionId);

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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeSessionId || !user) return;

    try {
      await createSessionMessage(activeSessionId, user.id, newMessage.trim());
      setNewMessage("");
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

      {/* Session List or Chat */}
      <ScrollArea className="flex-1 overflow-y-auto">
        {activeSessionId ? (
          <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
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
