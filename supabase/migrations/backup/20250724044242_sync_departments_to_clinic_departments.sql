-- Sync local schema with production: rename departments to clinic_departments
-- This ensures both local and production databases have the same schema

-- Step 1: Create clinic_departments table with the same structure as departments
CREATE TABLE IF NOT EXISTS "public"."clinic_departments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "department_type_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "clinic_departments_pkey" PRIMARY KEY ("id")
);

-- Step 2: Copy all data from departments to clinic_departments (only if departments table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'departments' AND table_schema = 'public') THEN
        INSERT INTO "public"."clinic_departments" (id, clinic_id, department_type_id, is_active, created_at, updated_at)
        SELECT id, clinic_id, department_type_id, is_active, created_at, updated_at
        FROM "public"."departments"
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- Step 3: Update foreign key constraints
-- First, drop existing foreign keys on departments table
ALTER TABLE IF EXISTS "public"."clinic_members" DROP CONSTRAINT IF EXISTS "clinic_members_department_id_fkey";

-- Step 4: Add foreign key constraints for clinic_departments (primary key already added above)

ALTER TABLE "public"."clinic_departments" 
ADD CONSTRAINT "clinic_departments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;

ALTER TABLE "public"."clinic_departments" 
ADD CONSTRAINT "clinic_departments_department_type_id_fkey" FOREIGN KEY ("department_type_id") REFERENCES "public"."department_types"("id") ON DELETE CASCADE;

-- Step 5: Update clinic_members foreign key to point to clinic_departments
ALTER TABLE "public"."clinic_members" 
ADD CONSTRAINT "clinic_members_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."clinic_departments"("id") ON DELETE SET NULL;

-- Step 6: Set owner
ALTER TABLE "public"."clinic_departments" OWNER TO "postgres";

-- Step 7: Enable RLS on clinic_departments
ALTER TABLE "public"."clinic_departments" ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for clinic_departments (same as departments)
DO $$
BEGIN
    -- Create clinic isolation policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'clinic_departments' 
        AND policyname = 'clinic_departments_clinic_access'
    ) THEN
        CREATE POLICY "clinic_departments_clinic_access" ON "public"."clinic_departments"
        FOR ALL USING (
            clinic_id IN (
                SELECT cm.clinic_id FROM clinic_members cm 
                WHERE cm.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- Step 9: Update any functions that reference departments table
-- Drop and recreate get_clinic_members function to use clinic_departments
DROP FUNCTION IF EXISTS public.get_clinic_members(uuid);
CREATE FUNCTION public.get_clinic_members(p_clinic_id uuid)
RETURNS TABLE (
    id uuid,
    user_id uuid,
    clinic_id uuid,
    role public.user_role,
    department_id uuid,
    created_at timestamp with time zone,
    profile json,
    department json
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cm.id,
        cm.user_id,
        cm.clinic_id,
        cm.role,
        cm.department_id,
        cm.created_at,
        to_json(p.*) as profile,
        CASE 
            WHEN cd.id IS NOT NULL THEN 
                json_build_object(
                    'id', cd.id,
                    'name', dt.name,
                    'department_type_id', cd.department_type_id
                )
            ELSE NULL
        END as department
    FROM clinic_members cm
    LEFT JOIN profiles p ON p.id = cm.user_id
    LEFT JOIN clinic_departments cd ON cd.id = cm.department_id
    LEFT JOIN department_types dt ON dt.id = cd.department_type_id
    WHERE cm.clinic_id = p_clinic_id;
END;
$$;

-- Step 10: Drop the old departments table (be careful with this in production!)
-- For safety, we'll keep it for now and just rename it
-- ALTER TABLE "public"."departments" RENAME TO "departments_old_backup";

-- Step 11: Grant permissions
GRANT ALL ON TABLE "public"."clinic_departments" TO "authenticated";
GRANT ALL ON TABLE "public"."clinic_departments" TO "service_role";