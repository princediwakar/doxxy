-- Path: supabase/migrations/20260611000003_bulk_stock_delta_rpc.sql
-- Atomic bulk stock delta processor. Replaces serial calls to decrement/restore RPCs.
-- Single JSONB call — one network round-trip, one transaction, full rollback on any failure.

CREATE OR REPLACE FUNCTION bulk_process_stock_delta(
    p_to_restore JSONB,
    p_to_decrement JSONB,
    p_bill_id UUID,
    p_clinic_id UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    item JSONB;
    target_id UUID;
    req_qty INTEGER;
    current_qty INTEGER;
BEGIN
    -- Phase 1: Restore stock (always succeeds)
    FOR item IN SELECT * FROM jsonb_array_elements(p_to_restore)
    LOOP
        target_id := (item->>'inventory_item_id')::UUID;
        req_qty := (item->>'quantity')::INTEGER;

        PERFORM id FROM inventory_items
        WHERE id = target_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Inventory item % not found for restore', target_id;
        END IF;

        UPDATE inventory_items
        SET current_stock = current_stock + req_qty,
            updated_at = now()
        WHERE id = target_id;

        INSERT INTO stock_transactions (
            clinic_id, inventory_item_id, transaction_type,
            quantity_change, reference_type, reference_id
        ) VALUES (
            p_clinic_id, target_id, 'sale_reversal',
            req_qty, 'bill', p_bill_id
        );
    END LOOP;

    -- Phase 2: Decrement stock (validates availability)
    FOR item IN SELECT * FROM jsonb_array_elements(p_to_decrement)
    LOOP
        target_id := (item->>'inventory_item_id')::UUID;
        req_qty := (item->>'quantity')::INTEGER;

        SELECT current_stock INTO current_qty
        FROM inventory_items
        WHERE id = target_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Inventory item % not found for decrement', target_id;
        END IF;

        IF current_qty < req_qty THEN
            RAISE EXCEPTION 'Insufficient stock for item %: available %, requested %',
                target_id, current_qty, req_qty;
        END IF;

        UPDATE inventory_items
        SET current_stock = current_stock - req_qty,
            updated_at = now()
        WHERE id = target_id;

        INSERT INTO stock_transactions (
            clinic_id, inventory_item_id, transaction_type,
            quantity_change, reference_type, reference_id
        ) VALUES (
            p_clinic_id, target_id, 'sale',
            -req_qty, 'bill', p_bill_id
        );
    END LOOP;
END;
$$;
