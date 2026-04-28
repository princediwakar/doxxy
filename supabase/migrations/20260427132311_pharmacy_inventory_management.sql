-- Create Procurement Bills Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('procurement_bills', 'procurement_bills', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage Bucket
CREATE POLICY "Clinic members can upload bills"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'procurement_bills' AND
  auth.uid() IN (
    SELECT user_id FROM public.clinic_members
  )
);

CREATE POLICY "Clinic members can view bills"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'procurement_bills' AND
  auth.uid() IN (
    SELECT user_id FROM public.clinic_members
  )
);

-- Pharmacy Inventory Management Tables

-- 1. inventory_items
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    medicine_id BIGINT NOT NULL REFERENCES public.medicines(id),
    batch_number TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER NOT NULL DEFAULT 10,
    unit_cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(clinic_id, medicine_id, batch_number)
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view inventory in their clinics"
    ON public.inventory_items FOR SELECT
    USING (
        clinic_id IN (SELECT clinic_id FROM public.clinic_members WHERE user_id = auth.uid())
        OR clinic_id IN (SELECT clinic_id FROM public.doctors WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can modify inventory in their clinics"
    ON public.inventory_items FOR ALL
    USING (
        clinic_id IN (SELECT clinic_id FROM public.clinic_members WHERE user_id = auth.uid() AND role IN ('superadmin', 'staff', 'doctor'))
    );


-- 2. procurements
CREATE TYPE public.procurement_status AS ENUM ('Draft', 'Verified', 'Completed');

CREATE TABLE IF NOT EXISTS public.procurements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    supplier_name TEXT NOT NULL,
    invoice_number TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status public.procurement_status NOT NULL DEFAULT 'Draft',
    image_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(clinic_id, supplier_name, invoice_number)
);

ALTER TABLE public.procurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view procurements in their clinics"
    ON public.procurements FOR SELECT
    USING (
        clinic_id IN (SELECT clinic_id FROM public.clinic_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can modify procurements in their clinics"
    ON public.procurements FOR ALL
    USING (
        clinic_id IN (SELECT clinic_id FROM public.clinic_members WHERE user_id = auth.uid() AND role IN ('superadmin', 'staff'))
    );


-- 3. procurement_items
CREATE TABLE IF NOT EXISTS public.procurement_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    procurement_id UUID NOT NULL REFERENCES public.procurements(id) ON DELETE CASCADE,
    medicine_id BIGINT REFERENCES public.medicines(id),
    extracted_name TEXT, -- what Gemini extracted, useful if it couldn't map to medicine_id
    batch_number TEXT,
    expiry_date DATE,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.procurement_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view procurement_items in their clinics"
    ON public.procurement_items FOR SELECT
    USING (
        procurement_id IN (SELECT id FROM public.procurements WHERE clinic_id IN (SELECT clinic_id FROM public.clinic_members WHERE user_id = auth.uid()))
    );

CREATE POLICY "Users can modify procurement_items in their clinics"
    ON public.procurement_items FOR ALL
    USING (
        procurement_id IN (SELECT id FROM public.procurements WHERE clinic_id IN (SELECT clinic_id FROM public.clinic_members WHERE user_id = auth.uid() AND role IN ('superadmin', 'staff')))
    );
