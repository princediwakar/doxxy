import { Spinner } from "@/components/ui/loading";
import { Suspense } from "react";
import ClinicDetailsManagement from "@/components/superadmin/ClinicDetailsManagement";

export default function AboutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-4"><Spinner size="md" /></div>}>
      <ClinicDetailsManagement />
    </Suspense>
  );
}
