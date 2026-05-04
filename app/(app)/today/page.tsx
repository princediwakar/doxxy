import { Suspense } from 'react';
import { getTodayAppointments, getPatientById } from '@/lib/data/today';
import { getAuthenticatedUser, getActiveClinic } from '@/lib/auth-server';
import { TodayPageClient } from './TodayPageClient';
import type { AppointmentWithDetails } from '@/types/appointments';

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getAuthenticatedUser();
  const clinicMember = await getActiveClinic(user.id);
  const clinicId = clinicMember?.clinic_id ?? null;

  const params = await searchParams;
  const selectedPatientId =
    typeof params.patient === 'string' ? params.patient : null;

  const queue: {
    inProgress: AppointmentWithDetails[];
    scheduled: AppointmentWithDetails[];
    completed: AppointmentWithDetails[];
  } = clinicId
    ? await getTodayAppointments(clinicId)
    : { inProgress: [], scheduled: [], completed: [] };

  const serverPatientData =
    clinicId && selectedPatientId
      ? await getPatientById(selectedPatientId)
      : null;

  return (
    <Suspense>
      <TodayPageClient
        serverQueue={queue}
        serverPatientData={serverPatientData}
        clinicId={clinicId}
      />
    </Suspense>
  );
}
