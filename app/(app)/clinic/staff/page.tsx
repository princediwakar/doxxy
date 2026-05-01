"use client";

import { Spinner } from "@/components/ui/loading";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const ClinicMembersManagement = dynamic(
  () => import("@/components/superadmin/ClinicMembersManagement")
);

export default function StaffPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-4"><Spinner size="md" /></div>}>
      <ClinicMembersManagement />
    </Suspense>
  );
}
