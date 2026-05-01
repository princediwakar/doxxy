"use client";

import { Spinner } from "@/components/ui/loading";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const PaymentsDashboard = dynamic(
  () => import("@/components/payments/PaymentsDashboard").then((mod) => mod.PaymentsDashboard)
);

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-4"><Spinner size="md" /></div>}>
      <PaymentsDashboard />
    </Suspense>
  );
}
