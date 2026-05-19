import { getTodayAppointments, resolveUserDoctor, getPatientById } from '@/lib/data/today';
import { getActiveDoctors } from '@/lib/data/doctors';
import { getAuthenticatedUser, getActiveClinic } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { TodayPageClient } from './TodayPageClient';

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getAuthenticatedUser();
  const clinicMember = await getActiveClinic(user.id);
  const clinicId = clinicMember?.clinic_id ?? null;

  if (!clinicId) {
    return (
      <TodayPageClient
        clinicId={null}
        serverQueue={{ inProgress: [], scheduled: [], completed: [] }}
        initialPatientId={null}
        initialPatientDetail={null}
        doctors={[]}
        effectiveDoctorFilter={null}
        userDoctorId={null}
      />
    );
  }

  const params = await searchParams;
  const selectedPatientId =
    typeof params.patient === 'string' ? params.patient : null;
  const selectedDate =
    typeof params.date === 'string' ? params.date : null;

  const userDoctorId = await resolveUserDoctor(user.id, clinicId);
  const doctorFilterParam =
    typeof params.doctor === 'string' ? params.doctor : undefined;
  const effectiveDoctorFilter =
    doctorFilterParam === 'all'
      ? null
      : (doctorFilterParam ?? userDoctorId ?? null);

  const [queue, doctors] = await Promise.all([
    getTodayAppointments(clinicId, effectiveDoctorFilter, selectedDate),
    getActiveDoctors(clinicId),
  ]);

  // Auto-select first scheduled (fallback in-progress) if no patient selected
  if (!selectedPatientId) {
    const firstApp = queue.scheduled[0] || queue.inProgress[0];
    if (firstApp) {
      const redirectParams = new URLSearchParams();
      redirectParams.set('patient', firstApp.patient_id);
      redirectParams.set('appointment', firstApp.id);
      if (doctorFilterParam) redirectParams.set('doctor', doctorFilterParam);
      if (selectedDate) redirectParams.set('date', selectedDate);
      redirect(`/schedule?${redirectParams.toString()}`);
    }
  }

  const initialPatientDetail =
    selectedPatientId ? await getPatientById(selectedPatientId) : null;

  return (
    <TodayPageClient
      clinicId={clinicId}
      serverQueue={queue}
      initialPatientId={selectedPatientId}
      initialPatientDetail={initialPatientDetail}
      doctors={doctors}
      effectiveDoctorFilter={effectiveDoctorFilter}
      userDoctorId={userDoctorId}
    />
  );
}
