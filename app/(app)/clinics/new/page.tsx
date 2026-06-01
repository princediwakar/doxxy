// Path: app/(app)/clinics/new/page.tsx
"use client";

import { CreateClinicForm } from '@/components/clinic-setup/create-clinic-form';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { useRouter } from 'next/navigation';

export default function AppCreateClinicPage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <ErrorBoundary>
        <CreateClinicForm
          onSuccess={() => router.push('/schedule')}
          onCancel={() => router.push('/schedule')}
        />
      </ErrorBoundary>
    </div>
  );
}
