import { format } from "date-fns";
import type { Session } from "../types";
import { Link } from "@remix-run/react";

interface SessionListProps {
  sessions: Session[];
  campaignSlug: string;
}

export function SessionList({ sessions, campaignSlug }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        No sessions yet. Start a new session to begin logging!
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {sessions
        .sort((a, b) => a.session_number - b.session_number)
        .map((session) => (
          <Link
            key={session.id}
            to={`/campaigns/${campaignSlug}/${session.slug}`}
            className="w-full block p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            data-testid={`session-link-${session.id}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Session {session.session_number}
                </h3>
                {session.title && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {session.title}
                  </p>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(session.created_at), "MMM d, yyyy")}
              </div>
            </div>
          </Link>
        ))}
    </div>
  );
}
