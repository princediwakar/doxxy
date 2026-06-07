// app/(app)/clinic/staff/page.tsx
import { Spinner } from "@/components/ui/loading";
import { Suspense } from "react";
import { getAuthenticatedUser, getActiveClinic } from '@/lib/auth-server';
import { getClinicMembers, getClinicDepartments } from '@/lib/queries/clinic';
import ClinicMembersManagement from "@/components/superadmin/ClinicMembersManagement";
import type { MemberWithDetails, DepartmentWithDetails } from '@/types/core';

export default async function StaffPage() {
  const user = await getAuthenticatedUser();
  const member = await getActiveClinic(user.id);
  const clinicId = member?.clinic_id ?? null;

  const [members, departments] = clinicId
    ? await Promise.all([getClinicMembers(clinicId), getClinicDepartments(clinicId)])
    : [[], []];

  return (
    <Suspense fallback={<div className="flex items-center justify-center p-4"><Spinner size="md" /></div>}>
      <ClinicMembersManagement
        serverMembers={members as MemberWithDetails[]}
        serverDepartments={departments as DepartmentWithDetails[]}
      />
    </Suspense>
  );
}
