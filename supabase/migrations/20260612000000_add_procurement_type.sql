-- Path: supabase/migrations/20260612000000_add_procurement_type.sql
-- Adds procurement_type enum to procurements for Opening Balance / Reconciliation flows.
-- Adds mrp to procurement_items for per-item retail price tracking.

ALTER TABLE procurements
  ADD COLUMN IF NOT EXISTS procurement_type TEXT NOT NULL DEFAULT 'INVOICE'
    CHECK (procurement_type IN ('INVOICE', 'OPENING_BALANCE', 'RECONCILIATION'));

ALTER TABLE procurement_items
  ADD COLUMN IF NOT EXISTS mrp NUMERIC(10,2) NOT NULL DEFAULT 0.00;
