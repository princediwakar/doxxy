create or replace function get_patients()
returns table (
  id uuid,
  name text,
  email text,
  phone text,
  date_of_birth date,
  gender text,
  medical_id text
) language plpgsql security definer as $$
begin
  return query
  select p.id, p.name, p.email, p.phone, p.date_of_birth, p.gender, p.medical_id
  from patients p;
end;
$$;


create or replace function get_doctors()
returns table (
  id uuid,
  name text,
  email text,
  phone text,
  specialization text,
  bio text
) language plpgsql security definer as $$
begin
  return query
  select d.id, d.name, d.email, d.phone, d.specialization, d.bio
  from doctors d;
end;
$$;

create or replace function get_appointments_with_details()
returns table (
  id uuid,
  patient_id uuid,
  doctor_id uuid,
  date date,
  appointment_time time,  -- Changed from 'time' to 'appointment_time'
  type text,
  status text,
  department text,
  notes text,
  created_at timestamptz,
  -- Patient details
  patient_name text,
  patient_email text,
  patient_phone text,
  patient_medical_id text,
  -- Doctor details
  doctor_name text,
  doctor_email text,
  doctor_specialization text
) language plpgsql security definer as $$
begin
  return query
  select 
    a.id,
    a.patient_id,
    a.doctor_id,
    a.date,
    a.time as appointment_time,  -- Changed to match the return type
    a.type,
    a.status,
    a.department,
    a.notes,
    a.created_at,
    -- Patient details
    p.name as patient_name,
    p.email as patient_email,
    p.phone as patient_phone,
    p.medical_id as patient_medical_id,
    -- Doctor details
    d.name as doctor_name,
    d.email as doctor_email,
    d.specialization as doctor_specialization
  from appointments a
  left join patients p on a.patient_id = p.id
  left join doctors d on a.doctor_id = d.id
  order by a.date desc, a.time desc;
end;
$$;