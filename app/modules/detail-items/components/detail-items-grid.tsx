import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Eye, Sparkles } from "lucide-react";
import type { DetailItem } from "../types";

interface DetailItemsGridProps {
  items: DetailItem[];
  onItemClick: (item: DetailItem) => void;
}

const categoryColors: Record<string, string> = {
  npc: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  location: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  monster: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  quest:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  mystery:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  magical_item:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

const categoryLabels: Record<string, string> = {
  npc: "NPC",
  location: "Location",
  monster: "Monster",
  quest: "Quest",
  mystery: "Mystery",
  magical_item: "Item",
};

export function DetailItemsGrid({ items, onItemClick }: DetailItemsGridProps) {
  // Check if an item was created in the last 30 seconds (for highlighting)
  const isRecentlyCreated = (item: DetailItem) => {
    if (!item.created_at) return false;
    const createdTime = new Date(item.created_at).getTime();
    const now = Date.now();
    return now - createdTime < 30000; // 30 seconds
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <Sparkles className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No items found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start a session to begin building your knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        const isNew = isRecentlyCreated(item);

        return (
          <Card
            key={item.id}
            className={`hover:shadow-md transition-all duration-300 cursor-pointer ${
              isNew
                ? "ring-2 ring-green-500/50 bg-green-50/50 dark:bg-green-900/20 animate-pulse"
                : ""
            }`}
            onClick={() => onItemClick(item)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {item.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemClick(item);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={
                    categoryColors[item.category] || "bg-gray-100 text-gray-800"
                  }
                >
                  {categoryLabels[item.category] || item.category}
                </Badge>
                {item.is_ai_generated && (
                  <Badge variant="outline" className="text-xs">
                    AI Generated
                  </Badge>
                )}
                {isNew && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    New
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {item.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                  {item.description}
                </p>
              )}
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {item.created_at && (
                  <span>
                    Created {new Date(item.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
