-- Day 0: Verify Supabase Realtime Publication Tables
-- Run this in the Supabase SQL Editor against your production database.
-- All 7 tables must be present for realtime propagation to work correctly.

SELECT schemaname, tablename, pubname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public'
  AND tablename IN (
    'appointments',
    'bills',
    'consultations',
    'prescriptions',
    'inventory_items',
    'procurements',
    'payment_transactions'
  )
ORDER BY tablename;

-- Expected result: 7 rows, one for each table.
-- If any table is missing, add it with:
--   ALTER PUBLICATION supabase_realtime ADD TABLE <table_name>;
-- Repeat for each missing table.
