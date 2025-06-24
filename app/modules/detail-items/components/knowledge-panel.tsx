import { useState, useEffect, useRef } from "react";
import { Input } from "@/shared/components/ui/input";
import { Search, Loader2, SortAsc } from "lucide-react";
import { useDetailItems } from "../hooks/use-detail-items";
import { DetailItemsGrid } from "./detail-items-grid";
import { DetailItemModal } from "./detail-item-modal";
import { SearchAdvancedToggle } from "./search-advanced-toggle";
import type { DetailItem } from "../types";

interface KnowledgePanelProps {
  campaignId: string;
}

export function KnowledgePanel({ campaignId }: KnowledgePanelProps) {
  const [selectedItem, setSelectedItem] = useState<DetailItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Advanced search state
  const [searchType, setSearchType] = useState<
    "hybrid" | "trigram" | "vector" | "exact"
  >("hybrid");
  const [similarityThreshold, setSimilarityThreshold] = useState(0.3);

  const { items, isLoading, error, filters, updateFilters } =
    useDetailItems(campaignId);

  // Click outside handler for sort dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSortOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    updateFilters({
      search: searchTerm,
      searchType,
      similarityThreshold,
    });

    // Auto-sort by relevance when searching
    if (searchTerm.trim()) {
      updateFilters({ sort: "relevance" });
    } else {
      updateFilters({ sort: "created_at" });
    }
  };

  const handleSearchTypeChange = (
    type: "hybrid" | "trigram" | "vector" | "exact"
  ) => {
    setSearchType(type);
    updateFilters({
      searchType: type,
      similarityThreshold,
    });
  };

  const handleSimilarityThresholdChange = (value: number) => {
    setSimilarityThreshold(value);
    updateFilters({
      searchType,
      similarityThreshold: value,
    });
  };

  const handleCategoryClick = (category: string) => {
    updateFilters({ category });
  };

  const handleSortChange = (
    sort: "relevance" | "created_at" | "name" | "updated_at"
  ) => {
    updateFilters({ sort });
    setShowSortOptions(false);
  };

  const handleItemClick = (item: DetailItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const categories = [
    "All",
    "NPCs",
    "Locations",
    "Monsters",
    "Quests",
    "Mysteries",
    "Items",
  ];

  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "created_at", label: "Newest First" },
    { value: "name", label: "Name A-Z" },
    { value: "updated_at", label: "Recently Updated" },
  ];

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === filters.sort)?.label || "Sort";

  return (
    <div className="h-full flex flex-col">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search knowledge base..."
              className="pl-10"
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>

          {/* Advanced Search Toggle */}
          <SearchAdvancedToggle
            searchType={searchType}
            similarityThreshold={similarityThreshold}
            onSearchTypeChange={handleSearchTypeChange}
            onSimilarityThresholdChange={handleSimilarityThresholdChange}
          />
        </div>
      </div>

      {/* Category Filters and Sort */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filters.category === category
                  ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="relative" ref={sortDropdownRef}>
          <button
            onClick={() => setShowSortOptions(!showSortOptions)}
            className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <SortAsc />
            {currentSortLabel}
          </button>

          {showSortOptions && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 min-w-[150px]">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    handleSortChange(
                      option.value as
                        | "relevance"
                        | "created_at"
                        | "name"
                        | "updated_at"
                    )
                  }
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    filters.sort === option.value
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Items Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-red-500 dark:text-red-400 mb-2">
              Error loading items
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Please try refreshing the page
            </p>
          </div>
        ) : (
          <DetailItemsGrid items={items} onItemClick={handleItemClick} />
        )}
      </div>

      {/* Detail Item Modal */}
      <DetailItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
