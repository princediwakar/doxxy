-- Path: supabase/migrations/20260612000003_fix_bulk_process_rpc.sql
-- Replaces the O(n²) jsonb_set medicine-name-map with a single-batch resolution
-- using a temp table. All unique medicine names across ALL procurement groups are
-- resolved in ONE get_or_create_medicines call, then each item does an O(1) lookup.

CREATE OR REPLACE FUNCTION bulk_process_procurements(
    p_clinic_id  UUID,
    p_created_by UUID,
    p_procurements JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    proc            JSONB;
    item            JSONB;
    v_procurement_id UUID;
    v_upsert_result  JSONB;
    v_inventory_rows JSONB;
    v_med_id         BIGINT;
    v_item_total     NUMERIC;
    v_total_inserted INTEGER := 0;
    v_total_updated  INTEGER := 0;
    v_proc_count     INTEGER := 0;
BEGIN
    -- ── Step 1: Batch-resolve ALL unique unresolved medicine names ──────────
    -- One call to get_or_create_medicines covers every group. O(n) not O(n²).
    CREATE TEMP TABLE _med_map (name TEXT PRIMARY KEY, id BIGINT) ON COMMIT DROP;

    INSERT INTO _med_map (name, id)
    SELECT DISTINCT resolved.name, resolved.id
    FROM (
        SELECT (i->>'medicine_name') AS name
        FROM  jsonb_array_elements(p_procurements) AS proc_row,
              jsonb_array_elements(proc_row->'items') AS i
        WHERE  i->>'medicine_id' IS NULL
           AND (i->>'medicine_name') IS NOT NULL
           AND (i->>'medicine_name') <> ''
    ) AS unresolved
    JOIN LATERAL (
        SELECT m.id, m.name
        FROM   get_or_create_medicines(
                   ARRAY(SELECT name FROM (
                       SELECT DISTINCT (i2->>'medicine_name') AS name
                       FROM   jsonb_array_elements(p_procurements) AS proc_row2,
                              jsonb_array_elements(proc_row2->'items') AS i2
                       WHERE  i2->>'medicine_id' IS NULL
                          AND (i2->>'medicine_name') IS NOT NULL
                          AND (i2->>'medicine_name') <> ''
                   ) sub)
               ) m
        WHERE  m.name = unresolved.name
    ) resolved ON true;

    -- ── Step 2: Process each procurement group ────────────────────────────
    FOR proc IN SELECT * FROM jsonb_array_elements(p_procurements)
    LOOP
        -- 2a. Insert procurement header
        INSERT INTO procurements (
            clinic_id, supplier_name, invoice_number, invoice_date,
            total_amount, status, created_by, procurement_type
        ) VALUES (
            p_clinic_id,
            proc->>'supplier_name',
            proc->>'invoice_number',
            (proc->>'invoice_date')::DATE,
            COALESCE((proc->>'total_amount')::NUMERIC, 0),
            'Completed',
            p_created_by,
            COALESCE(proc->>'procurement_type', 'INVOICE')
        )
        RETURNING id INTO v_procurement_id;

        -- 2b. Insert procurement_items + accumulate inventory rows
        v_inventory_rows := '[]'::JSONB;

        FOR item IN SELECT * FROM jsonb_array_elements(proc->'items')
        LOOP
            -- Resolve medicine_id: prefer explicit id, then temp map O(1) lookup
            IF item->>'medicine_id' IS NOT NULL THEN
                v_med_id := (item->>'medicine_id')::BIGINT;
            ELSE
                SELECT id INTO v_med_id FROM _med_map WHERE name = (item->>'medicine_name');
            END IF;

            v_item_total := COALESCE((item->>'total_price')::NUMERIC, 0);

            INSERT INTO procurement_items (
                procurement_id, medicine_id, extracted_name,
                batch_number, expiry_date,
                quantity, unit_price, total_price, mrp
            ) VALUES (
                v_procurement_id,
                v_med_id,
                COALESCE(item->>'medicine_name', ''),
                COALESCE(item->>'batch_number', 'BULK'),
                NULLIF(item->>'expiry_date', '')::DATE,
                (item->>'quantity')::INTEGER,
                COALESCE((item->>'unit_price')::NUMERIC, 0),
                v_item_total,
                COALESCE((item->>'mrp')::NUMERIC, 0)
            );

            -- Accumulate inventory upsert rows (only for resolved medicines)
            IF v_med_id IS NOT NULL THEN
                v_inventory_rows := v_inventory_rows || jsonb_build_array(
                    jsonb_build_object(
                        'medicine_id',       v_med_id,
                        'batch_number',      COALESCE(item->>'batch_number', 'BULK'),
                        'expiry_date',       NULLIF(item->>'expiry_date', ''),
                        'quantity',          (item->>'quantity')::INTEGER,
                        'mrp',               COALESCE((item->>'mrp')::NUMERIC, 0),
                        'unit_cost_price',   COALESCE((item->>'unit_price')::NUMERIC, 0),
                        'merge_with_existing', true
                    )
                );
            END IF;
        END LOOP;

        -- 2c. Bulk-upsert inventory with procurement reference for full traceability
        IF jsonb_array_length(v_inventory_rows) > 0 THEN
            v_upsert_result := bulk_upsert_inventory(v_inventory_rows, p_clinic_id, v_procurement_id);
            v_total_inserted := v_total_inserted + COALESCE((v_upsert_result->>'inserted')::INTEGER, 0);
            v_total_updated  := v_total_updated  + COALESCE((v_upsert_result->>'updated')::INTEGER,  0);
        END IF;

        v_proc_count := v_proc_count + 1;
    END LOOP;

    RETURN jsonb_build_object(
        'procurements_created', v_proc_count,
        'inventory_inserted',   v_total_inserted,
        'inventory_updated',    v_total_updated
    );
END;
$$;
