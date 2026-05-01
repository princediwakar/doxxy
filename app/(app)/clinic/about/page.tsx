"use client";

import { Spinner } from "@/components/ui/loading";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const ClinicDetailsManagement = dynamic(
  () => import("@/components/superadmin/ClinicDetailsManagement")
);

export default function AboutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-4"><Spinner size="md" /></div>}>
      <ClinicDetailsManagement />
    </Suspense>
  );
}
