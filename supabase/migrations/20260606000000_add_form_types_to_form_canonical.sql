-- ============================================================
-- Expand form_canonical to recognize additional form types
-- Adds: POWDER, SACHET, KIT, GRANULES, SUPPOSITORY, INHALER,
--       NASAL SPRAY, INFUSION, LIQUID, SOFTGEL, DEVICE,
--       CARTRIDGE, OCTACAP, SYRINGE, SERUM, SUNSCREEN
-- ============================================================

-- ── form_canonical generated column ────────────────────────────────────────

ALTER TABLE medicines DROP COLUMN IF EXISTS form_canonical;

ALTER TABLE medicines
  ADD COLUMN form_canonical TEXT
    GENERATED ALWAYS AS (
      CASE
        WHEN name ~* '\y(tablet|tab)\y'                          THEN 'TAB'
        WHEN name ~* '\y(capsule|cap)\y'                         THEN 'CAP'
        WHEN name ~* '\y(injection|inj|vial|syringe)\y'          THEN 'INJ'
        WHEN name ~* '\y(syrup|syr|suspension|susp|solution|sol|redimix|dry\s*syr)\y' THEN 'SYR'
        WHEN name ~* '\y(drops|drop)\y'                          THEN 'DROP'
        WHEN name ~* '\y(cream|oint|ointment|gel|lotion|shampoo|soap|lacquer|serum|sunscreen)\y' THEN 'TOPICAL'
        WHEN name ~* '\y(powder|pwd|dusting)\y'                  THEN 'PWD'
        WHEN name ~* '\y(sachet)\y'                              THEN 'SACHET'
        WHEN name ~* '\y(granules|gran)\y'                       THEN 'GRAN'
        WHEN name ~* '\y(kit)\y'                                 THEN 'KIT'
        WHEN name ~* '\y(suppository|supp)\y'                    THEN 'SUPP'
        WHEN name ~* '\y(inhaler|inhalation)\y'                  THEN 'INH'
        WHEN name ~* '\y(nasal\s*spray|spray)\y'                 THEN 'SPRAY'
        WHEN name ~* '\y(infusion|inf)\y'                        THEN 'INF'
        WHEN name ~* '\y(liquid|liq)\y'                          THEN 'LIQ'
        WHEN name ~* '\y(softgel)\y'                             THEN 'SOFTGEL'
        WHEN name ~* '\y(device)\y'                              THEN 'DEVICE'
        WHEN name ~* '\y(cartridge)\y'                           THEN 'CART'
        WHEN name ~* '\y(octacap)\y'                             THEN 'OCTACAP'
        ELSE 'OTHER'
      END
    ) STORED;

-- ── Index ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_medicines_form_canonical
  ON medicines (form_canonical);

-- ── extract_form_canonical RPC (kept in parity) ────────────────────────────

CREATE OR REPLACE FUNCTION extract_form_canonical(term TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE STRICT
AS $$
  SELECT CASE
    WHEN term ~* '\y(tablet|tab)\y'                             THEN 'TAB'
    WHEN term ~* '\y(capsule|cap)\y'                            THEN 'CAP'
    WHEN term ~* '\y(injection|inj|vial|syringe)\y'             THEN 'INJ'
    WHEN term ~* '\y(syrup|syr|suspension|susp|solution|sol|redimix|dry\s*syr)\y' THEN 'SYR'
    WHEN term ~* '\y(drops|drop)\y'                             THEN 'DROP'
    WHEN term ~* '\y(cream|oint|ointment|gel|lotion|shampoo|soap|lacquer|serum|sunscreen)\y' THEN 'TOPICAL'
    WHEN term ~* '\y(powder|pwd|dusting)\y'                     THEN 'PWD'
    WHEN term ~* '\y(sachet)\y'                                 THEN 'SACHET'
    WHEN term ~* '\y(granules|gran)\y'                          THEN 'GRAN'
    WHEN term ~* '\y(kit)\y'                                    THEN 'KIT'
    WHEN term ~* '\y(suppository|supp)\y'                       THEN 'SUPP'
    WHEN term ~* '\y(inhaler|inhalation)\y'                     THEN 'INH'
    WHEN term ~* '\y(nasal\s*spray|spray)\y'                    THEN 'SPRAY'
    WHEN term ~* '\y(infusion|inf)\y'                           THEN 'INF'
    WHEN term ~* '\y(liquid|liq)\y'                             THEN 'LIQ'
    WHEN term ~* '\y(softgel)\y'                                THEN 'SOFTGEL'
    WHEN term ~* '\y(device)\y'                                 THEN 'DEVICE'
    WHEN term ~* '\y(cartridge)\y'                              THEN 'CART'
    WHEN term ~* '\y(octacap)\y'                                THEN 'OCTACAP'
    ELSE NULL
  END;
$$;

-- ── Grant ──────────────────────────────────────────────────────────────────

GRANT EXECUTE ON FUNCTION extract_form_canonical(TEXT) TO authenticated;
