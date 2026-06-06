// Path: app/(app)/patients/page.tsx
import { getAuthenticatedUser, getActiveClinic } from '@/lib/auth-server';
import { getPatientsByClinic, queryPatientDetail } from '@/lib/queries/patients';
import { PatientsPageClient } from './PatientsPageClient';

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>;
}) {
  const user = await getAuthenticatedUser();
  const member = await getActiveClinic(user.id);
  const clinicId = member?.clinic_id;

  const params = await searchParams;
  const selectedPatientId = params.patient || null;

  const initialPatients = clinicId ? await getPatientsByClinic(clinicId) : [];

  let initialPatientDetail = null;
  if (clinicId && selectedPatientId) {
    try {
      initialPatientDetail = await queryPatientDetail(clinicId, selectedPatientId);
    } catch { /* patient may not exist */ }
  }

  return (
    <PatientsPageClient
      serverPatients={initialPatients}
      initialPatientId={selectedPatientId}
      initialPatientDetail={initialPatientDetail}
    />
  );
}
