import { Link, useLocation } from "@remix-run/react";
import { cn } from "@/shared/utils/cn";
import {
  BookOpen,
  Users,
  Map,
  ScrollText,
  Sword,
  Settings,
} from "lucide-react";

interface SidebarProps {
  campaignSlug: string;
}

export function Sidebar({ campaignSlug }: SidebarProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const links = [
    {
      href: `/campaigns/${campaignSlug}`,
      label: "Overview",
      icon: BookOpen,
    },
    {
      href: `/campaigns/${campaignSlug}/npcs`,
      label: "NPCs",
      icon: Users,
    },
    {
      href: `/campaigns/${campaignSlug}/locations`,
      label: "Locations",
      icon: Map,
    },
    {
      href: `/campaigns/${campaignSlug}/quests`,
      label: "Quests",
      icon: ScrollText,
    },
    {
      href: `/campaigns/${campaignSlug}/bestiary`,
      label: "Bestiary",
      icon: Sword,
    },
    {
      href: `/campaigns/${campaignSlug}/settings`,
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <div className="w-64 border-r bg-background">
      <nav className="space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
