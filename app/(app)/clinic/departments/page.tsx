"use client";

import { Spinner } from "@/components/ui/loading";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const ClinicDepartmentsManagement = dynamic(
  () => import("@/components/superadmin/ClinicDepartmentsManagement")
);

export default function DepartmentsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-4"><Spinner size="md" /></div>}>
      <ClinicDepartmentsManagement />
    </Suspense>
  );
}
