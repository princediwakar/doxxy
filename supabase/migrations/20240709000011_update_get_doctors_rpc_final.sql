CREATE OR REPLACE FUNCTION public.get_doctors_by_clinic(clinic_id uuid)
 RETURNS TABLE(id uuid, name text, email text, phone text, availability text, bio text, created_at timestamp with time zone, role user_role, department_name text, department_id uuid)
 LANGUAGE sql
 STABLE
AS $function$
  SELECT
    d.id,
    p.name,
    p.email,
    d.phone,
    d.availability,
    d.bio,
    p.created_at,
    cm.role::public.user_role,
    dt.name AS department_name,
    cm.department_id
  FROM
    public.doctors d
  JOIN
    public.profiles p ON d.user_id = p.id
  LEFT JOIN -- Use LEFT JOIN here as a doctor might not have a clinic_member entry if invited but not accepted/assigned role
    public.clinic_members cm ON d.user_id = cm.user_id AND d.clinic_id = cm.clinic_id AND cm.role = 'doctor'
  LEFT JOIN
    public.clinic_departments cd ON cm.department_id = cd.id
  LEFT JOIN
    public.department_types dt ON cd.department_type_id = dt.id
  WHERE d.clinic_id = get_doctors_by_clinic.clinic_id;
$function$; 