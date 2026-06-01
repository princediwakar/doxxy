// Path: app/(onboarding)/create-clinic/page.tsx
"use client";

import { CreateClinicForm } from '@/components/clinic-setup/create-clinic-form';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { useRouter } from 'next/navigation';

export default function OnboardingCreateClinicPage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <ErrorBoundary>
        <CreateClinicForm onSuccess={() => router.replace('/schedule')} />
      </ErrorBoundary>
    </div>
  );
}
