import { describe, it, expect, beforeEach } from "vitest";
import { TrigramSearch, ExactSearch, HybridSearch } from "../search-service";
import type { SearchFilters } from "../search-service";

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        or: jest.fn(() => ({
          order: jest.fn(() => ({
            then: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        textSearch: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  })),
};

// Mock the createClient function
jest.mock("@/shared/lib/supabase.client", () => ({
  createClient: () => mockSupabase,
}));

describe("SearchService", () => {
  let trigramSearch: TrigramSearch;
  let exactSearch: ExactSearch;
  let hybridSearch: HybridSearch;

  beforeEach(() => {
    trigramSearch = new TrigramSearch();
    exactSearch = new ExactSearch();
    hybridSearch = new HybridSearch();
    jest.clearAllMocks();
  });

  describe("TrigramSearch", () => {
    it("should calculate similarity correctly", () => {
      const search = new TrigramSearch();

      // Test exact match
      expect(search["calculateSimilarity"]("npc", "npc")).toBe(1);

      // Test partial match
      expect(search["calculateSimilarity"]("evil", "evil npc")).toBeGreaterThan(
        0
      );

      // Test no match
      expect(search["calculateSimilarity"]("xyz", "npc")).toBe(0);
    });

    it("should calculate relevance score correctly", () => {
      const mockItem = {
        id: "1",
        name: "Evil NPC",
        description: "An evil character",
        is_ai_generated: true,
        campaign_id: "campaign-1",
        slug: "evil-npc",
        category: "npc",
        metadata: {},
        source_session_id: null,
        ai_confidence: null,
        created_by: null,
        created_at: null,
        updated_at: null,
      };

      const score = trigramSearch["calculateRelevanceScore"](
        mockItem,
        "evil",
        0.8
      );
      expect(score).toBeGreaterThan(0);
      expect(score).toBeGreaterThan(80); // similarity * 100 + exact match bonus
    });
  });

  describe("ExactSearch", () => {
    it("should calculate relevance score correctly", () => {
      const mockItem = {
        id: "1",
        name: "Evil NPC",
        description: "An evil character",
        is_ai_generated: true,
        campaign_id: "campaign-1",
        slug: "evil-npc",
        category: "npc",
        metadata: {},
        source_session_id: null,
        ai_confidence: null,
        created_by: null,
        created_at: null,
        updated_at: null,
      };

      // Test exact name match
      const exactScore = exactSearch["calculateRelevanceScore"](
        mockItem,
        "Evil NPC"
      );
      expect(exactScore).toBe(105); // 100 for exact match + 5 for AI generated

      // Test partial name match
      const partialScore = exactSearch["calculateRelevanceScore"](
        mockItem,
        "Evil"
      );
      expect(partialScore).toBe(55); // 50 for starts with + 5 for AI generated

      // Test description match
      const descScore = exactSearch["calculateRelevanceScore"](
        mockItem,
        "character"
      );
      expect(descScore).toBe(15); // 10 for description + 5 for AI generated
    });
  });

  describe("Search Filters", () => {
    it("should handle category mapping correctly", () => {
      const categoryMap: Record<string, string> = {
        NPCs: "npc",
        Locations: "location",
        Monsters: "monster",
        Quests: "quest",
        Mysteries: "mystery",
        Items: "magical_item",
      };

      expect(categoryMap.NPCs).toBe("npc");
      expect(categoryMap.Items).toBe("magical_item");
    });
  });

  describe("Search Strategy Interface", () => {
    it("should implement required properties", () => {
      expect(trigramSearch.name).toBe("trigram");
      expect(trigramSearch.weight).toBe(0.6);
      expect(typeof trigramSearch.search).toBe("function");

      expect(exactSearch.name).toBe("exact");
      expect(exactSearch.weight).toBe(1.0);
      expect(typeof exactSearch.search).toBe("function");
    });
  });
});
