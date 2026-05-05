import { getPatientDetail } from '@/lib/data/patients';
import { getAuthenticatedUser, getActiveClinic } from '@/lib/auth-server';
import { PatientChartPage } from './PatientChartPage';

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthenticatedUser();
  const clinicMember = await getActiveClinic(user.id);

  const { id } = await params;
  const detail = await getPatientDetail(id).catch(() => null);

  return (
    <PatientChartPage
      patientDetail={detail ? { patient: detail.patient, consultations: detail.consultations, bills: detail.bills } : null}
      userId={user.id}
    />
  );
}
