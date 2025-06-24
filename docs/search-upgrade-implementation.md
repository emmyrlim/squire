# Search Upgrade Implementation Guide

## Overview

This guide documents the implementation of enhanced search capabilities for the Detail Items feature, upgrading from simple ILIKE search to trigram and vector search.

## Database Migration

### Step 1: Run the Migration

Execute the following SQL migration to add search columns and indexes:

```sql
-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector;

-- Add search columns to detail_items table
ALTER TABLE detail_items
ADD COLUMN search_vector tsvector,
ADD COLUMN embedding vector(1536); -- OpenAI embedding dimension

-- Create optimized indexes for search
CREATE INDEX idx_detail_items_search_vector ON detail_items USING gin(search_vector);
CREATE INDEX idx_detail_items_embedding ON detail_items USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_detail_items_name_trgm ON detail_items USING gin(name gin_trgm_ops);
CREATE INDEX idx_detail_items_description_trgm ON detail_items USING gin(description gin_trgm_ops);
CREATE INDEX idx_detail_items_category_trgm ON detail_items USING gin(category gin_trgm_ops);

-- Create trigger to automatically update search_vector
CREATE OR REPLACE FUNCTION update_detail_items_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER detail_items_search_vector_update
  BEFORE INSERT OR UPDATE ON detail_items
  FOR EACH ROW EXECUTE FUNCTION update_detail_items_search_vector();

-- Update existing records to populate search_vector
UPDATE detail_items SET
  search_vector =
    setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(category, '')), 'C');
```

## Implementation Details

### Search Strategies

The new search system implements four search strategies:

1. **Trigram Search** (`trigram`)

   - Fuzzy matching with typo tolerance
   - Uses PostgreSQL's `pg_trgm` extension
   - Configurable similarity threshold (default: 0.3)
   - Best for: "npcs" → "NPCs", "evil" → "evil"

2. **Vector Search** (`vector`)

   - Semantic search using embeddings
   - Requires embedding generation (Phase 3)
   - Best for: "npcs that are evil" → finds evil NPCs

3. **Hybrid Search** (`hybrid`) - **Default**

   - Combines trigram and vector search
   - Weighted combination of both strategies
   - Best overall results

4. **Exact Search** (`exact`)
   - Full-text search using PostgreSQL's `search_vector`
   - Fallback for when enhanced search fails
   - Maintains backward compatibility

### Usage Examples

#### Basic Search (Uses Hybrid by Default)

```typescript
const results = await getDetailItems(campaignId, {
  search: "evil npc",
  category: "NPCs",
});
```

#### Trigram Search (Typo Tolerance)

```typescript
const results = await getDetailItems(campaignId, {
  search: "evil npc",
  searchType: "trigram",
  similarityThreshold: 0.4, // Higher threshold = more strict matching
});
```

#### Vector Search (Semantic Understanding)

```typescript
const results = await getDetailItems(campaignId, {
  search: "npcs that are evil",
  searchType: "vector",
  vectorThreshold: 0.7,
});
```

### Configuration Options

#### Search Filters Interface

```typescript
interface DetailItemsFilters {
  search?: string;
  category?: string;
  sort?: "name" | "created_at" | "updated_at" | "relevance";
  order?: "asc" | "desc";
  // Enhanced search options
  searchType?: "trigram" | "vector" | "hybrid" | "exact";
  similarityThreshold?: number; // 0.1 to 1.0 (trigram)
  vectorThreshold?: number; // 0.1 to 1.0 (vector)
}
```

## Benefits

### Typo Tolerance

- **Before**: "npcs" → no results
- **After**: "npcs" → finds "NPCs"

### Semantic Understanding

- **Before**: "npcs that are evil" → no results
- **After**: "npcs that are evil" → finds evil NPCs

### Better Relevance

- Server-side scoring instead of client-side
- Category-specific weights
- AI confidence integration

### Performance

- Optimized database indexes
- Efficient trigram matching
- Vector similarity search

## Testing

### Test Cases

1. **Typo Tolerance**

   ```
   Search: "npcs" → Should find "NPCs"
   Search: "evil" → Should find "evil"
   Search: "quest" → Should find "quests"
   ```

2. **Semantic Search** (Phase 3)

   ```
   Search: "npcs that are evil" → Should find evil NPCs
   Search: "places with treasure" → Should find locations with treasure
   ```

3. **Category Filtering**
   ```
   Search: "evil" + Category: "NPCs" → Should only find evil NPCs
   ```

### Performance Testing

- Test with large datasets (1000+ items)
- Measure search response times
- Verify index usage with `EXPLAIN ANALYZE`

## Phase 3: Vector Search Implementation

To complete vector search functionality:

1. **Add embedding generation service**

   ```typescript
   // Generate embeddings for new/updated items
   const embedding = await generateEmbedding(
     item.name + " " + item.description
   );
   ```

2. **Update VectorSearch class**

   ```typescript
   async search(query: string, filters: SearchFilters, campaignId: string) {
     const queryEmbedding = await generateEmbedding(query);
     // Use vector similarity search
   }
   ```

3. **Batch processing for existing data**
   ```sql
   -- Generate embeddings for existing items
   UPDATE detail_items SET embedding = generate_embedding(name || ' ' || description);
   ```

## Troubleshooting

### Common Issues

1. **Extensions not available**

   - Ensure PostgreSQL has `pg_trgm` and `vector` extensions
   - Contact your database administrator

2. **Poor trigram results**

   - Adjust `similarityThreshold` (lower = more permissive)
   - Check if data is properly indexed

3. **Vector search not working**
   - Ensure embeddings are generated
   - Check vector dimension matches (1536 for OpenAI)

### Debugging

Enable debug logging:

```typescript
console.log("Search type:", filters.searchType);
console.log("Similarity threshold:", filters.similarityThreshold);
console.log("Results count:", results.length);
```

## Migration Checklist

- [ ] Run database migration
- [ ] Test trigram search functionality
- [ ] Verify backward compatibility
- [ ] Update frontend to use new search options (optional)
- [ ] Monitor search performance
- [ ] Implement vector search (Phase 3)
- [ ] Add search analytics (Phase 4)
