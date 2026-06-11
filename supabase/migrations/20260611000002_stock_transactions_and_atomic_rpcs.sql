-- Path: supabase/migrations/20260611000002_stock_transactions_and_atomic_rpcs.sql
-- Captures stock_transactions table and RPCs that were applied directly to remote.
-- Rewrites decrement_stock_and_log with atomic stock validation (FOR UPDATE + reject negative).

-- ============================================================================
-- 1. stock_transactions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.stock_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id),
    transaction_type TEXT NOT NULL,
    quantity_change INTEGER NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stock transactions in their clinics"
    ON public.stock_transactions FOR SELECT
    USING (
        clinic_id IN (SELECT clinic_id FROM public.clinic_members WHERE user_id = auth.uid())
        OR clinic_id IN (SELECT clinic_id FROM public.doctors WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert stock transactions in their clinics"
    ON public.stock_transactions FOR INSERT
    WITH CHECK (
        clinic_id IN (SELECT clinic_id FROM public.clinic_members WHERE user_id = auth.uid())
        OR clinic_id IN (SELECT clinic_id FROM public.doctors WHERE user_id = auth.uid())
    );

-- ============================================================================
-- 2. decrement_stock_and_log — atomic, rejects negative stock
-- ============================================================================

CREATE OR REPLACE FUNCTION decrement_stock_and_log(
    p_inventory_item_id UUID,
    p_quantity INTEGER,
    p_bill_id UUID,
    p_clinic_id UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_stock INTEGER;
BEGIN
    -- Lock the row to prevent concurrent updates
    SELECT current_stock INTO v_current_stock
    FROM inventory_items
    WHERE id = p_inventory_item_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventory item % not found', p_inventory_item_id;
    END IF;

    IF v_current_stock < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock for item %: available %, requested %',
            p_inventory_item_id, v_current_stock, p_quantity;
    END IF;

    -- Decrement stock
    UPDATE inventory_items
    SET current_stock = current_stock - p_quantity,
        updated_at = now()
    WHERE id = p_inventory_item_id;

    -- Log the transaction
    INSERT INTO stock_transactions (
        clinic_id,
        inventory_item_id,
        transaction_type,
        quantity_change,
        reference_type,
        reference_id
    ) VALUES (
        p_clinic_id,
        p_inventory_item_id,
        'sale',
        -p_quantity,
        'bill',
        p_bill_id
    );
END;
$$;

-- ============================================================================
-- 3. restore_stock_and_log — atomic restore
-- ============================================================================

CREATE OR REPLACE FUNCTION restore_stock_and_log(
    p_inventory_item_id UUID,
    p_quantity INTEGER,
    p_bill_id UUID,
    p_clinic_id UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Lock the row to prevent concurrent updates
    PERFORM id FROM inventory_items
    WHERE id = p_inventory_item_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventory item % not found', p_inventory_item_id;
    END IF;

    -- Restore stock
    UPDATE inventory_items
    SET current_stock = current_stock + p_quantity,
        updated_at = now()
    WHERE id = p_inventory_item_id;

    -- Log the transaction
    INSERT INTO stock_transactions (
        clinic_id,
        inventory_item_id,
        transaction_type,
        quantity_change,
        reference_type,
        reference_id
    ) VALUES (
        p_clinic_id,
        p_inventory_item_id,
        'sale_reversal',
        p_quantity,
        'bill',
        p_bill_id
    );
END;
$$;

-- ============================================================================
-- 4. log_procurement_stock — audit trail for procurement
-- ============================================================================

CREATE OR REPLACE FUNCTION log_procurement_stock(
    p_inventory_item_id UUID,
    p_quantity INTEGER,
    p_procurement_id UUID,
    p_clinic_id UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO stock_transactions (
        clinic_id,
        inventory_item_id,
        transaction_type,
        quantity_change,
        reference_type,
        reference_id
    ) VALUES (
        p_clinic_id,
        p_inventory_item_id,
        'procurement',
        p_quantity,
        'procurement',
        p_procurement_id
    );
END;
$$;
