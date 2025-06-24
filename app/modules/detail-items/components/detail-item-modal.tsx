import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { X, Sparkles, Calendar, User } from "lucide-react";
import type { DetailItem } from "../types";

interface DetailItemModalProps {
  item: DetailItem | null;
  isOpen: boolean;
  onClose: () => void;
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
  magical_item: "Magical Item",
};

export function DetailItemModal({
  item,
  isOpen,
  onClose,
}: DetailItemModalProps) {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {item.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="secondary"
                  className={
                    categoryColors[item.category] || "bg-gray-100 text-gray-800"
                  }
                >
                  {categoryLabels[item.category] || item.category}
                </Badge>
                {item.is_ai_generated && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    AI Generated
                  </Badge>
                )}
                {item.ai_confidence && (
                  <Badge variant="outline">
                    {Math.round(item.ai_confidence * 100)}% confidence
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {item.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {item.description}
              </p>
            </div>
          )}

          {item.metadata && Object.keys(item.metadata).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(item.metadata).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                      {key.replace(/_/g, " ")}
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white mt-1">
                      {value}
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {item.created_at && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Created {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {item.updated_at && item.updated_at !== item.created_at && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Updated {new Date(item.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {item.created_by && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <User className="h-4 w-4" />
                  <span>Created by {item.created_by}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
