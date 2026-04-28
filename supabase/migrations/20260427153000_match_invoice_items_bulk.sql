-- Drop the old RPC to avoid N+1 queries
DROP FUNCTION IF EXISTS match_invoice_item;

CREATE OR REPLACE FUNCTION match_invoice_items_bulk(
  search_terms TEXT[]
)
RETURNS TABLE(
  original_search_term TEXT,
  matched_id INTEGER,
  matched_name TEXT,
  similarity_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  term TEXT;
  cleaned_term TEXT;
  -- FIXED: \y used for proper PostgreSQL word boundaries
  regex_pattern TEXT := '\s*(tablet|tab|capsule|cap|mg|mcg|ml|gm|injection|inj|syrup|syr|drops|cr|sr|er|forte|plus)\y';
  match_record RECORD;
BEGIN
  -- Strict threshold: Prioritize data integrity over UX convenience
  PERFORM set_limit(0.75);

  FOREACH term IN ARRAY search_terms
  LOOP
    original_search_term := term;
    cleaned_term := TRIM(regexp_replace(LOWER(term), regex_pattern, '', 'g'));
    
    -- Default to NULL to force manual mapping on failure
    matched_id := NULL;
    matched_name := NULL;
    similarity_score := 0;

    -- Look for the highest similarity match above threshold
    SELECT 
      m.id, 
      m.name, 
      similarity(cleaned_term, TRIM(regexp_replace(LOWER(m.name), regex_pattern, '', 'g')))::NUMERIC as sim_score
    INTO match_record
    FROM medicines m
    WHERE m.is_discontinued = FALSE
      AND TRIM(regexp_replace(LOWER(m.name), regex_pattern, '', 'g')) % cleaned_term
    ORDER BY sim_score DESC
    LIMIT 1;

    -- If a high-confidence match is found, assign it
    IF FOUND THEN
      matched_id := match_record.id;
      matched_name := match_record.name;
      similarity_score := match_record.sim_score;
    END IF;

    -- Return the row for this term
    RETURN NEXT;
  END LOOP;
END;
$$;
