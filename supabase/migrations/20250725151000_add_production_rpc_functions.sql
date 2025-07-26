-- Add all production RPC functions to local environment
-- This migration ensures all healthcare application functions are available locally

-- ================================
-- BILLING & CREDIT MANAGEMENT FUNCTIONS
-- ================================

-- Add clinic credits (overloaded version 1)
CREATE OR REPLACE FUNCTION "public"."add_clinic_credits"("clinic_id_param" "uuid", "credits_to_add" integer, "transaction_id_param" "uuid" DEFAULT NULL::"uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Insert or update clinic credits
  INSERT INTO clinic_credits (
    clinic_id,
    credit_balance,
    total_credits_purchased,
    total_credits_used,
    updated_at
  ) VALUES (
    clinic_id_param,
    credits_to_add,
    credits_to_add,
    0,
    NOW()
  )
  ON CONFLICT (clinic_id) 
  DO UPDATE SET
    credit_balance = clinic_credits.credit_balance + credits_to_add,
    total_credits_purchased = clinic_credits.total_credits_purchased + credits_to_add,
    updated_at = NOW();

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Add clinic credits (overloaded version 2)
CREATE OR REPLACE FUNCTION "public"."add_clinic_credits"("p_clinic_id" "uuid", "p_credits" integer, "p_payment_id" "text" DEFAULT NULL::"text", "p_order_id" "text" DEFAULT NULL::"text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_current_credits INTEGER := 0;
  v_new_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT COALESCE(credit_balance, 0) INTO v_current_credits
  FROM clinic_credits
  WHERE clinic_id = p_clinic_id;

  -- Calculate new credits
  v_new_credits := v_current_credits + p_credits;

  -- Update clinic credits
  INSERT INTO clinic_credits (
    clinic_id,
    credit_balance,
    total_credits_purchased,
    total_credits_used,
    updated_at
  ) VALUES (
    p_clinic_id,
    v_new_credits,
    p_credits,  -- Add to purchased
    0,
    NOW()
  )
  ON CONFLICT (clinic_id) 
  DO UPDATE SET
    credit_balance = v_new_credits,
    total_credits_purchased = clinic_credits.total_credits_purchased + p_credits,
    updated_at = NOW();

  -- Insert credit transaction record (if table exists)
  BEGIN
    INSERT INTO payment_transactions (
      id, clinic_id, transaction_type, amount, currency, credits_purchased, 
      razorpay_payment_id, razorpay_order_id, payment_status, created_at
    )
    VALUES (
      gen_random_uuid(),
      p_clinic_id,
      'credit_purchase',
      0.00,  -- Amount handled elsewhere
      'INR',
      p_credits,
      p_payment_id,
      p_order_id,
      'completed',
      NOW()
    );
  EXCEPTION
    WHEN undefined_table THEN
      -- Table doesn't exist, skip transaction logging
      NULL;
  END;

  -- Return result
  RETURN json_build_object(
    'clinic_id', p_clinic_id,
    'previous_credits', v_current_credits,
    'credits_added', p_credits,
    'new_balance', v_new_credits,
    'payment_id', p_payment_id,
    'order_id', p_order_id
  );
END;
$$;

-- Deduct appointment credit
CREATE OR REPLACE FUNCTION "public"."deduct_appointment_credit"("appointment_id_param" "uuid", "clinic_id_param" "uuid", "credits_to_deduct" integer DEFAULT 1) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_balance INTEGER;
    new_balance INTEGER;
BEGIN
    -- Get current credit balance
    SELECT credit_balance INTO current_balance
    FROM clinic_credits
    WHERE clinic_id = clinic_id_param;
    
    -- If no credits record exists, return false
    IF current_balance IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if sufficient credits available
    IF current_balance < credits_to_deduct THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate new balance
    new_balance := current_balance - credits_to_deduct;
    
    -- Update clinic credits
    UPDATE clinic_credits
    SET 
        credit_balance = new_balance,
        total_credits_used = total_credits_used + credits_to_deduct,
        updated_at = CURRENT_TIMESTAMP
    WHERE clinic_id = clinic_id_param;
    
    -- Create appointment billing record
    INSERT INTO appointment_billing (
        appointment_id,
        clinic_id,
        billing_type,
        amount,
        credits_used
    ) VALUES (
        appointment_id_param,
        clinic_id_param,
        'credit_deduction',
        10.00,
        credits_to_deduct
    );
    
    RETURN TRUE;
END;
$$;

-- Get clinic credit balance
CREATE OR REPLACE FUNCTION "public"."get_clinic_credit_balance"("clinic_id_param" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    balance INTEGER;
BEGIN
    SELECT credit_balance INTO balance
    FROM clinic_credits
    WHERE clinic_id = clinic_id_param;
    
    RETURN COALESCE(balance, 0);
END;
$$;

-- Get clinic billing summary
CREATE OR REPLACE FUNCTION "public"."get_clinic_billing_summary"("clinic_id_param" "uuid") RETURNS TABLE("credit_balance" integer, "total_credits_purchased" integer, "total_credits_used" integer, "current_month_appointments" integer, "current_month_amount" numeric, "pending_payments" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(cc.credit_balance, 0) as credit_balance,
        COALESCE(cc.total_credits_purchased, 0) as total_credits_purchased,
        COALESCE(cc.total_credits_used, 0) as total_credits_used,
        COALESCE(mbc.appointments_count, 0) as current_month_appointments,
        COALESCE(mbc.total_amount, 0) as current_month_amount,
        (SELECT COUNT(*)::INTEGER FROM payment_transactions pt 
         WHERE pt.clinic_id = clinic_id_param AND pt.payment_status = 'pending') as pending_payments
    FROM clinic_credits cc
    LEFT JOIN monthly_billing_cycles mbc ON mbc.clinic_id = cc.clinic_id 
        AND mbc.billing_month = DATE_TRUNC('month', CURRENT_DATE)
    WHERE cc.clinic_id = clinic_id_param;
END;
$$;

-- ================================
-- CLINIC & MEMBER MANAGEMENT FUNCTIONS
-- ================================

-- Add clinic member
CREATE OR REPLACE FUNCTION "public"."add_clinic_member"("new_user_id" "uuid", "target_clinic_id" "uuid", "new_role" "public"."user_role", "new_department_id" "uuid" DEFAULT NULL::"uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_member_id UUID;
  member_data JSON;
BEGIN
  -- Validate user_id
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = new_user_id) THEN
    RAISE EXCEPTION 'User ID % does not exist in profiles', new_user_id;
  END IF;

  -- Validate clinic_id
  IF NOT EXISTS (SELECT 1 FROM clinics WHERE id = target_clinic_id) THEN
    RAISE EXCEPTION 'Clinic ID % does not exist', target_clinic_id;
  END IF;

  -- Validate department_id (if provided)
  IF new_department_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clinic_departments WHERE id = new_department_id
  ) THEN
    RAISE EXCEPTION 'Department ID % does not exist', new_department_id;
  END IF;

  -- Insert or update clinic member
  INSERT INTO clinic_members (
    id,
    user_id,
    clinic_id,
    role,
    department_id,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    target_clinic_id,
    new_role,
    new_department_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id, clinic_id)
  DO UPDATE SET
    role = EXCLUDED.role,
    department_id = EXCLUDED.department_id,
    updated_at = NOW()
  RETURNING id INTO new_member_id;

  -- Fetch member data as JSON
  SELECT json_build_object(
    'id', cm.id,
    'user_id', cm.user_id,
    'clinic_id', cm.clinic_id,
    'role', cm.role,
    'department_id', cm.department_id,
    'created_at', cm.created_at,
    'updated_at', cm.updated_at
  ) INTO member_data
  FROM clinic_members cm
  WHERE cm.id = new_member_id;

  RETURN member_data;
END;
$$;

-- Create clinic with admin
CREATE OR REPLACE FUNCTION "public"."create_clinic_with_admin"("clinic_name" "text", "user_phone" "text" DEFAULT NULL::"text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  clinic_id uuid;
  user_id uuid;
  result JSON;
BEGIN
  -- Get the current user ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Insert the clinic
  INSERT INTO clinics (name)
  VALUES (clinic_name)
  RETURNING id INTO clinic_id;

  -- Add the user as a clinic member with superadmin role
  INSERT INTO clinic_members (user_id, clinic_id, role)
  VALUES (user_id, clinic_id, 'superadmin');

  -- Create initial credit record with 100 free credits for new clinic
  INSERT INTO clinic_credits (
    clinic_id, 
    credit_balance, 
    total_credits_purchased, 
    total_credits_used
  )
  VALUES (
    clinic_id, 
    100,  -- 100 free credits
    100,  -- Count as purchased for accounting
    0     -- No credits used yet
  );

  -- Create a transaction record for the free credits
  INSERT INTO payment_transactions (
    clinic_id,
    transaction_type,
    amount,
    currency,
    credits_purchased,
    payment_status,
    payment_method,
    metadata
  )
  VALUES (
    clinic_id,
    'credit_purchase',
    0.00,  -- Free credits
    'INR',
    100,   -- 100 credits
    'completed',
    'free_credits',
    json_build_object(
      'type', 'welcome_bonus',
      'description', 'Free credits for new clinic',
      'automated', true
    )
  );

  -- Update user phone if provided
  IF user_phone IS NOT NULL THEN
    UPDATE auth.users 
    SET phone = user_phone 
    WHERE id = user_id;
  END IF;

  -- Return the clinic ID
  result := json_build_object('clinic_id', clinic_id);
  RETURN result;
END;
$$;

-- Get clinic members
CREATE OR REPLACE FUNCTION "public"."get_clinic_members"("p_clinic_id" "uuid") RETURNS TABLE("id" "uuid", "user_id" "uuid", "clinic_id" "uuid", "role" "public"."user_role", "department_id" "uuid", "created_at" timestamp with time zone, "profile" "jsonb", "department" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Verify user has access to this clinic
  IF NOT EXISTS (
    SELECT 1 FROM clinic_members auth_cm
    WHERE auth_cm.clinic_id = p_clinic_id AND auth_cm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permission denied: cannot access clinic members';
  END IF;

  RETURN QUERY
  SELECT 
    cm.id,
    cm.user_id,
    cm.clinic_id,
    cm.role,
    cm.department_id,
    cm.created_at,
    (
      SELECT jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'email', p.email,
        'phone', p.phone,
        'created_at', p.created_at,
        'updated_at', p.updated_at
      )
      FROM profiles p
      WHERE p.id = cm.user_id
    ) AS profile,
    (
      SELECT jsonb_build_object(
        'id', cd.id,
        'department_types', jsonb_build_object(
          'id', dt.id,
          'name', dt.name
        )
      )
      FROM clinic_departments cd
      JOIN department_types dt ON dt.id = cd.department_type_id
      WHERE cd.id = cm.department_id
    ) AS department
  FROM clinic_members cm
  WHERE cm.clinic_id = p_clinic_id
  ORDER BY cm.created_at DESC;
END;
$$;

-- Update clinic member details
CREATE OR REPLACE FUNCTION "public"."update_clinic_member_details"("member_user_id" "uuid", "target_clinic_id" "uuid", "updated_role" "public"."user_role", "updated_department_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Validate user_id
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = member_user_id) THEN
    RAISE EXCEPTION 'User ID % does not exist', member_user_id;
  END IF;

  -- Validate clinic_id
  IF NOT EXISTS (SELECT 1 FROM clinics WHERE id = target_clinic_id) THEN
    RAISE EXCEPTION 'Clinic ID % does not exist', target_clinic_id;
  END IF;

  -- Validate department_id (if provided)
  IF updated_department_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clinic_departments WHERE id = updated_department_id AND clinic_id = target_clinic_id
  ) THEN
    RAISE EXCEPTION 'Department ID % does not exist for clinic %', updated_department_id, target_clinic_id;
  END IF;

  -- Check if member exists
  IF NOT EXISTS (
    SELECT 1 FROM clinic_members 
    WHERE user_id = member_user_id AND clinic_id = target_clinic_id
  ) THEN
    RAISE EXCEPTION 'No member found for user % in clinic %', member_user_id, target_clinic_id;
  END IF;

  -- Update clinic_members
  UPDATE clinic_members
  SET
    department_id = COALESCE(updated_department_id, department_id),
    role = COALESCE(updated_role, role)
  WHERE user_id = member_user_id
  AND clinic_id = target_clinic_id;
END;
$$;

-- Get user clinic memberships
CREATE OR REPLACE FUNCTION "public"."get_user_clinic_memberships"("user_id" "uuid") RETURNS TABLE("clinic_id" "uuid", "clinic_name" "text", "role" "public"."user_role", "joined_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as clinic_id,
    c.name as clinic_name,
    cm.role,
    cm.created_at as joined_at
  FROM clinic_members cm
  JOIN clinics c ON c.id = cm.clinic_id
  WHERE cm.user_id = $1;
END;
$_$;

-- Get user clinics
CREATE OR REPLACE FUNCTION "public"."get_user_clinics"() RETURNS TABLE("clinic_id" "uuid")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid();
$$;

-- Get user clinics simple
CREATE OR REPLACE FUNCTION "public"."get_user_clinics_simple"() RETURNS TABLE("clinic_id" "uuid")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT DISTINCT clinic_id 
  FROM clinic_members 
  WHERE user_id = auth.uid();
$$;

-- Is superadmin in clinic
CREATE OR REPLACE FUNCTION "public"."is_superadmin_in_clinic"("check_clinic_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM clinic_members 
    WHERE user_id = auth.uid() 
    AND clinic_id = check_clinic_id 
    AND role = 'superadmin'::user_role
  );
$$;

-- ================================
-- PATIENT MANAGEMENT FUNCTIONS
-- ================================

-- Create patient
CREATE OR REPLACE FUNCTION "public"."create_patient"("p_clinic_id" "uuid", "p_name" "text", "p_phone" "text", "p_email" "text", "p_medical_id" "text", "p_gender" "text", "p_address" "text", "p_date_of_birth" "date") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  new_patient_id UUID;
BEGIN
  -- Verify user has access to this clinic
  IF NOT EXISTS (
    SELECT 1 FROM clinic_members
    WHERE clinic_id = p_clinic_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permission denied: cannot create patient in this clinic';
  END IF;

  INSERT INTO patients (
    clinic_id,
    name,
    phone,
    email,
    medical_id,
    gender,
    address,
    date_of_birth
  ) VALUES (
    p_clinic_id,
    p_name,
    p_phone,
    p_email,
    p_medical_id,
    p_gender,
    p_address,
    p_date_of_birth
  )
  RETURNING id INTO new_patient_id;

  RETURN new_patient_id;
END;
$$;

-- Update patient
CREATE OR REPLACE FUNCTION "public"."update_patient"("p_patient_id" "uuid", "p_name" "text" DEFAULT NULL::"text", "p_phone" "text" DEFAULT NULL::"text", "p_email" "text" DEFAULT NULL::"text", "p_medical_id" "text" DEFAULT NULL::"text", "p_gender" "text" DEFAULT NULL::"text", "p_address" "text" DEFAULT NULL::"text", "p_date_of_birth" "date" DEFAULT NULL::"date") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Verify user has access to this patient's clinic
  IF NOT EXISTS (
    SELECT 1 FROM patients p
    JOIN clinic_members cm ON cm.clinic_id = p.clinic_id
    WHERE p.id = p_patient_id AND cm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permission denied: cannot update patient';
  END IF;

  UPDATE patients
  SET
    name = COALESCE(p_name, name),
    phone = COALESCE(p_phone, phone),
    email = COALESCE(p_email, email),
    medical_id = COALESCE(p_medical_id, medical_id),
    gender = COALESCE(p_gender, gender),
    address = COALESCE(p_address, address),
    date_of_birth = COALESCE(p_date_of_birth, date_of_birth),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_patient_id;

  RETURN p_patient_id;
END;
$$;

-- Delete patient
CREATE OR REPLACE FUNCTION "public"."delete_patient"("p_patient_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Verify user has access to this patient's clinic and is a superadmin
  IF NOT EXISTS (
    SELECT 1 FROM patients p
    JOIN clinic_members cm ON cm.clinic_id = p.clinic_id
    WHERE p.id = p_patient_id 
    AND cm.user_id = auth.uid()
    AND cm.role = 'superadmin'
  ) THEN
    RAISE EXCEPTION 'Permission denied: only clinic superadmins can delete patients';
  END IF;

  DELETE FROM patients WHERE id = p_patient_id;
  RETURN FOUND;
END;
$$;

-- Get patients by clinic
CREATE OR REPLACE FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer DEFAULT 100, "_offset" integer DEFAULT 0) RETURNS TABLE("id" "uuid", "name" "text", "phone" "text", "email" "text", "medical_id" "text", "gender" "text", "address" "text", "date_of_birth" "date", "created_at" timestamp with time zone, "clinic_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.phone,
    p.email,
    p.medical_id,
    p.gender,
    p.address,
    p.date_of_birth,
    p.created_at,
    p.clinic_id
  FROM patients p
  WHERE p.clinic_id = _clinic_id
  ORDER BY p.name ASC
  LIMIT _limit OFFSET _offset;
END;
$$;

-- Get patient details
CREATE OR REPLACE FUNCTION "public"."get_patient_details"("p_patient_id" "uuid") RETURNS TABLE("id" "uuid", "name" "text", "phone" "text", "email" "text", "medical_id" "text", "gender" "text", "address" "text", "date_of_birth" "date", "created_at" timestamp with time zone, "clinic_id" "uuid", "consultations" "json")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Verify user has access to this patient's clinic
  IF NOT EXISTS (
    SELECT 1 FROM patients p
    JOIN clinic_members cm ON cm.clinic_id = p.clinic_id
    WHERE p.id = p_patient_id AND cm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permission denied: cannot access patient details';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.phone,
    p.email,
    p.medical_id,
    p.gender,
    p.address,
    p.date_of_birth,
    p.created_at,
    p.clinic_id,
    COALESCE(
      (
        SELECT json_agg(json_build_object(
          'id', c.id,
          'appointment_id', c.appointment_id,
          'specialty_data', c.specialty_data,
          'clinical_notes', c.clinical_notes,
          'created_at', c.created_at
        ))
        FROM consultations c
        WHERE c.patient_id = p.id
      ),
      '[]'::json
    ) as consultations
  FROM patients p
  WHERE p.id = p_patient_id;
END;
$$;

-- ================================
-- CONSULTATION MANAGEMENT FUNCTIONS
-- ================================

-- Create consultation
CREATE OR REPLACE FUNCTION "public"."create_consultation"("p_patient_id" "uuid", "p_appointment_id" "uuid", "p_chief_complaint" "text", "p_history_present_illness" "text", "p_physical_examination" "text", "p_assessment_diagnosis" "text", "p_plan_treatment" "text", "p_prescriptions" "jsonb" DEFAULT '[]'::"jsonb", "p_notes" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  new_consultation_id UUID;
  clinic_id_val UUID;
BEGIN
  -- Get clinic_id and verify user has access to this patient's clinic and is a doctor
  SELECT p.clinic_id INTO clinic_id_val
  FROM patients p
  JOIN clinic_members cm ON cm.clinic_id = p.clinic_id
  WHERE p.id = p_patient_id 
  AND cm.user_id = auth.uid()
  AND cm.role = 'doctor';

  IF clinic_id_val IS NULL THEN
    RAISE EXCEPTION 'Permission denied: only doctors can create consultations';
  END IF;

  -- Create consultation with modern schema
  INSERT INTO consultations (
    patient_id,
    appointment_id,
    clinic_id,
    doctor_id,
    specialty_data,
    clinical_notes
  ) VALUES (
    p_patient_id,
    p_appointment_id,
    clinic_id_val,
    (SELECT id FROM doctors WHERE user_id = auth.uid() AND clinic_id = clinic_id_val LIMIT 1),
    jsonb_build_object(
      'chief_complaint', p_chief_complaint,
      'history_present_illness', p_history_present_illness,
      'physical_examination', p_physical_examination,
      'assessment_diagnosis', p_assessment_diagnosis,
      'plan_treatment', p_plan_treatment,
      'prescriptions', p_prescriptions
    ),
    jsonb_build_object('notes', p_notes)
  )
  RETURNING id INTO new_consultation_id;

  RETURN new_consultation_id;
END;
$$;

-- Update consultation
CREATE OR REPLACE FUNCTION "public"."update_consultation"("p_consultation_id" "uuid", "p_chief_complaint" "text" DEFAULT NULL::"text", "p_history_present_illness" "text" DEFAULT NULL::"text", "p_physical_examination" "text" DEFAULT NULL::"text", "p_assessment_diagnosis" "text" DEFAULT NULL::"text", "p_plan_treatment" "text" DEFAULT NULL::"text", "p_prescriptions" "jsonb" DEFAULT NULL::"jsonb", "p_notes" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  current_specialty_data jsonb;
  current_clinical_notes jsonb;
BEGIN
  -- Verify user has access to this consultation's clinic and is a doctor
  IF NOT EXISTS (
    SELECT 1 FROM consultations c
    JOIN patients p ON p.id = c.patient_id
    JOIN clinic_members cm ON cm.clinic_id = p.clinic_id
    WHERE c.id = p_consultation_id 
    AND cm.user_id = auth.uid()
    AND cm.role = 'doctor'
  ) THEN
    RAISE EXCEPTION 'Permission denied: only doctors can update consultations';
  END IF;

  -- Get current data
  SELECT specialty_data, clinical_notes 
  INTO current_specialty_data, current_clinical_notes
  FROM consultations 
  WHERE id = p_consultation_id;

  -- Update consultation with merged data
  UPDATE consultations
  SET
    specialty_data = jsonb_build_object(
      'chief_complaint', COALESCE(p_chief_complaint, current_specialty_data->>'chief_complaint'),
      'history_present_illness', COALESCE(p_history_present_illness, current_specialty_data->>'history_present_illness'),
      'physical_examination', COALESCE(p_physical_examination, current_specialty_data->>'physical_examination'),
      'assessment_diagnosis', COALESCE(p_assessment_diagnosis, current_specialty_data->>'assessment_diagnosis'),
      'plan_treatment', COALESCE(p_plan_treatment, current_specialty_data->>'plan_treatment'),
      'prescriptions', COALESCE(p_prescriptions, current_specialty_data->'prescriptions')
    ),
    clinical_notes = jsonb_build_object(
      'notes', COALESCE(p_notes, current_clinical_notes->>'notes')
    )
  WHERE id = p_consultation_id;

  RETURN p_consultation_id;
END;
$$;

-- Delete consultation
CREATE OR REPLACE FUNCTION "public"."delete_consultation"("p_consultation_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Verify user has access to this consultation's clinic and is a doctor or superadmin
  IF NOT EXISTS (
    SELECT 1 FROM consultations c
    JOIN patients p ON p.id = c.patient_id
    JOIN clinic_members cm ON cm.clinic_id = p.clinic_id
    WHERE c.id = p_consultation_id 
    AND cm.user_id = auth.uid()
    AND (cm.role = 'doctor' OR cm.role = 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Permission denied: only doctors or superadmins can delete consultations';
  END IF;

  DELETE FROM consultations WHERE id = p_consultation_id;
  RETURN FOUND;
END;
$$;

-- Get consultation by appointment
CREATE OR REPLACE FUNCTION "public"."get_consultation_by_appointment"("p_appointment_id" "text") RETURNS TABLE("id" "text", "appointment_id" "text", "chief_complaint" "text", "history_present_illness" "text", "physical_examination" "text", "assessment_diagnosis" "text", "plan_treatment" "text", "prescriptions" "jsonb", "notes" "text", "created_at" "text", "updated_at" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id::text,
    c.appointment_id::text,
    (c.specialty_data->>'chief_complaint')::text,
    (c.specialty_data->>'history_present_illness')::text,
    (c.specialty_data->>'physical_examination')::text,
    (c.specialty_data->>'assessment_diagnosis')::text,
    (c.specialty_data->>'plan_treatment')::text,
    (c.specialty_data->'prescriptions')::jsonb,
    (c.clinical_notes->>'notes')::text,
    c.created_at::text,
    c.created_at::text as updated_at
  FROM consultations c
  WHERE c.appointment_id::text = p_appointment_id;
END;
$$;

-- Get consultation details
CREATE OR REPLACE FUNCTION "public"."get_consultation_details"("p_consultation_id" "uuid") RETURNS TABLE("id" "uuid", "patient_id" "uuid", "appointment_id" "uuid", "chief_complaint" "text", "history_present_illness" "text", "physical_examination" "text", "assessment_diagnosis" "text", "plan_treatment" "text", "prescriptions" "jsonb", "notes" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "patient_details" "json")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Verify user has access to this consultation's clinic
  IF NOT EXISTS (
    SELECT 1 FROM consultations c
    JOIN patients p ON p.id = c.patient_id
    JOIN clinic_members cm ON cm.clinic_id = p.clinic_id
    WHERE c.id = p_consultation_id AND cm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permission denied: cannot access consultation details';
  END IF;

  RETURN QUERY
  SELECT 
    c.id,
    c.patient_id,
    c.appointment_id,
    (c.specialty_data->>'chief_complaint')::text,
    (c.specialty_data->>'history_present_illness')::text,
    (c.specialty_data->>'physical_examination')::text,
    (c.specialty_data->>'assessment_diagnosis')::text,
    (c.specialty_data->>'plan_treatment')::text,
    (c.specialty_data->'prescriptions')::jsonb,
    (c.clinical_notes->>'notes')::text,
    c.created_at,
    c.created_at as updated_at,
    json_build_object(
      'id', p.id,
      'name', p.name,
      'medical_id', p.medical_id,
      'gender', p.gender,
      'date_of_birth', p.date_of_birth
    ) as patient_details
  FROM consultations c
  JOIN patients p ON p.id = c.patient_id
  WHERE c.id = p_consultation_id;
END;
$$;

-- ================================
-- DOCTOR MANAGEMENT FUNCTIONS
-- ================================

-- Create doctor profile
CREATE OR REPLACE FUNCTION "public"."create_doctor_profile"("p_user_id" "uuid", "p_clinic_id" "uuid", "p_name" "text", "p_email" "text", "p_primary_specialization" "text" DEFAULT NULL::"text", "p_consultation_fee" numeric DEFAULT NULL::numeric, "p_availability" "jsonb" DEFAULT NULL::"jsonb", "p_bio" "text" DEFAULT NULL::"text", "p_department_id" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_doctor_id UUID;
    user_profile profiles%ROWTYPE;
BEGIN
    -- Validate required parameters
    IF p_user_id IS NULL OR p_clinic_id IS NULL THEN
        RAISE EXCEPTION 'Missing required parameters: p_user_id and p_clinic_id cannot be NULL';
    END IF;

    -- Get user profile information
    SELECT * INTO user_profile FROM profiles WHERE id = p_user_id;
    
    -- If no profile exists, ensure p_name and p_email are provided
    IF NOT FOUND THEN
        IF p_name IS NULL OR p_email IS NULL THEN
            RAISE EXCEPTION 'Profile not found for user_id %, and p_name or p_email is missing', p_user_id;
        END IF;
        user_profile.name := p_name;
        user_profile.email := p_email;
    END IF;
    
    -- Ensure user is a member of the clinic with role 'doctor'
    INSERT INTO clinic_members (user_id, clinic_id, role, department_id)
    VALUES (p_user_id, p_clinic_id, 'doctor', p_department_id)
    ON CONFLICT (user_id, clinic_id)
    DO UPDATE SET 
        role = EXCLUDED.role,
        department_id = EXCLUDED.department_id
    WHERE clinic_members.role != 'superadmin'; -- Preserve superadmin role

    -- Check if doctor profile already exists
    SELECT id INTO new_doctor_id
    FROM doctors
    WHERE user_id = p_user_id AND clinic_id = p_clinic_id;
    
    IF FOUND THEN
        RAISE NOTICE 'Doctor profile already exists for user_id % in clinic_id %', p_user_id, p_clinic_id;
        RETURN new_doctor_id;
    END IF;
    
    -- Create doctor profile
    INSERT INTO doctors (
        user_id,
        clinic_id,
        name,
        email,
        primary_specialization,
        consultation_fee,
        bio,
        is_active
    ) VALUES (
        p_user_id,
        p_clinic_id,
        COALESCE(p_name, user_profile.name),
        COALESCE(p_email, user_profile.email),
        p_primary_specialization,
        p_consultation_fee,
        p_bio,
        true
    ) RETURNING id INTO new_doctor_id;
    
    RETURN new_doctor_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create doctor profile for user_id % in clinic_id %: %', 
            p_user_id, p_clinic_id, SQLERRM;
END;
$$;

-- Get doctors by clinic
CREATE OR REPLACE FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "text") RETURNS TABLE("id" "text", "user_id" "text", "name" "text", "department_name" "text", "phone" "text", "email" "text", "bio" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id::text,
    d.user_id::text,
    COALESCE(d.name, p.name, 'Unknown Doctor') AS name,
    COALESCE(dt.name, 'General Medicine') AS department_name,
    p.phone,
    p.email,
    d.bio
  FROM doctors d
  LEFT JOIN profiles p ON p.id = d.user_id
  LEFT JOIN clinic_members cm ON cm.user_id = d.user_id AND cm.clinic_id = d.clinic_id
  LEFT JOIN clinic_departments cd ON cd.id = cm.department_id  
  LEFT JOIN department_types dt ON dt.id = cd.department_type_id
  WHERE d.clinic_id::uuid = get_doctors_by_clinic.clinic_id::uuid
    AND d.is_active = true;
END;
$$;

-- ================================
-- DASHBOARD FUNCTIONS
-- ================================

-- Get dashboard data
CREATE OR REPLACE FUNCTION "public"."get_dashboard_data"("_clinic_id" "uuid") RETURNS TABLE("total_patients" bigint, "total_doctors" bigint, "total_appointments" bigint, "appointments_today" bigint, "pending_consultations" bigint, "completed_consultations" bigint, "all_relevant_appointments" "json")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM patients WHERE clinic_id = _clinic_id) as total_patients,
        (SELECT COUNT(*) FROM doctors WHERE clinic_id = _clinic_id AND is_active = true) as total_doctors,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = _clinic_id) as total_appointments,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = _clinic_id AND date = CURRENT_DATE::TEXT) as appointments_today,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = _clinic_id AND status = 'In Progress') as pending_consultations,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = _clinic_id AND status = 'Completed') as completed_consultations,
        (SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
         FROM (
            SELECT 
                a.id,
                a.patient_id,
                a.doctor_id,
                a.date,
                a.time,
                a.type,
                a.status,
                a.clinic_id,
                p.name as patient_name,
                COALESCE(d.name, prof.name) as doctor_name
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN doctors d ON a.doctor_id = d.id
            LEFT JOIN profiles prof ON d.user_id = prof.id
            WHERE a.clinic_id = _clinic_id
            ORDER BY a.date DESC, a.time DESC
            LIMIT 10
         ) t) as all_relevant_appointments;
END;
$$;

-- Get doctor dashboard data
CREATE OR REPLACE FUNCTION "public"."get_doctor_dashboard_data"("_clinic_id" "uuid", "_user_id" "uuid") RETURNS TABLE("total_patients" bigint, "total_appointments" bigint, "pending_consultations" bigint, "completed_consultations" bigint, "upcoming_appointments" "json", "my_patients" "json")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    doc_id UUID;
BEGIN
    -- Get doctor ID for the user
    SELECT d.id INTO doc_id
    FROM doctors d
    WHERE d.user_id = _user_id AND d.clinic_id = _clinic_id;
    
    IF doc_id IS NULL THEN
        -- Return empty result if no doctor profile found
        RETURN QUERY
        SELECT 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, '[]'::JSON, '[]'::JSON;
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        (SELECT COUNT(DISTINCT a.patient_id) FROM appointments a WHERE a.clinic_id = _clinic_id AND a.doctor_id = doc_id) as total_patients,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = _clinic_id AND doctor_id = doc_id) as total_appointments,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = _clinic_id AND doctor_id = doc_id AND status = 'In Progress') as pending_consultations,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = _clinic_id AND doctor_id = doc_id AND status = 'Completed') as completed_consultations,
        (SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
         FROM (
            SELECT 
                a.id,
                a.patient_id,
                a.doctor_id,
                a.date,
                a.time,
                a.type,
                a.status,
                a.clinic_id,
                p.name as patient_name,
                COALESCE(d.name, prof.name) as doctor_name
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN doctors d ON a.doctor_id = d.id
            LEFT JOIN profiles prof ON d.user_id = prof.id
            WHERE a.clinic_id = _clinic_id AND a.doctor_id = doc_id
            AND a.date >= CURRENT_DATE::TEXT
            ORDER BY a.date ASC, a.time ASC
            LIMIT 5
         ) t) as upcoming_appointments,
        (SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
         FROM (
            SELECT DISTINCT ON (p.id) 
                p.id,
                p.name,
                p.email,
                p.phone,
                p.gender,
                p.date_of_birth,
                p.medical_id,
                p.address,
                p.clinic_id,
                p.created_at,
                MAX(a.created_at) as last_visit
            FROM patients p
            INNER JOIN appointments a ON p.id = a.patient_id
            WHERE a.clinic_id = _clinic_id AND a.doctor_id = doc_id
            GROUP BY p.id, p.name, p.email, p.phone, p.gender, p.date_of_birth, p.medical_id, p.address, p.clinic_id, p.created_at
            ORDER BY p.id, last_visit DESC
            LIMIT 10
         ) t) as my_patients;
END;
$$;

-- ================================
-- APPOINTMENT FUNCTIONS
-- ================================

-- Get appointments with details by clinic
CREATE OR REPLACE FUNCTION "public"."get_appointments_with_details_by_clinic"("clinic_id" "uuid") RETURNS TABLE("id" "text", "patient_id" "text", "doctor_id" "text", "date" "text", "time" "text", "type" "public"."appointment_type", "status" "public"."appointment_status", "notes" "text", "created_at" "text", "patient_name" "text", "doctor_name" "text", "department_name" "text", "billing_status" "text", "doctor_user_id" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id::text,
    a.patient_id::text,
    a.doctor_id::text,
    a.date::text,
    a."time"::text,
    a.type,
    a.status,
    a.notes,
    a.created_at::text,
    p.name AS patient_name,
    COALESCE(d.name, prof.name) AS doctor_name,
    COALESCE(dt.name, 'General') AS department_name,
    COALESCE(
      CASE 
        WHEN b.status = 'Paid'::bill_status THEN 'Paid'
        WHEN b.status = 'Overdue'::bill_status THEN 'Overdue'
        WHEN b.status = 'Pending'::bill_status THEN 'Pending'
        ELSE 'Pending'
      END,
      'Pending'
    ) AS billing_status,
    d.user_id::text
  FROM appointments a
  LEFT JOIN patients p ON a.patient_id = p.id
  LEFT JOIN doctors d ON a.doctor_id = d.id
  LEFT JOIN profiles prof ON d.user_id = prof.id
  LEFT JOIN clinic_members cm ON d.user_id = cm.user_id AND a.clinic_id = cm.clinic_id
  LEFT JOIN clinic_departments cd ON cm.department_id = cd.id
  LEFT JOIN department_types dt ON cd.department_type_id = dt.id
  LEFT JOIN bills b ON a.id = b.appointment_id
  WHERE a.clinic_id = get_appointments_with_details_by_clinic.clinic_id::uuid
  ORDER BY a.date DESC, a."time" DESC;
END;
$$;

-- ================================
-- BILLING FUNCTIONS
-- ================================

-- Get bills by clinic
CREATE OR REPLACE FUNCTION "public"."get_bills_by_clinic"("clinic_id" "text") RETURNS TABLE("id" "text", "patient_id" "text", "patient_name" "text", "appointment_id" "text", "amount" numeric, "status" "text", "invoice_number" "text", "due_date" "text", "created_at" "text", "updated_at" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id::text,
    b.patient_id::text,
    COALESCE(p.name, 'Unknown Patient') as patient_name,
    b.appointment_id::text,
    b.amount,
    b.status::text,
    b.invoice_number,
    ''::text as due_date,  -- Add due_date column later if needed
    b.created_at::text,
    b.updated_at::text
  FROM bills b
  LEFT JOIN patients p ON b.patient_id = p.id
  WHERE b.clinic_id::uuid = clinic_id::uuid
  ORDER BY b.created_at DESC;
END;
$$;

-- Generate invoice number
CREATE OR REPLACE FUNCTION "public"."generate_invoice_number"("clinic_id_arg" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  clinic_name TEXT;
  latest_invoice TEXT;
  next_number INTEGER;
  prefix TEXT;
  current_year TEXT := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
BEGIN
  -- Lock the bills table to prevent concurrent invoice number generation
  PERFORM 1 FROM bills WHERE clinic_id = clinic_id_arg FOR UPDATE;

  -- Get clinic name
  SELECT name INTO clinic_name FROM clinics WHERE id = clinic_id_arg;
  IF clinic_name IS NULL THEN
    RAISE EXCEPTION 'Clinic not found for ID %', clinic_id_arg;
  END IF;

  -- Create prefix with first letter of clinic name and current year
  prefix := UPPER(SUBSTRING(clinic_name FROM 1 FOR 1)) || '' || current_year || '';

  -- Get the latest invoice number for the clinic
  SELECT invoice_number INTO latest_invoice
  FROM bills
  WHERE clinic_id = clinic_id_arg
  AND invoice_number LIKE prefix || '%'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Extract the numeric part or start at 1
  IF latest_invoice IS NULL THEN
    next_number := 1;
  ELSE
    next_number := CAST(REGEXP_REPLACE(latest_invoice, '[^0-9]', '') AS INTEGER) + 1;
  END IF;

  -- Return formatted invoice number (e.g., C-2025-000001)
  RETURN prefix || LPAD(next_number::TEXT, 6, '0');
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback to a temporary unique number based on timestamp and random
    RETURN 'TEMP-' || current_year || '-' || LPAD(FLOOR(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000 + RANDOM() * 1000)::INTEGER::TEXT, 10, '0');
END;
$$;

-- ================================
-- PROFILE & USER MANAGEMENT FUNCTIONS
-- ================================

-- Create profile for new user
CREATE OR REPLACE FUNCTION "public"."create_profile_for_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(
      (NEW.raw_user_meta_data->>'name')::text,
      (NEW.raw_user_meta_data->>'full_name')::text,
      NEW.email
    )
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name
  WHERE profiles.name IS NULL;
  RETURN NEW;
END;
$$;

-- Update profile
CREATE OR REPLACE FUNCTION "public"."update_profile"("p_user_id" "uuid", "p_name" "text", "p_email" "text", "p_phone" "text") RETURNS "public"."profiles"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_profile profiles;
BEGIN
  -- Skip auth.uid() check for service role
  IF current_setting('role', true) != 'service_role' AND p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Permission denied: cannot update other user profiles';
  END IF;

  INSERT INTO profiles (id, name, email, phone, updated_at)
  VALUES (
    p_user_id, 
    COALESCE(p_name, p_email, 'Unknown'),
    COALESCE(p_email, 'unknown@example.com'),
    p_phone, 
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = COALESCE(EXCLUDED.name, profiles.name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    updated_at = NOW()
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;

-- Get profile
CREATE OR REPLACE FUNCTION "public"."get_profile"("user_id" "uuid") RETURNS TABLE("id" "uuid", "email" "text", "name" "text", "phone" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Only return profile if user is requesting their own or is admin
    IF auth.uid() = user_id OR 
       EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'is_admin' = 'true')
    THEN
        RETURN QUERY
        SELECT p.id, p.email, p.name, p.phone, p.created_at, p.updated_at
        FROM public.profiles p
        WHERE p.id = user_id;
    END IF;
END;
$$;

-- Get profile details
CREATE OR REPLACE FUNCTION "public"."get_profile_details"("p_user_id" "uuid") RETURNS TABLE("id" "uuid", "name" "text", "email" "text", "phone" "text", "address" "text", "medical_license_number" "text", "medical_license_expiry" "date", "specialization" "text", "qualifications" "text", "avatar_url" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "clinics" "json")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Only allow users to view their own profile
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Permission denied: cannot access other user profiles';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.email,
    p.phone,
    ''::text as address,  -- Add these fields to profiles table if needed
    ''::text as medical_license_number,
    NULL::date as medical_license_expiry,
    ''::text as specialization,
    ''::text as qualifications,
    p.avatar_url,
    p.created_at,
    p.updated_at,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'role', cm.role
        )
      ) FILTER (WHERE c.id IS NOT NULL),
      '[]'::jsonb
    )::JSON as clinics
  FROM profiles p
  LEFT JOIN clinic_members cm ON cm.user_id = p.id
  LEFT JOIN clinics c ON c.id = cm.clinic_id
  WHERE p.id = p_user_id
  GROUP BY p.id;
END;
$$;

-- Update profile image
CREATE OR REPLACE FUNCTION "public"."update_profile_image"("p_user_id" "uuid", "p_avatar_url" "text") RETURNS "public"."profiles"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_profile profiles;
BEGIN
  -- Only allow users to update their own profile image
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Permission denied: cannot update other user profile images';
  END IF;

  UPDATE profiles
  SET
    avatar_url = p_avatar_url,
    updated_at = NOW()
  WHERE id = p_user_id
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;

-- Get profile image URL
CREATE OR REPLACE FUNCTION "public"."get_profile_image_url"("p_user_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_url TEXT;
BEGIN
  -- Only allow users to get their own profile image
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Permission denied: cannot access other user profile images';
  END IF;

  SELECT avatar_url INTO v_url
  FROM profiles
  WHERE id = p_user_id;

  RETURN v_url;
END;
$$;

-- ================================
-- MEDICINE & PRESCRIPTION FUNCTIONS
-- ================================

-- Search medicines
CREATE OR REPLACE FUNCTION "public"."search_medicines"("search_term" "text" DEFAULT ''::"text", "limit_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "name" "text", "price" numeric, "is_discontinued" boolean, "manufacturer_name" "text", "pack_size_label" "text", "pack_type" "text", "short_composition1" "text", "short_composition2" "text", "created_at" timestamp with time zone)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT 
    m.id,
    m.name,
    m.price,
    m.is_discontinued,
    m.manufacturer_name,
    m.pack_size_label,
    m.pack_type,
    m.short_composition1,
    m.short_composition2,
    m.created_at
  FROM medicines m
  WHERE 
    (search_term = '' OR 
     m.name ILIKE '%' || search_term || '%' OR
     m.short_composition1 ILIKE '%' || search_term || '%' OR
     m.short_composition2 ILIKE '%' || search_term || '%' OR
     m.manufacturer_name ILIKE '%' || search_term || '%')
    AND (m.is_discontinued IS NULL OR m.is_discontinued = false)
  ORDER BY 
    -- Exact matches first
    CASE WHEN LOWER(m.name) = LOWER(search_term) THEN 1 ELSE 2 END,
    -- Then starts with search term
    CASE WHEN LOWER(m.name) LIKE LOWER(search_term) || '%' THEN 1 ELSE 2 END,
    -- Then alphabetical
    m.name
  LIMIT limit_count;
$$;

-- ================================
-- PUBLIC CLINIC FUNCTIONS
-- ================================

-- Get public clinics
CREATE OR REPLACE FUNCTION "public"."get_public_clinics"("search_term" "text" DEFAULT NULL::"text", "limit_count" integer DEFAULT NULL::integer) RETURNS TABLE("id" "text", "name" "text", "slug" "text", "description" "text", "address" "text", "phone" "text", "email" "text", "website" "text", "operating_hours" "jsonb", "social_media" "jsonb", "clinic_images" "text"[], "established_year" integer, "license_number" "text", "accreditations" "text"[], "is_public" boolean, "doctor_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id::text,
    c.name,
    c.slug,
    c.description,
    c.address,
    c.phone,
    c.email,
    c.website,
    c.operating_hours::jsonb,
    c.social_media::jsonb,
    c.clinic_images,
    c.established_year,
    c.license_number,
    c.accreditations,
    c.is_public,
    COUNT(d.id) as doctor_count
  FROM clinics c
  LEFT JOIN doctors d ON c.id = d.clinic_id
  WHERE c.is_public = true
  AND (
    search_term IS NULL
    OR c.name ILIKE '%' || search_term || '%'
    OR c.address ILIKE '%' || search_term || '%'
    OR c.description ILIKE '%' || search_term || '%'
  )
  GROUP BY c.id
  ORDER BY c.created_at DESC
  LIMIT CASE 
    WHEN limit_count IS NOT NULL THEN limit_count
    ELSE NULL
  END;
END;
$$;

-- Get public clinic by slug
CREATE OR REPLACE FUNCTION "public"."get_public_clinic_by_slug"("p_slug" "text") RETURNS TABLE("id" "text", "name" "text", "slug" "text", "description" "text", "address" "text", "phone" "text", "email" "text", "website" "text", "operating_hours" "jsonb", "social_media" "jsonb", "clinic_images" "text"[], "established_year" integer, "license_number" "text", "accreditations" "text"[], "is_public" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id::text,
    c.name,
    c.slug,
    c.description,
    c.address,
    c.phone,
    c.email,
    c.website,
    c.operating_hours::jsonb,
    c.social_media::jsonb,
    c.clinic_images,
    c.established_year,
    c.license_number,
    c.accreditations,
    c.is_public
  FROM clinics c
  WHERE c.slug = p_slug AND c.is_public = true;
END;
$$;

-- Get public doctors by clinic
CREATE OR REPLACE FUNCTION "public"."get_public_doctors_by_clinic"("p_clinic_id" "text") RETURNS TABLE("id" "text", "name" "text", "primary_specialization" "text", "medical_specializations" "text"[], "years_of_experience" integer, "bio" "text", "consultation_fee" numeric, "languages_spoken" "text"[], "medical_qualifications" "text"[], "department_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id::text,
    d.name,
    d.primary_specialization,
    ARRAY[]::text[] as medical_specializations,  -- Add these fields if needed
    0 as years_of_experience,
    d.bio,
    d.consultation_fee,
    ARRAY[]::text[] as languages_spoken,
    ARRAY[]::text[] as medical_qualifications,
    COALESCE(dt.name, 'General') as department_name
  FROM doctors d
  LEFT JOIN clinic_members cm ON d.user_id = cm.user_id AND d.clinic_id = cm.clinic_id
  LEFT JOIN clinic_departments cd ON cm.department_id = cd.id
  LEFT JOIN department_types dt ON cd.department_type_id = dt.id
  WHERE d.clinic_id::uuid = p_clinic_id::uuid
  AND d.clinic_id IN (
    SELECT c.id FROM clinics c WHERE c.is_public = true
  );
END;
$$;

-- ================================
-- UTILITY FUNCTIONS
-- ================================

-- Generate clinic slug
CREATE OR REPLACE FUNCTION "public"."generate_clinic_slug"("clinic_name" "text", "clinic_id" "uuid" DEFAULT NULL::"uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
  existing_count integer;
BEGIN
  -- Convert clinic name to slug format
  base_slug := lower(trim(clinic_name));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Ensure minimum length
  IF length(base_slug) < 3 THEN
    base_slug := base_slug || '-clinic';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for existing slugs and increment if needed
  LOOP
    SELECT COUNT(*) INTO existing_count 
    FROM clinics 
    WHERE slug = final_slug 
    AND (clinic_id IS NULL OR id != clinic_id);
    
    IF existing_count = 0 THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Set clinic slug trigger
CREATE OR REPLACE FUNCTION "public"."set_clinic_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_clinic_slug(NEW.name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- Submit contact form
CREATE OR REPLACE FUNCTION "public"."submit_contact_form"("name" "text", "email" "text", "message" "text", "phone" "text" DEFAULT NULL::"text", "company" "text" DEFAULT NULL::"text", "city" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  message_id uuid;
BEGIN
  INSERT INTO public.contact_messages (name, email, phone, company, city, message)
  VALUES (name, email, phone, company, city, message)
  RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$$;

-- Debug invitation flow
CREATE OR REPLACE FUNCTION "public"."debug_invitation_flow"("user_email" "text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'user_exists', EXISTS(SELECT 1 FROM auth.users WHERE email = user_email),
    'profile_exists', EXISTS(SELECT 1 FROM public.profiles WHERE email = user_email),
    'pending_invitations', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'clinic_id', clinic_id,
          'role', role,
          'name', name,
          'phone', phone,
          'created_at', created_at,
          'accepted_at', accepted_at,
          'expires_at', expires_at
        )
      )
      FROM public.pending_invitations
      WHERE email = user_email
    ),
    'clinic_memberships', (
      SELECT json_agg(
        json_build_object(
          'clinic_id', clinic_id,
          'role', role,
          'department_id', department_id,
          'created_at', created_at
        )
      )
      FROM public.clinic_members cm
      JOIN auth.users u ON cm.user_id = u.id
      WHERE u.email = user_email
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Fix empty display names
CREATE OR REPLACE FUNCTION "public"."fix_empty_display_names"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_record RECORD;
  fixed_count INTEGER := 0;
  new_name TEXT;
BEGIN
  -- Find users with empty or null names
  FOR user_record IN 
    SELECT p.id, p.email, p.name, u.raw_user_meta_data
    FROM public.profiles p
    JOIN auth.users u ON p.id = u.id
    WHERE p.name IS NULL OR p.name = '' OR p.name = '-'
  LOOP
    -- Extract name from metadata
    new_name := COALESCE(
      user_record.raw_user_meta_data->>'full_name',
      user_record.raw_user_meta_data->>'name',
      user_record.raw_user_meta_data->>'display_name',
      user_record.raw_user_meta_data->>'given_name' || ' ' || user_record.raw_user_meta_data->>'family_name',
      user_record.raw_user_meta_data->>'first_name' || ' ' || user_record.raw_user_meta_data->>'last_name'
    );
    
    -- Clean up the name
    IF new_name IS NOT NULL THEN
      new_name := trim(regexp_replace(new_name, '\s+', ' ', 'g'));
      -- If name is empty after cleaning, use email prefix
      IF new_name = '' OR new_name IS NULL THEN
        new_name := split_part(user_record.email, '@', 1);
      END IF;
    ELSE
      new_name := split_part(user_record.email, '@', 1);
    END IF;
    
    -- Update the profile
    UPDATE public.profiles
    SET name = new_name, updated_at = NOW()
    WHERE id = user_record.id;
    
    fixed_count := fixed_count + 1;
    RAISE NOTICE 'Fixed display name for user %: % -> %', user_record.email, user_record.name, new_name;
  END LOOP;
  
  RETURN fixed_count;
END;
$$;

-- ================================
-- TRIGGER FUNCTIONS
-- ================================

-- Ensure doctor has clinic member
CREATE OR REPLACE FUNCTION "public"."ensure_doctor_has_clinic_member"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Ensure that when a doctor is created, there's a corresponding clinic_member record
    IF TG_OP = 'INSERT' THEN
        -- Check if clinic member already exists
        IF NOT EXISTS (
            SELECT 1 FROM clinic_members cm
            WHERE cm.user_id = NEW.user_id AND cm.clinic_id = NEW.clinic_id
        ) THEN
            -- Create clinic member record with doctor role
            INSERT INTO clinic_members (user_id, clinic_id, role)
            VALUES (NEW.user_id, NEW.clinic_id, 'doctor')
            ON CONFLICT (user_id, clinic_id) DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Sync doctor name
CREATE OR REPLACE FUNCTION "public"."sync_doctor_name"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE doctors
  SET name = NEW.name,
      updated_at = NOW()
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;

-- Update clinic credits updated_at
CREATE OR REPLACE FUNCTION "public"."update_clinic_credits_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Update updated_at column
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Validate bill items
CREATE OR REPLACE FUNCTION "public"."validate_bill_items"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    item JSONB;
BEGIN
    -- Validate that items is an array
    IF NOT jsonb_typeof(NEW.items) = 'array' THEN
        RAISE EXCEPTION 'items must be an array';
    END IF;

    -- Validate each item in the array
    FOR item IN SELECT value FROM jsonb_array_elements(NEW.items)
    LOOP
        IF NOT (
            jsonb_typeof(item->>'description') = 'string' AND
            (item->>'description')::text <> '' AND
            jsonb_typeof(item->>'amount') IN ('number', 'string') AND
            (item->>'amount')::decimal >= 0 AND
            jsonb_typeof(item->>'quantity') IN ('number', 'string') AND
            (item->>'quantity')::integer >= 1
        ) THEN
            RAISE EXCEPTION 'Each item must have a non-empty description, non-negative amount, and quantity >= 1';
        END IF;
    END LOOP;

    -- Calculate total amount from items
    NEW.amount = (
        SELECT COALESCE(SUM((value->>'amount')::decimal * (value->>'quantity')::integer), 0)
        FROM jsonb_array_elements(NEW.items)
    );

    RETURN NEW;
END;
$$;

-- Handle new user manual (enhanced version of existing function)
CREATE OR REPLACE FUNCTION "public"."handle_new_user_manual"("user_record" "auth"."users") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_name TEXT;
  user_phone TEXT;
  clinic_id_from_metadata UUID;
  role_from_metadata TEXT;
  invitation_token_from_metadata UUID;
BEGIN
  -- Extract user name
  user_name := COALESCE(
    user_record.raw_user_meta_data->>'name',
    user_record.raw_user_meta_data->>'full_name',
    user_record.raw_user_meta_data->>'display_name',
    split_part(user_record.email, '@', 1)
  );
  
  -- Extract phone
  user_phone := COALESCE(
    user_record.phone,
    user_record.raw_user_meta_data->>'phone'
  );
  
  -- Extract metadata
  clinic_id_from_metadata := (user_record.raw_user_meta_data->>'clinic_id')::UUID;
  role_from_metadata := user_record.raw_user_meta_data->>'role';
  invitation_token_from_metadata := (user_record.raw_user_meta_data->>'invitation_token')::UUID;
  
  -- Create or update profile
  INSERT INTO public.profiles (id, name, email, phone, created_at, updated_at)
  VALUES (user_record.id, user_name, user_record.email, user_phone, user_record.created_at, user_record.updated_at)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    updated_at = NOW();
  
  -- Create clinic membership if metadata exists
  IF clinic_id_from_metadata IS NOT NULL AND role_from_metadata IS NOT NULL THEN
    INSERT INTO public.clinic_members (clinic_id, user_id, role, department_id, created_at, updated_at)
    VALUES (clinic_id_from_metadata, user_record.id, role_from_metadata::user_role, NULL, NOW(), NOW())
    ON CONFLICT (user_id, clinic_id) DO NOTHING;
    
    -- Create doctor profile if needed
    IF role_from_metadata = 'doctor' THEN
      INSERT INTO public.doctors (user_id, clinic_id, name, email, phone, is_active, created_at, updated_at)
      VALUES (user_record.id, clinic_id_from_metadata, user_name, user_record.email, user_phone, true, NOW(), NOW())
      ON CONFLICT (user_id, clinic_id) DO NOTHING;
    END IF;
    
    -- Mark invitation as accepted
    IF invitation_token_from_metadata IS NOT NULL THEN
      UPDATE public.pending_invitations
      SET accepted_at = NOW(), updated_at = NOW()
      WHERE invitation_token = invitation_token_from_metadata;
    END IF;
  END IF;
END;
$$;

-- Add function ownership to postgres
ALTER FUNCTION "public"."add_clinic_credits"("clinic_id_param" "uuid", "credits_to_add" integer, "transaction_id_param" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."add_clinic_credits"("p_clinic_id" "uuid", "p_credits" integer, "p_payment_id" "text", "p_order_id" "text") OWNER TO "postgres";
ALTER FUNCTION "public"."add_clinic_member"("new_user_id" "uuid", "target_clinic_id" "uuid", "new_role" "public"."user_role", "new_department_id" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."create_clinic_with_admin"("clinic_name" "text", "user_phone" "text") OWNER TO "postgres";
ALTER FUNCTION "public"."create_consultation"("p_patient_id" "uuid", "p_appointment_id" "uuid", "p_chief_complaint" "text", "p_history_present_illness" "text", "p_physical_examination" "text", "p_assessment_diagnosis" "text", "p_plan_treatment" "text", "p_prescriptions" "jsonb", "p_notes" "text") OWNER TO "postgres";
ALTER FUNCTION "public"."create_doctor_profile"("p_user_id" "uuid", "p_clinic_id" "uuid", "p_name" "text", "p_email" "text", "p_primary_specialization" "text", "p_consultation_fee" numeric, "p_availability" "jsonb", "p_bio" "text", "p_department_id" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."create_patient"("p_clinic_id" "uuid", "p_name" "text", "p_phone" "text", "p_email" "text", "p_medical_id" "text", "p_gender" "text", "p_address" "text", "p_date_of_birth" "date") OWNER TO "postgres";
ALTER FUNCTION "public"."create_profile_for_new_user"() OWNER TO "postgres";
ALTER FUNCTION "public"."debug_invitation_flow"("user_email" "text") OWNER TO "postgres";
ALTER FUNCTION "public"."deduct_appointment_credit"("appointment_id_param" "uuid", "clinic_id_param" "uuid", "credits_to_deduct" integer) OWNER TO "postgres";
ALTER FUNCTION "public"."delete_consultation"("p_consultation_id" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."delete_patient"("p_patient_id" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."ensure_doctor_has_clinic_member"() OWNER TO "postgres";
ALTER FUNCTION "public"."fix_empty_display_names"() OWNER TO "postgres";
ALTER FUNCTION "public"."generate_clinic_slug"("clinic_name" "text", "clinic_id" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."generate_invoice_number"("clinic_id_arg" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."get_appointments_with_details_by_clinic"("clinic_id" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."get_bills_by_clinic"("clinic_id" "text") OWNER TO "postgres";
ALTER FUNCTION "public"."get_clinic_billing_summary"("clinic_id_param" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."get_clinic_credit_balance"("clinic_id_param" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."get_clinic_members"("p_clinic_id" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."get_consultation_by_appointment"("p_appointment_id" "text") OWNER TO "postgres";
ALTER FUNCTION "public"."get_consultation_details"("p_consultation_id" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."get_dashboard_data"("_clinic_id" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."get_doctor_dashboard_data"("_clinic_id" "uuid", "_user_id" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "text") OWNER TO "postgres";
ALTER FUNCTION "public"."get_patient_details"("p_patient_id" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer, "_offset" integer) OWNER TO "postgres";
ALTER FUNCTION "public"."get_profile"("user_id" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."get_profile_details"("p_user_id" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."get_profile_image_url"("p_user_id" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."get_public_clinic_by_slug"("p_slug" "text") OWNER TO "postgres";
ALTER FUNCTION "public"."get_public_clinics"("search_term" "text", "limit_count" integer) OWNER TO "postgres";
ALTER FUNCTION "public"."get_public_doctors_by_clinic"("p_clinic_id" "text") OWNER TO "postgres";
ALTER FUNCTION "public"."get_user_clinic_memberships"("user_id" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."get_user_clinics"() OWNER TO "postgres";
ALTER FUNCTION "public"."get_user_clinics_simple"() OWNER TO "postgres";
ALTER FUNCTION "public"."is_superadmin_in_clinic"("check_clinic_id" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."search_medicines"("search_term" "text", "limit_count" integer) OWNER TO "postgres";
ALTER FUNCTION "public"."set_clinic_slug"() OWNER TO "postgres";
ALTER FUNCTION "public"."submit_contact_form"("name" "text", "email" "text", "message" "text", "phone" "text", "company" "text", "city" "text") OWNER TO "postgres";
ALTER FUNCTION "public"."sync_doctor_name"() OWNER TO "postgres";
ALTER FUNCTION "public"."update_clinic_credits_updated_at"() OWNER TO "postgres";
ALTER FUNCTION "public"."update_clinic_member_details"("member_user_id" "uuid", "target_clinic_id" "uuid", "updated_role" "public"."user_role", "updated_department_id" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."update_consultation"("p_consultation_id" "uuid", "p_chief_complaint" "text", "p_history_present_illness" "text", "p_physical_examination" "text", "p_assessment_diagnosis" "text", "p_plan_treatment" "text", "p_prescriptions" "jsonb", "p_notes" "text") OWNER TO "postgres";
ALTER FUNCTION "public"."update_patient"("p_patient_id" "uuid", "p_name" "text", "p_phone" "text", "p_email" "text", "p_medical_id" "text", "p_gender" "text", "p_address" "text", "p_date_of_birth" "date") OWNER TO "postgres";
ALTER FUNCTION "public"."update_profile"("p_user_id" "uuid", "p_name" "text", "p_email" "text", "p_phone" "text") OWNER TO "postgres";
ALTER FUNCTION "public"."update_profile_image"("p_user_id" "uuid", "p_avatar_url" "text") OWNER TO "postgres";
ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";
ALTER FUNCTION "public"."validate_bill_items"() OWNER TO "postgres";
ALTER FUNCTION "public"."handle_new_user_manual"("user_record" "auth"."users") OWNER TO "postgres";