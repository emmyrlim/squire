import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { useUser } from "@/shared/hooks/use-user";

export function UserProfilePanel() {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div data-testid="user-profile-panel" style={{ pointerEvents: "auto" }}>
      <Dialog>
        <DialogTrigger asChild>
          <button
            className="focus:outline-none"
            aria-label="Open user profile"
            data-testid="user-avatar-trigger"
          >
            <Avatar>
              {user.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={user.display_name} />
              ) : null}
              <AvatarFallback>{user.display_name?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
          </button>
        </DialogTrigger>
        <DialogContent data-testid="user-profile-modal">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <Avatar className="h-16 w-16">
              {user.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={user.display_name} />
              ) : null}
              <AvatarFallback className="text-2xl">
                {user.display_name?.[0] ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-lg font-semibold">{user.display_name}</div>
            <form
              method="post"
              action="/logout"
              className="w-full flex justify-center"
            >
              <Button
                type="submit"
                variant="destructive"
                data-testid="sign-out-button"
              >
                Sign Out
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
