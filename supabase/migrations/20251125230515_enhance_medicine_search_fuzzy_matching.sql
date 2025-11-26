-- Migration to enhance medicine search with fuzzy matching and space handling
-- This addresses the issue where "predfort" doesn't find "Pred Forte"

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS search_medicines;

-- Create enhanced search function with fuzzy matching capabilities
CREATE OR REPLACE FUNCTION search_medicines(
  search_term TEXT DEFAULT '',
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE(
  id INTEGER,
  name TEXT,
  price NUMERIC,
  is_discontinued BOOLEAN,
  manufacturer_name TEXT,
  pack_size_label TEXT,
  pack_type TEXT,
  short_composition1 TEXT,
  short_composition2 TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  search_words TEXT[];
  word TEXT;
  search_pattern TEXT;
  cleaned_search_term TEXT;
BEGIN
  -- Clean the search term: lowercase and trim
  cleaned_search_term := LOWER(TRIM(search_term));

  -- If search term is empty, return popular medicines
  IF cleaned_search_term = '' THEN
    RETURN QUERY
    SELECT
      m.id,
      m.name,
      m.price,
      m.is_discontinued,
      m.manufacturer_name,
      m.pack_size_label,
      m.pack_type,
      m.short_composition1,
      m.short_composition2,
      m.created_at
    FROM medicines m
    WHERE m.is_discontinued = FALSE
    ORDER BY
      -- Prioritize common medicines first
      CASE
        WHEN m.name ILIKE '%paracetamol%' THEN 1
        WHEN m.name ILIKE '%ibuprofen%' THEN 2
        WHEN m.name ILIKE '%amoxicillin%' THEN 3
        WHEN m.name ILIKE '%vitamin%' THEN 4
        ELSE 5
      END,
      m.name
    LIMIT limit_count;
    RETURN;
  END IF;

  -- Split search term into words for multi-word matching
  search_words := string_to_array(cleaned_search_term, ' ');

  -- Build search query with multiple matching strategies
  RETURN QUERY
  SELECT
    m.id,
    m.name,
    m.price,
    m.is_discontinued,
    m.manufacturer_name,
    m.pack_size_label,
    m.pack_type,
    m.short_composition1,
    m.short_composition2,
    m.created_at
  FROM medicines m
  WHERE m.is_discontinued = FALSE
    AND (
      -- Strategy 1: Exact match (highest priority)
      m.name ILIKE '%' || cleaned_search_term || '%'
      OR m.short_composition1 ILIKE '%' || cleaned_search_term || '%'
      OR m.short_composition2 ILIKE '%' || cleaned_search_term || '%'
      OR m.manufacturer_name ILIKE '%' || cleaned_search_term || '%'

      -- Strategy 2: Multi-word matching (medium priority)
      OR (
        array_length(search_words, 1) > 1
        AND (
          -- All words must appear somewhere in the name
          (SELECT COUNT(*) FROM unnest(search_words) AS word
           WHERE m.name ILIKE '%' || word || '%') = array_length(search_words, 1)
          OR
          -- All words must appear somewhere in composition
          (SELECT COUNT(*) FROM unnest(search_words) AS word
           WHERE (m.short_composition1 ILIKE '%' || word || '%' OR
                  m.short_composition2 ILIKE '%' || word || '%')) = array_length(search_words, 1)
        )
      )

      -- Strategy 3: Space-insensitive matching (for cases like "predfort" -> "pred forte")
      OR (
        array_length(search_words, 1) = 1
        AND (
          -- Match against name with spaces removed
          REPLACE(LOWER(m.name), ' ', '') LIKE '%' || cleaned_search_term || '%'
          OR REPLACE(LOWER(m.short_composition1), ' ', '') LIKE '%' || cleaned_search_term || '%'
          OR REPLACE(LOWER(m.short_composition2), ' ', '') LIKE '%' || cleaned_search_term || '%'
        )
      )

      -- Strategy 4: Partial word matching (lower priority)
      OR (
        array_length(search_words, 1) = 1
        AND (
          -- Match any word in the name that starts with the search term
          EXISTS (
            SELECT 1 FROM unnest(string_to_array(LOWER(m.name), ' ')) AS name_word
            WHERE name_word LIKE cleaned_search_term || '%'
          )
          OR
          -- Match any word in composition that starts with the search term
          EXISTS (
            SELECT 1 FROM unnest(
              string_to_array(
                COALESCE(LOWER(m.short_composition1), '') || ' ' ||
                COALESCE(LOWER(m.short_composition2), ''), ' '
              )
            ) AS comp_word
            WHERE comp_word LIKE cleaned_search_term || '%'
          )
        )
      )
    )
  ORDER BY
    -- Priority 1: Exact matches first
    CASE
      WHEN m.name ILIKE '%' || cleaned_search_term || '%' THEN 1
      WHEN m.short_composition1 ILIKE '%' || cleaned_search_term || '%' THEN 2
      WHEN m.short_composition2 ILIKE '%' || cleaned_search_term || '%' THEN 3
      WHEN m.manufacturer_name ILIKE '%' || cleaned_search_term || '%' THEN 4
      ELSE 5
    END,
    -- Priority 2: Multi-word exact matches
    CASE
      WHEN array_length(search_words, 1) > 1 AND
           (SELECT COUNT(*) FROM unnest(search_words) AS word
            WHERE m.name ILIKE '%' || word || '%') = array_length(search_words, 1) THEN 1
      ELSE 2
    END,
    -- Priority 3: Space-insensitive matches
    CASE
      WHEN REPLACE(LOWER(m.name), ' ', '') LIKE '%' || cleaned_search_term || '%' THEN 1
      ELSE 2
    END,
    -- Priority 4: Partial word matches
    CASE
      WHEN EXISTS (
        SELECT 1 FROM unnest(string_to_array(LOWER(m.name), ' ')) AS name_word
        WHERE name_word LIKE cleaned_search_term || '%'
      ) THEN 1
      ELSE 2
    END,
    -- Final ordering by name
    m.name
  LIMIT limit_count;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION search_medicines IS 'Enhanced medicine search with fuzzy matching, space handling, and multiple search strategies. Handles cases like "predfort" finding "Pred Forte".';

-- Test the function with common search patterns
-- SELECT * FROM search_medicines('predfort', 10); -- Should find "Pred Forte"
-- SELECT * FROM search_medicines('pred forte', 10); -- Should find "Pred Forte"
-- SELECT * FROM search_medicines('paracet', 10); -- Should find "Paracetamol"
-- SELECT * FROM search_medicines('amox', 10); -- Should find "Amoxicillin"