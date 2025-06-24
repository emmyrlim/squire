-- Migration: Add search columns and indexes for enhanced search
-- Date: 2024-01-XX
-- Description: Adds search_vector and embedding columns to detail_items table
--              along with trigram and vector indexes for improved search capabilities

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

-- Add comments for documentation
COMMENT ON COLUMN detail_items.search_vector IS 'Full-text search vector for PostgreSQL text search';
COMMENT ON COLUMN detail_items.embedding IS 'Vector embedding for semantic search (OpenAI embedding dimension)';
COMMENT ON INDEX idx_detail_items_search_vector IS 'GIN index for full-text search on search_vector';
COMMENT ON INDEX idx_detail_items_embedding IS 'IVFFlat index for vector similarity search on embedding';
COMMENT ON INDEX idx_detail_items_name_trgm IS 'Trigram index for fuzzy matching on name field';
COMMENT ON INDEX idx_detail_items_description_trgm IS 'Trigram index for fuzzy matching on description field';
COMMENT ON INDEX idx_detail_items_category_trgm IS 'Trigram index for fuzzy matching on category field';