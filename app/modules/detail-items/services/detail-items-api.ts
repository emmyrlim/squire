import { createClient } from "@/shared/lib/supabase.client";
import {
  searchService,
  type SearchFilters as EnhancedSearchFilters,
} from "./search-service";
import type { DetailItem } from "../types";

export interface DetailItemsFilters {
  search?: string;
  category?: string;
  sort?: "name" | "created_at" | "updated_at" | "relevance";
  order?: "asc" | "desc";
  // Enhanced search options
  searchType?: "trigram" | "vector" | "hybrid" | "exact";
  similarityThreshold?: number;
  vectorThreshold?: number;
}

export interface DetailItemsSubscription {
  unsubscribe: () => void;
}

export async function getDetailItems(
  campaignId: string,
  filters: DetailItemsFilters = {}
): Promise<DetailItem[]> {
  const supabase = createClient();

  // If there's a search query, use the enhanced search service
  if (
    filters.searchType !== "exact" &&
    filters.search &&
    filters.search.trim()
  ) {
    const searchTerm = filters.search.trim();
    console.log("Using enhanced search for:", searchTerm);

    try {
      // Convert to enhanced search filters
      const enhancedFilters: EnhancedSearchFilters = {
        search: searchTerm,
        category: filters.category,
        sort: filters.sort,
        order: filters.order,
        searchType: filters.searchType || "hybrid",
        similarityThreshold: filters.similarityThreshold,
        vectorThreshold: filters.vectorThreshold,
      };

      const searchResults = await searchService.search(
        searchTerm,
        enhancedFilters,
        campaignId
      );

      // Convert back to DetailItem format (remove search-specific fields)
      const results = searchResults.map((result) => ({
        id: result.id,
        campaign_id: result.campaign_id,
        slug: result.slug,
        name: result.name,
        category: result.category,
        description: result.description,
        metadata: result.metadata,
        source_session_id: result.source_session_id,
        ai_confidence: result.ai_confidence,
        is_ai_generated: result.is_ai_generated,
        created_by: result.created_by,
        created_at: result.created_at,
        updated_at: result.updated_at,
      }));

      console.log(
        `Found ${results.length} items using ${enhancedFilters.searchType} search`
      );
      return results;
    } catch (error) {
      console.error(
        "Enhanced search failed, falling back to basic search:",
        error
      );
      // Fall back to basic search if enhanced search fails
    }
  }

  // Fallback to original ILIKE search for backward compatibility
  let query = supabase
    .from("detail_items")
    .select("*")
    .eq("campaign_id", campaignId);

  console.log("filters", filters);

  // Apply search filter with improved full-text search
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim();
    console.log("Using fallback ILIKE search for:", searchTerm);

    // Use ILIKE for all search terms (more reliable with Supabase)
    // This provides case-insensitive substring matching
    query = query.or(
      `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
    );

    console.log("Using ILIKE search for:", searchTerm);
  }

  // Apply category filter
  if (filters.category && filters.category !== "All") {
    const categoryMap: Record<string, string> = {
      NPCs: "npc",
      Locations: "location",
      Monsters: "monster",
      Quests: "quest",
      Mysteries: "mystery",
      Items: "magical_item",
    };
    const category = categoryMap[filters.category];
    if (category) {
      query = query.eq("category", category);
    }
  }

  // Apply sorting
  const sortField = filters.sort || "created_at";
  const sortOrder = filters.order || "desc";

  if (sortField === "relevance" && filters.search) {
    // For relevance sorting, we'll do it in JavaScript after fetching
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order(sortField, { ascending: sortOrder === "asc" });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching detail items:", error);
    throw new Error("Failed to fetch detail items");
  }

  // Post-process results for better relevance ranking
  let results = data || [];

  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim().toLowerCase();

    // Custom relevance scoring
    results = results
      .map((item) => ({
        ...item,
        _relevanceScore: calculateRelevanceScore(item, searchTerm),
      }))
      .sort((a, b) => {
        // Sort by relevance score (higher first)
        if (a._relevanceScore !== b._relevanceScore) {
          return b._relevanceScore - a._relevanceScore;
        }
        // Then by creation date (newer first)
        return (
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
        );
      });

    console.log(
      `Found ${results.length} items for search term: "${searchTerm}"`
    );
  }

  return results;
}

// Calculate relevance score for better ranking
function calculateRelevanceScore(item: DetailItem, searchTerm: string): number {
  let score = 0;
  const name = (item.name || "").toLowerCase();
  const description = (item.description || "").toLowerCase();

  // Exact name match gets highest score
  if (name === searchTerm) {
    score += 100;
  }
  // Name starts with search term
  else if (name.startsWith(searchTerm)) {
    score += 50;
  }
  // Name contains search term
  else if (name.includes(searchTerm)) {
    score += 30;
  }

  // Description contains search term
  if (description.includes(searchTerm)) {
    score += 10;
  }

  // Boost AI-generated items slightly
  if (item.is_ai_generated) {
    score += 5;
  }

  return score;
}

export async function getDetailItem(
  campaignId: string,
  itemId: string
): Promise<DetailItem | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("detail_items")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("id", itemId)
    .single();

  if (error) {
    console.error("Error fetching detail item:", error);
    throw new Error("Failed to fetch detail item");
  }

  return data;
}

export function subscribeToDetailItems(
  campaignId: string,
  onUpdate: (detailItem: DetailItem) => void
): DetailItemsSubscription {
  const supabase = createClient();

  const subscription = supabase
    .channel(`detail_items:${campaignId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "detail_items",
        filter: `campaign_id=eq.${campaignId}`,
      },
      (payload) => {
        console.log("Detail item real-time update:", payload);

        if (payload.eventType === "INSERT") {
          onUpdate(payload.new as DetailItem);
        } else if (payload.eventType === "UPDATE") {
          onUpdate(payload.new as DetailItem);
        } else if (payload.eventType === "DELETE") {
          // Handle deletion if needed
          console.log("Detail item deleted:", payload.old);
        }
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      subscription.unsubscribe();
    },
  };
}
