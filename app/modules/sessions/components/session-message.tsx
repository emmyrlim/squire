import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";

interface SessionMessageProps {
  content: string;
  userName: string;
  userAvatar?: string;
  timestamp: Date;
}

export function SessionMessage({
  content,
  userName = "",
  userAvatar,
  timestamp,
}: SessionMessageProps) {

  return (
    <div className="flex space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <Avatar className="h-8 w-8">
        <AvatarImage src={userAvatar} alt={userName} />
        <AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {userName}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {timestamp.toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
          {content}
        </p>
      </div>
    </div>
  );
}
