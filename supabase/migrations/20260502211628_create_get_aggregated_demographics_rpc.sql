CREATE OR REPLACE FUNCTION public.get_aggregated_demographics(
  _clinic_id uuid,
  _doctor_id uuid DEFAULT NULL
)
RETURNS TABLE(
  age_groups json,
  gender_split json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
     FROM (
       SELECT
         CASE
           WHEN p.age IS NULL THEN 'Unknown'
           WHEN p.age <= 18 THEN '0-18'
           WHEN p.age <= 30 THEN '19-30'
           WHEN p.age <= 45 THEN '31-45'
           WHEN p.age <= 60 THEN '46-60'
           ELSE '60+'
         END as age_group,
         COUNT(DISTINCT p.id)::bigint as count
       FROM patients p
       INNER JOIN appointments a ON p.id = a.patient_id AND a.clinic_id = _clinic_id
       WHERE p.clinic_id = _clinic_id
         AND (_doctor_id IS NULL OR a.doctor_id = _doctor_id)
       GROUP BY age_group
       ORDER BY age_group
     ) t) as age_groups,
    (SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
     FROM (
       SELECT
         COALESCE(NULLIF(p.gender, ''), 'Unknown') as gender,
         COUNT(DISTINCT p.id)::bigint as count
       FROM patients p
       INNER JOIN appointments a ON p.id = a.patient_id AND a.clinic_id = _clinic_id
       WHERE p.clinic_id = _clinic_id
         AND (_doctor_id IS NULL OR a.doctor_id = _doctor_id)
       GROUP BY gender
       ORDER BY count DESC
     ) t) as gender_split;
END;
$function$;
