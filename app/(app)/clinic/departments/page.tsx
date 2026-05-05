import { Spinner } from "@/components/ui/loading";
import { Suspense } from "react";
import { getAuthenticatedUser, getActiveClinic } from '@/lib/auth-server';
import { getClinicDepartments, getDepartmentTypes } from '@/lib/data/clinic';
import ClinicDepartmentsManagement from "@/components/superadmin/ClinicDepartmentsManagement";

export default async function DepartmentsPage() {
  const user = await getAuthenticatedUser();
  const member = await getActiveClinic(user.id);
  const clinicId = member?.clinic_id ?? null;

  const [departmentTypes, clinicDepartments] = clinicId
    ? await Promise.all([getDepartmentTypes(), getClinicDepartments(clinicId)])
    : [[], []];

  return (
    <Suspense fallback={<div className="flex items-center justify-center p-4"><Spinner size="md" /></div>}>
      <ClinicDepartmentsManagement
        serverDepartmentTypes={departmentTypes}
        serverClinicDepartments={clinicDepartments}
      />
    </Suspense>
  );
}
