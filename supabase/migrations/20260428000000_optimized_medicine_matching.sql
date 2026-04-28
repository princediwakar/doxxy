-- ============================================================
-- Form-aware medicine matching
-- 
-- Strategy:
--   Pass 1: match on name similarity AND form type match
--   Pass 2: fallback to name-only if no form match found
--
-- This fixes: ONDEM INJ → Ondem Syrup, LEVIPIL CAP → Levipil Tablet, etc.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── Generated columns ─────────────────────────────────────────────────────────

-- name without form/units (for candidate retrieval)
ALTER TABLE medicines
  ADD COLUMN IF NOT EXISTS name_normalized TEXT
    GENERATED ALWAYS AS (
      TRIM(
        regexp_replace(
          LOWER(name),
          '\s*(tablet|tab|capsule|cap|mg|mcg|ml|gm|injection|inj|syrup|syr|drops|cr|sr|er|forte|plus|solution|sol|cream|oint|ointment|gel|lotion|powder|pwd|spray|inhaler|patch|suppository|supp)\y',
          '',
          'g'
        )
      )
    ) STORED;

-- canonical form token extracted from name
-- produces one of: TAB, CAP, INJ, SYR, DROP, CREAM, GEL, OTHER
ALTER TABLE medicines
  ADD COLUMN IF NOT EXISTS form_canonical TEXT
    GENERATED ALWAYS AS (
      CASE
        WHEN name ~* '\y(tablet|tab)\y'                          THEN 'TAB'
        WHEN name ~* '\y(capsule|cap)\y'                         THEN 'CAP'
        WHEN name ~* '\y(injection|inj|vial)\y'                  THEN 'INJ'
        WHEN name ~* '\y(syrup|syr|suspension|susp|solution|sol)\y' THEN 'SYR'
        WHEN name ~* '\y(drops|drop)\y'                          THEN 'DROP'
        WHEN name ~* '\y(cream|oint|ointment|gel|lotion)\y'      THEN 'TOPICAL'
        ELSE 'OTHER'
      END
    ) STORED;

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_medicines_name_normalized_trgm
  ON medicines USING GIN (name_normalized gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_medicines_form_canonical
  ON medicines (form_canonical);

CREATE INDEX IF NOT EXISTS idx_medicines_active
  ON medicines (is_discontinued) WHERE is_discontinued = FALSE;

-- ── Helper: extract canonical form from a raw search term ─────────────────────

CREATE OR REPLACE FUNCTION extract_form_canonical(term TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE STRICT
AS $$
  SELECT CASE
    WHEN term ~* '\y(tablet|tab)\y'                             THEN 'TAB'
    WHEN term ~* '\y(capsule|cap)\y'                            THEN 'CAP'
    WHEN term ~* '\y(injection|inj|vial)\y'                     THEN 'INJ'
    WHEN term ~* '\y(syrup|syr|suspension|susp|solution|sol)\y' THEN 'SYR'
    WHEN term ~* '\y(drops|drop)\y'                             THEN 'DROP'
    WHEN term ~* '\y(cream|oint|ointment|gel|lotion)\y'         THEN 'TOPICAL'
    ELSE NULL  -- NULL means "unknown form — don't filter"
  END;
$$;

-- ── Helper: normalize a term (strip form + units) ─────────────────────────────

CREATE OR REPLACE FUNCTION normalize_medicine_term(term TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE STRICT
AS $$
  SELECT TRIM(
    regexp_replace(
      LOWER(term),
      '\s*(tablet|tab|capsule|cap|mg|mcg|ml|gm|injection|inj|syrup|syr|drops|drop|cr|sr|er|forte|plus|solution|sol|cream|oint|gel|lotion|powder|spray|inhaler|vial|susp|suspension)\y',
      '',
      'g'
    )
  );
$$;

-- ── Drop old functions ────────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS match_invoice_items_bulk(TEXT[]);
DROP FUNCTION IF EXISTS match_invoice_item_single(TEXT);

-- ── Bulk match — form-aware ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION match_invoice_items_bulk(
  search_terms TEXT[]
)
RETURNS TABLE(
  original_search_term TEXT,
  matched_id           INTEGER,
  matched_name         TEXT,
  similarity_score     NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '10s'
AS $$
DECLARE
  term         TEXT;
  cleaned_term TEXT;
  form_type    TEXT;
  r            RECORD;
BEGIN
  PERFORM set_limit(0.80);

  FOREACH term IN ARRAY search_terms
  LOOP
    original_search_term := term;
    cleaned_term         := normalize_medicine_term(term);
    form_type            := extract_form_canonical(term);

    matched_id       := NULL;
    matched_name     := NULL;
    similarity_score := 0;

    -- ── Pass 1: name similarity + form must match ────────────────────────
    IF form_type IS NOT NULL THEN
      SELECT
        m.id,
        m.name,
        similarity(m.name_normalized, cleaned_term)::NUMERIC AS sim
      INTO r
      FROM medicines m
      WHERE m.is_discontinued = FALSE
        AND m.form_canonical = form_type
        AND m.name_normalized % cleaned_term
      ORDER BY similarity(m.name_normalized, cleaned_term) DESC
      LIMIT 1;

      IF FOUND AND r.id IS NOT NULL THEN
        matched_id       := r.id;
        matched_name     := r.name;
        similarity_score := r.sim;
        RETURN NEXT;
        CONTINUE;
      END IF;
    END IF;

    -- ── Pass 2: name-only fallback (form unknown or no form match) ───────
    SELECT
      m.id,
      m.name,
      similarity(m.name_normalized, cleaned_term)::NUMERIC AS sim
    INTO r
    FROM medicines m
    WHERE m.is_discontinued = FALSE
      AND m.name_normalized % cleaned_term
    ORDER BY similarity(m.name_normalized, cleaned_term) DESC
    LIMIT 1;

    IF FOUND AND r.id IS NOT NULL THEN
      matched_id       := r.id;
      matched_name     := r.name;
      similarity_score := r.sim;
    END IF;

    RETURN NEXT;
  END LOOP;
END;
$$;

-- ── Single match — form-aware fallback ───────────────────────────────────────

CREATE OR REPLACE FUNCTION match_invoice_item_single(
  search_term TEXT
)
RETURNS TABLE(
  original_search_term TEXT,
  matched_id           INTEGER,
  matched_name         TEXT,
  similarity_score     NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '5s'
AS $$
DECLARE
  cleaned_term TEXT;
  form_type    TEXT;
  r            RECORD;
BEGIN
  PERFORM set_limit(0.30);

  original_search_term := search_term;
  cleaned_term         := normalize_medicine_term(search_term);
  form_type            := extract_form_canonical(search_term);

  matched_id       := NULL;
  matched_name     := NULL;
  similarity_score := 0;

  -- Pass 1: with form filter
  IF form_type IS NOT NULL THEN
    SELECT m.id, m.name, similarity(m.name_normalized, cleaned_term)::NUMERIC AS sim
    INTO r
    FROM medicines m
    WHERE m.is_discontinued = FALSE
      AND m.form_canonical = form_type
      AND m.name_normalized % cleaned_term
    ORDER BY similarity(m.name_normalized, cleaned_term) DESC
    LIMIT 1;

    IF FOUND AND r.id IS NOT NULL THEN
      matched_id       := r.id;
      matched_name     := r.name;
      similarity_score := r.sim;
      RETURN NEXT;
      RETURN;
    END IF;
  END IF;

  -- Pass 2: name-only fallback
  SELECT m.id, m.name, similarity(m.name_normalized, cleaned_term)::NUMERIC AS sim
  INTO r
  FROM medicines m
  WHERE m.is_discontinued = FALSE
    AND m.name_normalized % cleaned_term
  ORDER BY similarity(m.name_normalized, cleaned_term) DESC
  LIMIT 1;

  IF FOUND AND r.id IS NOT NULL THEN
    matched_id       := r.id;
    matched_name     := r.name;
    similarity_score := r.sim;
  END IF;

  RETURN NEXT;
END;
$$;

-- ── Grants ────────────────────────────────────────────────────────────────────

GRANT EXECUTE ON FUNCTION extract_form_canonical(TEXT)      TO authenticated;
GRANT EXECUTE ON FUNCTION normalize_medicine_term(TEXT)     TO authenticated;
GRANT EXECUTE ON FUNCTION match_invoice_items_bulk(TEXT[])  TO authenticated;
GRANT EXECUTE ON FUNCTION match_invoice_item_single(TEXT)   TO authenticated;

