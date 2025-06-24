import { createClient } from "@/shared/lib/supabase.client";
import type { DetailItem } from "../types";

export interface SearchFilters {
  search?: string;
  category?: string;
  sort?: "relevance" | "created_at" | "name" | "updated_at";
  order?: "asc" | "desc";
  searchType?: "trigram" | "vector" | "hybrid" | "exact";
  similarityThreshold?: number; // For trigram search (0.1 to 1.0)
  vectorThreshold?: number; // For vector search (0.1 to 1.0)
}

export interface SearchResult extends DetailItem {
  _relevanceScore: number;
  _searchType: string;
  _similarity?: number;
}

export interface SearchStrategy {
  name: string;
  search(
    query: string,
    filters: SearchFilters,
    campaignId: string
  ): Promise<SearchResult[]>;
  weight: number;
}

export class TrigramSearch implements SearchStrategy {
  name = "trigram";
  weight = 0.6;

  async search(
    query: string,
    filters: SearchFilters,
    campaignId: string
  ): Promise<SearchResult[]> {
    const supabase = createClient();
    const threshold = filters.similarityThreshold || 0.3;

    let supabaseQuery = supabase
      .from("detail_items")
      .select("*")
      .eq("campaign_id", campaignId);

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
        supabaseQuery = supabaseQuery.eq("category", category);
      }
    }

    // Use trigram similarity search
    const { data, error } = await supabaseQuery
      .or(
        `name.similarity.gte.${threshold},description.similarity.gte.${threshold}`
      )
      .order("name", { ascending: true });

    if (error) {
      console.error("Trigram search error:", error);
      return [];
    }

    // Calculate similarity scores and filter results
    const results: SearchResult[] = [];
    for (const item of data || []) {
      const nameSimilarity = this.calculateSimilarity(query, item.name || "");
      const descSimilarity = this.calculateSimilarity(
        query,
        item.description || ""
      );
      const maxSimilarity = Math.max(nameSimilarity, descSimilarity);

      if (maxSimilarity >= threshold) {
        results.push({
          ...item,
          _relevanceScore: this.calculateRelevanceScore(
            item,
            query,
            maxSimilarity
          ),
          _searchType: "trigram",
          _similarity: maxSimilarity,
        });
      }
    }

    return results.sort((a, b) => b._relevanceScore - a._relevanceScore);
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple trigram similarity calculation
    // In production, you'd use PostgreSQL's built-in similarity function
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);

    let matches = 0;
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1.includes(word2) || word2.includes(word1)) {
          matches++;
        }
      }
    }

    return matches / Math.max(words1.length, words2.length);
  }

  private calculateRelevanceScore(
    item: DetailItem,
    query: string,
    similarity: number
  ): number {
    let score = similarity * 100;

    // Boost exact matches
    if (item.name?.toLowerCase().includes(query.toLowerCase())) {
      score += 50;
    }

    // Boost AI-generated items slightly
    if (item.is_ai_generated) {
      score += 5;
    }

    return score;
  }
}

export class VectorSearch implements SearchStrategy {
  name = "vector";
  weight = 0.4;

  async search(
    query: string,
    filters: SearchFilters,
    campaignId: string
  ): Promise<SearchResult[]> {
    // This would require embedding generation for the query
    // For now, return empty array - we'll implement this in Phase 3
    return [];
  }
}

export class HybridSearch implements SearchStrategy {
  name = "hybrid";
  weight = 1.0;

  async search(
    query: string,
    filters: SearchFilters,
    campaignId: string
  ): Promise<SearchResult[]> {
    const trigramSearch = new TrigramSearch();
    const vectorSearch = new VectorSearch();

    // Get results from both strategies
    const [trigramResults, vectorResults] = await Promise.all([
      trigramSearch.search(query, filters, campaignId),
      vectorSearch.search(query, filters, campaignId),
    ]);

    // Combine and deduplicate results
    const combined = new Map<string, SearchResult>();

    // Add trigram results
    for (const result of trigramResults) {
      combined.set(result.id, {
        ...result,
        _relevanceScore: result._relevanceScore * trigramSearch.weight,
        _searchType: "hybrid",
      });
    }

    // Add vector results (with different weight)
    for (const result of vectorResults) {
      const existing = combined.get(result.id);
      if (existing) {
        // Combine scores if item exists in both results
        existing._relevanceScore +=
          result._relevanceScore * vectorSearch.weight;
      } else {
        combined.set(result.id, {
          ...result,
          _relevanceScore: result._relevanceScore * vectorSearch.weight,
          _searchType: "hybrid",
        });
      }
    }

    return Array.from(combined.values()).sort(
      (a, b) => b._relevanceScore - a._relevanceScore
    );
  }
}

export class ExactSearch implements SearchStrategy {
  name = "exact";
  weight = 1.0;

  async search(
    query: string,
    filters: SearchFilters,
    campaignId: string
  ): Promise<SearchResult[]> {
    const supabase = createClient();

    let supabaseQuery = supabase
      .from("detail_items")
      .select("*")
      .eq("campaign_id", campaignId);

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
        supabaseQuery = supabaseQuery.eq("category", category);
      }
    }

    // Use full-text search with search_vector
    const { data, error } = await supabaseQuery
      .textSearch("search_vector", query)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Exact search error:", error);
      return [];
    }

    return (data || []).map((item) => ({
      ...item,
      _relevanceScore: this.calculateRelevanceScore(item, query),
      _searchType: "exact",
    }));
  }

  private calculateRelevanceScore(item: DetailItem, query: string): number {
    let score = 0;
    const name = (item.name || "").toLowerCase();
    const description = (item.description || "").toLowerCase();
    const queryLower = query.toLowerCase();

    // Exact name match gets highest score
    if (name === queryLower) {
      score += 100;
    }
    // Name starts with search term
    else if (name.startsWith(queryLower)) {
      score += 50;
    }
    // Name contains search term
    else if (name.includes(queryLower)) {
      score += 30;
    }

    // Description contains search term
    if (description.includes(queryLower)) {
      score += 10;
    }

    // Boost AI-generated items slightly
    if (item.is_ai_generated) {
      score += 5;
    }

    return score;
  }
}

export class SearchService {
  private strategies: Map<string, SearchStrategy> = new Map();

  constructor() {
    this.strategies.set("trigram", new TrigramSearch());
    this.strategies.set("vector", new VectorSearch());
    this.strategies.set("hybrid", new HybridSearch());
    this.strategies.set("exact", new ExactSearch());
  }

  async search(
    query: string,
    filters: SearchFilters,
    campaignId: string
  ): Promise<SearchResult[]> {
    if (!query.trim()) {
      return [];
    }

    const searchType = filters.searchType || "hybrid";
    const strategy = this.strategies.get(searchType);

    if (!strategy) {
      console.warn(
        `Unknown search type: ${searchType}, falling back to exact search`
      );
      return this.strategies.get("exact")!.search(query, filters, campaignId);
    }

    return strategy.search(query, filters, campaignId);
  }

  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
}

// Export singleton instance
export const searchService = new SearchService();
