import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Settings, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { Slider } from "@/shared/components/ui/slider";

interface SearchAdvancedToggleProps {
  searchType: "hybrid" | "trigram" | "vector" | "exact";
  similarityThreshold: number;
  onSearchTypeChange: (type: "hybrid" | "trigram" | "vector" | "exact") => void;
  onSimilarityThresholdChange: (value: number) => void;
}

export function SearchAdvancedToggle({
  searchType,
  similarityThreshold,
  onSearchTypeChange,
  onSimilarityThresholdChange,
}: SearchAdvancedToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const searchTypeOptions = [
    {
      value: "hybrid",
      label: "Smart Search (Recommended)",
      description: "Best overall results",
    },
    {
      value: "trigram",
      label: "Fuzzy Search",
      description: "Handles typos and similar spellings",
    },
    {
      value: "exact",
      label: "Exact Search",
      description: "Traditional word matching",
    },
    {
      value: "vector",
      label: "Semantic Search",
      description: "Understands meaning (Coming Soon)",
    },
  ];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-8 w-8 p-0"
      >
        <Settings className="h-4 w-4" />
      </Button>

      {isExpanded && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Advanced Search</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="search-type" className="text-xs font-medium">
                Search Type
              </Label>
              <Select value={searchType} onValueChange={onSearchTypeChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {searchTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">
                          {option.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {searchType === "trigram" && (
              <div>
                <Label className="text-xs font-medium">
                  Similarity Threshold: {similarityThreshold}
                </Label>
                <Slider
                  value={[similarityThreshold]}
                  onValueChange={([value]) =>
                    onSimilarityThresholdChange(value)
                  }
                  max={1}
                  min={0.1}
                  step={0.1}
                  className="mt-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Lower = more permissive, Higher = more strict
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 pt-2 border-t">
              <strong>Smart Search</strong> automatically chooses the best
              method for your query. Use advanced options for specific needs.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
