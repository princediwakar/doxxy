-- Path: supabase/migrations/20260612000001_update_bulk_upsert_inventory.sql
-- Adds optional p_reference_id (procurement UUID) so stock_transactions can be traced
-- back to the procurement that created them. Previously hardcoded NULL.

CREATE OR REPLACE FUNCTION bulk_upsert_inventory(
    p_rows JSONB,
    p_clinic_id UUID,
    p_reference_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    item JSONB;
    v_medicine_id BIGINT;
    v_batch_number TEXT;
    v_expiry_date DATE;
    v_quantity INTEGER;
    v_mrp NUMERIC;
    v_unit_cost_price NUMERIC;
    v_merge_with_existing BOOLEAN;
    v_existing_id UUID;
    v_existing_expiry DATE;
    v_existing_stock INTEGER;
    v_inserted INTEGER := 0;
    v_updated INTEGER := 0;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(p_rows)
    LOOP
        v_medicine_id := (item->>'medicine_id')::BIGINT;
        v_batch_number := item->>'batch_number';
        v_expiry_date := (item->>'expiry_date')::DATE;
        v_quantity := (item->>'quantity')::INTEGER;
        v_mrp := COALESCE((item->>'mrp')::NUMERIC, 0);
        v_unit_cost_price := COALESCE((item->>'unit_cost_price')::NUMERIC, 0);
        v_merge_with_existing := COALESCE((item->>'merge_with_existing')::BOOLEAN, true);

        -- Check for existing batch
        SELECT id, expiry_date, current_stock
        INTO v_existing_id, v_existing_expiry, v_existing_stock
        FROM inventory_items
        WHERE clinic_id = p_clinic_id
          AND medicine_id = v_medicine_id
          AND batch_number = v_batch_number
        FOR UPDATE;

        -- Only merge if: exists, merge requested, AND expiry matches
        IF v_existing_id IS NOT NULL
           AND v_merge_with_existing
           AND v_existing_expiry = v_expiry_date THEN

            UPDATE inventory_items
            SET current_stock = v_existing_stock + v_quantity,
                mrp = v_mrp,
                unit_cost_price = v_unit_cost_price,
                updated_at = now()
            WHERE id = v_existing_id;

            v_updated := v_updated + 1;

            INSERT INTO stock_transactions (
                clinic_id, inventory_item_id, transaction_type,
                quantity_change, reference_type, reference_id
            ) VALUES (
                p_clinic_id, v_existing_id, 'procurement',
                v_quantity, 'bulk_import', p_reference_id
            );

        ELSE
            -- If batch number already exists with a different expiry, disambiguate
            IF v_existing_id IS NOT NULL THEN
                v_batch_number := v_batch_number || ' (Exp: ' || to_char(v_expiry_date, 'YYYY-MM') || ')';
            END IF;

            WITH inserted AS (
                INSERT INTO inventory_items (
                    clinic_id, medicine_id, batch_number, expiry_date,
                    current_stock, mrp, unit_cost_price
                ) VALUES (
                    p_clinic_id, v_medicine_id, v_batch_number, v_expiry_date,
                    v_quantity, v_mrp, v_unit_cost_price
                )
                RETURNING id
            )
            INSERT INTO stock_transactions (
                clinic_id, inventory_item_id, transaction_type,
                quantity_change, reference_type, reference_id
            )
            SELECT
                p_clinic_id, inserted.id, 'procurement',
                v_quantity, 'bulk_import', p_reference_id
            FROM inserted;

            v_inserted := v_inserted + 1;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'inserted', v_inserted,
        'updated', v_updated
    );
END;
$$;
