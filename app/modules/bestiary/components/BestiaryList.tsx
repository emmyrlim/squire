import { Link } from "@remix-run/react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Monster } from "../types";

interface BestiaryListProps {
  monsters: Monster[];
  campaignSlug: string;
}

export function BestiaryList({ monsters, campaignSlug }: BestiaryListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Bestiary</h2>
        <Button asChild>
          <Link to={`/campaigns/${campaignSlug}/bestiary/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Monster
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {monsters.map((monster) => (
          <Link
            key={monster.id}
            to={`/campaigns/${campaignSlug}/bestiary/${monster.id}`}
            className="block"
          >
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{monster.name}</span>
                  {monster.is_defeated && (
                    <span className="text-sm text-muted-foreground">
                      Defeated
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium">Type:</span>{" "}
                    {monster.creature_type}
                  </p>
                  <p>
                    <span className="font-medium">CR:</span>{" "}
                    {monster.challenge_rating}
                  </p>
                  <p>
                    <span className="font-medium">HP:</span>{" "}
                    {monster.hit_points}
                  </p>
                  <p>
                    <span className="font-medium">AC:</span>{" "}
                    {monster.armor_class}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
