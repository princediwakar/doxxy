-- ============================================================
-- Prevent future duplicate medicines
-- Uniqueness: name + pack_size_label + manufacturer_name
-- Only for active (non-discontinued) medicines
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_medicines_name_pack_manufacturer
  ON medicines (name, COALESCE(pack_size_label, ''), COALESCE(manufacturer_name, ''))
  WHERE is_discontinued = false;
