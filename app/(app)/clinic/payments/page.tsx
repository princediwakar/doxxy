import { Spinner } from "@/components/ui/loading";
import { Suspense } from "react";
import { getAuthenticatedUser, getActiveClinic } from '@/lib/auth-server';
import { getBillingSummary, getPaymentTransactions } from '@/lib/data/payments';
import { PaymentsDashboard } from "@/components/payments/PaymentsDashboard";

export default async function PaymentsPage() {
  const user = await getAuthenticatedUser();
  const member = await getActiveClinic(user.id);
  const clinicId = member?.clinic_id ?? null;

  const [billingSummary, paymentTransactions] = clinicId
    ? await Promise.all([getBillingSummary(clinicId), getPaymentTransactions(clinicId)])
    : [null, []];

  return (
    <Suspense fallback={<div className="flex items-center justify-center p-4"><Spinner size="md" /></div>}>
      <PaymentsDashboard
        serverBillingSummary={billingSummary}
        serverTransactions={paymentTransactions}
      />
    </Suspense>
  );
}
