import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDetailItems,
  subscribeToDetailItems,
  type DetailItemsFilters,
} from "../services/detail-items-api";
import { createClient } from "@/shared/lib/supabase.client";
import type { DetailItem } from "../types";
import { useDebounce } from "~/shared/hooks/use-debounce";
import { SupabaseClient } from "@supabase/supabase-js";

export function useDetailItems(campaignId: string) {
  const queryClient = useQueryClient();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    // Only run on client
    const supabase = createClient();
    setSupabase(supabase);
  }, []);

  const [filters, setFilters] = useState<DetailItemsFilters>({
    search: "",
    category: "All",
    sort: "created_at",
    order: "desc",
  });

  const debouncedFilters = useDebounce(filters, 500);

  const query = useQuery({
    queryKey: [
      "detail-items",
      campaignId,
      debouncedFilters,
      supabase?.auth.getUser(),
    ],
    queryFn: () =>
      supabase ? getDetailItems(campaignId, supabase, filters) : [],
    staleTime: 1000 * 60, // 1 minute
  });

  // Real-time subscription for live updates
  useEffect(() => {
    if (!supabase) return;
    const subscription = subscribeToDetailItems(
      campaignId,
      supabase,
      (detailItem) => {
        console.log("Received real-time detail item update:", detailItem);

        // Update the query cache with the new/updated item
        queryClient.setQueryData<DetailItem[]>(
          ["detail-items", campaignId, filters],
          (oldItems) => {
            if (!oldItems) return [detailItem];

            // Check if item already exists (for updates)
            const existingIndex = oldItems.findIndex(
              (item) => item.id === detailItem.id
            );

            if (existingIndex >= 0) {
              // Update existing item
              const updatedItems = [...oldItems];
              updatedItems[existingIndex] = detailItem;
              return updatedItems;
            } else {
              // Add new item at the beginning (since we sort by created_at desc)
              return [detailItem, ...oldItems];
            }
          }
        );
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [campaignId, supabase, filters, queryClient]);

  const updateFilters = (newFilters: Partial<DetailItemsFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "All",
      sort: "created_at",
      order: "desc",
    });
  };

  return {
    items: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    filters,
    updateFilters,
    clearFilters,
  };
}
