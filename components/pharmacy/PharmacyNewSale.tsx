// Path: components/pharmacy/PharmacyNewSale.tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Dynamic import follows TodayModals.tsx pattern — BillingModal is heavy
const BillingModal = dynamic(
  () => import('@/components/billing/BillingModal').then((m) => m.BillingModal),
  { ssr: false }
);

export function PharmacyNewSale() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button id="pharmacy-new-sale-btn" onClick={() => setOpen(true)} className="gap-2 bg-primary shrink-0">
        <ShoppingCart className="w-4 h-4" />
        New Sale
      </Button>

      {open && (
        <BillingModal
          open={open}
          onOpenChange={setOpen}
          appointment={null}
          mode="create"
        />
      )}
    </>
  );
}
