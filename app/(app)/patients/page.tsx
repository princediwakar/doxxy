// Path: app/(app)/patients/page.tsx
import { getAuthenticatedUser, getActiveClinic } from '@/lib/auth-server';
import { queryPatientDetail, queryPatientSearch } from '@/lib/queries/patients';
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

  const initialData = clinicId
    ? await queryPatientSearch(clinicId, "", { page: 1 })
    : { patients: [], totalCount: 0 };

  let initialPatientDetail = null;
  if (clinicId && selectedPatientId) {
    try {
      initialPatientDetail = await queryPatientDetail(clinicId, selectedPatientId);
    } catch { /* patient may not exist */ }
  }

  return (
    <PatientsPageClient
      initialPatients={initialData.patients}
      totalPatientCount={initialData.totalCount}
      initialPatientId={selectedPatientId}
      initialPatientDetail={initialPatientDetail}
    />
  );
}
