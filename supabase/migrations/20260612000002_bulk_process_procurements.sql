-- Path: supabase/migrations/20260612000002_bulk_process_procurements.sql
-- Master atomic RPC: given a JSONB array of procurement objects (each with nested items),
-- creates procurement header + procurement_items + upserts inventory — all in one transaction.
-- Called by the saveBulkProcurements server action.

CREATE OR REPLACE FUNCTION bulk_process_procurements(
    p_clinic_id UUID,
    p_created_by UUID,
    p_procurements JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    proc JSONB;
    item JSONB;
    v_procurement_id UUID;
    v_supplier_name TEXT;
    v_invoice_number TEXT;
    v_invoice_date DATE;
    v_total_amount NUMERIC;
    v_procurement_type TEXT;
    v_item_rows JSONB;
    v_inventory_rows JSONB;
    v_med_id BIGINT;
    v_med_name TEXT;
    v_med_names TEXT[];
    v_med_record RECORD;
    v_name_to_id JSONB := '{}';
    v_total_inserted INTEGER := 0;
    v_total_updated INTEGER := 0;
    v_proc_count INTEGER := 0;
    v_upsert_result JSONB;
BEGIN
    -- Loop over each procurement group
    FOR proc IN SELECT * FROM jsonb_array_elements(p_procurements)
    LOOP
        v_supplier_name := proc->>'supplier_name';
        v_invoice_number := proc->>'invoice_number';
        v_invoice_date := (proc->>'invoice_date')::DATE;
        v_total_amount := COALESCE((proc->>'total_amount')::NUMERIC, 0);
        v_procurement_type := COALESCE(proc->>'procurement_type', 'INVOICE');
        v_item_rows := proc->'items';

        -- 1. Collect unique medicine names that need resolution
        v_med_names := ARRAY(
            SELECT DISTINCT (i->>'medicine_name')
            FROM jsonb_array_elements(v_item_rows) AS i
            WHERE i->>'medicine_id' IS NULL
              AND (i->>'medicine_name') IS NOT NULL
              AND (i->>'medicine_name') <> ''
        );

        -- 2. Bulk get-or-create medicines
        IF array_length(v_med_names, 1) > 0 THEN
            FOR v_med_record IN
                SELECT id, name FROM get_or_create_medicines(v_med_names)
            LOOP
                v_name_to_id := jsonb_set(
                    v_name_to_id,
                    ARRAY[v_med_record.name],
                    to_jsonb(v_med_record.id)
                );
            END LOOP;
        END IF;

        -- 3. Insert procurement header
        INSERT INTO procurements (
            clinic_id, supplier_name, invoice_number, invoice_date,
            total_amount, status, created_by, procurement_type
        ) VALUES (
            p_clinic_id, v_supplier_name, v_invoice_number, v_invoice_date,
            v_total_amount, 'Completed', p_created_by, v_procurement_type
        )
        RETURNING id INTO v_procurement_id;

        -- 4. Insert procurement_items
        FOR item IN SELECT * FROM jsonb_array_elements(v_item_rows)
        LOOP
            -- Resolve medicine_id: use provided or look up from name map
            IF item->>'medicine_id' IS NOT NULL THEN
                v_med_id := (item->>'medicine_id')::BIGINT;
            ELSE
                v_med_name := item->>'medicine_name';
                v_med_id := (v_name_to_id->>v_med_name)::BIGINT;
            END IF;

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
                COALESCE((item->>'total_price')::NUMERIC, 0),
                COALESCE((item->>'mrp')::NUMERIC, 0)
            );
        END LOOP;

        -- 5. Build inventory rows JSONB (only items with resolved medicine_id)
        v_inventory_rows := (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'medicine_id', CASE
                        WHEN i->>'medicine_id' IS NOT NULL THEN (i->>'medicine_id')::BIGINT
                        ELSE (v_name_to_id->>(i->>'medicine_name'))::BIGINT
                    END,
                    'batch_number', COALESCE(i->>'batch_number', 'BULK'),
                    'expiry_date', COALESCE(i->>'expiry_date', NULL),
                    'quantity', (i->>'quantity')::INTEGER,
                    'mrp', COALESCE((i->>'mrp')::NUMERIC, 0),
                    'unit_cost_price', COALESCE((i->>'unit_price')::NUMERIC, 0),
                    'merge_with_existing', true
                )
            )
            FROM jsonb_array_elements(v_item_rows) AS i
            WHERE (
                (i->>'medicine_id' IS NOT NULL)
                OR (v_name_to_id->>(i->>'medicine_name')) IS NOT NULL
            )
        );

        -- 6. Upsert inventory with procurement reference
        IF v_inventory_rows IS NOT NULL THEN
            v_upsert_result := bulk_upsert_inventory(v_inventory_rows, p_clinic_id, v_procurement_id);
            v_total_inserted := v_total_inserted + COALESCE((v_upsert_result->>'inserted')::INTEGER, 0);
            v_total_updated := v_total_updated + COALESCE((v_upsert_result->>'updated')::INTEGER, 0);
        END IF;

        v_proc_count := v_proc_count + 1;
        -- Reset name map for next procurement group
        v_name_to_id := '{}';
    END LOOP;

    RETURN jsonb_build_object(
        'procurements_created', v_proc_count,
        'inventory_inserted', v_total_inserted,
        'inventory_updated', v_total_updated
    );
END;
$$;
