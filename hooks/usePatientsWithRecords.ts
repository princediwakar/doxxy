"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import type {
  PatientWithConsultations,
  ConsultationWithAppointment,
  AppointmentStatus,
  DoctorWithDepartmentInfo,
} from "@/types/patients";

const supabase = getSupabase();

type RpcDoctor = { id: string; name: string; department_name: string };

type ConsultationBatchRow = {
  patient_id: string;
  appointments: {
    id?: string;
    date?: string;
    time?: string;
    status?: string;
    doctor_id?: string;
  } | null;
} & Record<string, unknown>;

type PrescriptionBatchRow = {
  patient_id: string;
} & Record<string, unknown>;

async function fetchPatientsWithMedicalRecords(
  clinicId: string,
  searchTerm: string,
  currentPage: number,
  itemsPerPage: number
): Promise<{ patients: PatientWithConsultations[]; totalCount: number }> {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage - 1;

  // Count query
  let countQuery = supabase
    .from("patients")
    .select("*", { count: "exact", head: true })
    .eq("clinic_id", clinicId);

  if (searchTerm.trim()) {
    countQuery = countQuery.ilike("name", `%${searchTerm}%`);
  }

  const { count: totalCount, error: countError } = await countQuery;
  if (countError) throw countError;

  if (!totalCount || totalCount === 0) {
    return { patients: [], totalCount: 0 };
  }

  // Paginated fetch
  let patientsQuery = supabase
    .from("patients")
    .select("*")
    .eq("clinic_id", clinicId)
    .range(startIndex, endIndex);

  if (searchTerm.trim()) {
    patientsQuery = patientsQuery.ilike("name", `%${searchTerm}%`);
  }

  const { data: patients, error: patientsError } = await patientsQuery;
  if (patientsError) throw patientsError;

  let doctors: RpcDoctor[] = [];

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_doctors_by_clinic",
    { clinic_id: clinicId }
  );

  if (!rpcError && rpcData) {
    doctors = rpcData as unknown as RpcDoctor[];
  } else {
    const { data: fallbackData } = await supabase
      .from("doctors")
      .select(
        `
        id,
        name,
        primary_specialization,
        clinic_members!clinic_members_user_id_fkey(
          department_id,
          clinic_departments!clinic_members_department_id_fkey(
            department_type_id,
            department_types!clinic_departments_department_type_id_fkey(name)
          )
        )
      `
      )
      .eq("clinic_id", clinicId)
      .eq("is_active", true);

    const typedFallbackData = (fallbackData || []) as unknown as DoctorWithDepartmentInfo[];

    doctors = typedFallbackData.map((doctor) => ({
      id: doctor.id,
      name: doctor.name,
      department_name:
        doctor.clinic_members?.[0]?.clinic_departments
          ?.department_types?.name ||
        doctor.primary_specialization ||
        "General Medicine",
    }));
  }

  const patientIds = (patients || []).map((p) => p.id);

  // Batch-fetch consultations and prescriptions for all patients on this page
  let allConsultations: ConsultationBatchRow[] = [];
  let allPrescriptions: PrescriptionBatchRow[] = [];

  if (patientIds.length > 0) {
    const [consultationsResult, prescriptionsResult] = await Promise.all([
      supabase
        .from("consultations")
        .select(
          `
          *,
          appointments(
            id,
            date,
            time,
            status,
            doctor_id
          )
        `
        )
        .in("patient_id", patientIds)
        .order("created_at", { ascending: false }),
      supabase
        .from("prescriptions")
        .select("*")
        .in("patient_id", patientIds)
        .order("created_at", { ascending: false }),
    ]);

    allConsultations = (consultationsResult.data || []) as ConsultationBatchRow[];
    allPrescriptions = (prescriptionsResult.data || []) as PrescriptionBatchRow[];
  }

  const consultationsByPatient = new Map<string, typeof allConsultations>();
  const prescriptionsByPatient = new Map<string, typeof allPrescriptions>();

  for (const c of allConsultations || []) {
    const list = consultationsByPatient.get(c.patient_id) || [];
    list.push(c);
    consultationsByPatient.set(c.patient_id, list);
  }
  for (const p of allPrescriptions || []) {
    const list = prescriptionsByPatient.get(p.patient_id) || [];
    list.push(p);
    prescriptionsByPatient.set(p.patient_id, list);
  }

  const patientsWithRecords = (patients || []).map((patient) => {
    const consultations = consultationsByPatient.get(patient.id) || [];
    const prescriptions = prescriptionsByPatient.get(patient.id) || [];

    const completedConsultations = consultations
      .filter(
        (c) =>
          (c.appointments?.status || "").toLowerCase() === "completed"
      )
      .map((consultation) => {
        if (!consultation.appointments?.doctor_id) {
          return {
            ...consultation,
            appointment: {
              ...consultation.appointments,
              status: consultation.appointments?.status,
              doctor_name: "Unknown Doctor",
              department_name: "Unknown Department",
              date: new Date().toISOString().split("T")[0],
              time: "00:00:00",
            },
          } as unknown as ConsultationWithAppointment;
        }

        const doctor = doctors.find(
          (d) => d.id === consultation.appointments?.doctor_id
        );

        return {
          ...consultation,
          appointment: {
            ...consultation.appointments,
            status: (consultation.appointments?.status || undefined) as
              | AppointmentStatus
              | undefined,
            doctor_name: doctor?.name || "Unknown Doctor",
            department_name: doctor?.department_name || "Unknown Department",
            date: String(
              consultation.appointments?.date ||
                new Date().toISOString().split("T")[0]
            ),
            time: String(consultation.appointments?.time || "00:00:00"),
          },
        } as unknown as ConsultationWithAppointment;
      });

    return {
      ...patient,
      consultations: completedConsultations,
      prescriptions,
    } as PatientWithConsultations;
  });

  return {
    patients: patientsWithRecords,
    totalCount,
  };
}

export function usePatientsWithRecords(
  clinicId: string,
  searchTerm: string,
  currentPage: number,
  itemsPerPage: number,
  enabled: boolean
) {
  return useQuery({
    queryKey: queryKeys.patients.withRecords(clinicId, searchTerm, currentPage),
    queryFn: () =>
      fetchPatientsWithMedicalRecords(
        clinicId,
        searchTerm,
        currentPage,
        itemsPerPage
      ),
    enabled: enabled && !!clinicId,
    retry: 1,
    staleTime: 60 * 1000,
  });
}
