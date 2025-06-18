import { useOutletContext } from "@remix-run/react";

interface User {
  id: string;
  display_name: string;
  avatar_url?: string;
}

interface OutletContext {
  user: User;
  request: Request;
}

export function useUser() {
  const context = useOutletContext<OutletContext>();
  return { user: context.user, request: context.request };
}
