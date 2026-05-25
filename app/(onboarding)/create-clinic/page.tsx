// Path: app/(onboarding)/create-clinic/page.tsx
import { CreateClinicForm } from './create-clinic-form';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';

const CreateClinicPageWithErrorBoundary = () => (
  <ErrorBoundary>
    <CreateClinicForm />
  </ErrorBoundary>
);

export default CreateClinicPageWithErrorBoundary;