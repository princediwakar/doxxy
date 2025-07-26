import { lazy, Suspense } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Clock } from 'lucide-react';

// Lazy load heavy modal components
const PatientModal = lazy(() => 
  import('@/components/patients/PatientModal').then(module => ({
    default: module.PatientModal
  }))
);

const AppointmentModal = lazy(() => 
  import('@/components/appointments/AppointmentModal').then(module => ({
    default: module.AppointmentModal
  }))
);

const ConsultationViewModal = lazy(() => 
  import('@/components/consultation/ConsultationViewModal')
);

const ConsultationPreviewModal = lazy(() => 
  import('@/components/consultation/ConsultationPreviewModal')
);

const BillingModal = lazy(() => 
  import('@/components/billing/BillingModal').then(module => ({
    default: module.BillingModal
  }))
);

const PrescriptionViewModal = lazy(() => 
  import('@/components/prescriptions/PrescriptionViewModal').then(module => ({
    default: module.PrescriptionViewModal
  }))
);

// Modal loading component
const ModalLoader = () => (
  <DialogContent className="sm:max-w-[425px]">
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-2">
        <Clock className="h-5 w-5 animate-spin" />
        <span>Loading...</span>
      </div>
    </div>
  </DialogContent>
);

// Lazy Modal Wrapper
interface LazyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const LazyModalWrapper = ({ open, onOpenChange, children }: LazyModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <Suspense fallback={<ModalLoader />}>
      {children}
    </Suspense>
  </Dialog>
);

// Exported Lazy Modal Components
export const LazyPatientModal = (props: any) => (
  <Suspense fallback={<ModalLoader />}>
    <PatientModal {...props} />
  </Suspense>
);

export const LazyAppointmentModal = (props: any) => (
  <Suspense fallback={<ModalLoader />}>
    <AppointmentModal {...props} />
  </Suspense>
);

export const LazyConsultationViewModal = (props: any) => (
  <Suspense fallback={<ModalLoader />}>
    <ConsultationViewModal {...props} />
  </Suspense>
);

export const LazyConsultationPreviewModal = (props: any) => (
  <Suspense fallback={<ModalLoader />}>
    <ConsultationPreviewModal {...props} />
  </Suspense>
);

export const LazyBillingModal = (props: any) => (
  <Suspense fallback={<ModalLoader />}>
    <BillingModal {...props} />
  </Suspense>
);

export const LazyPrescriptionViewModal = (props: any) => (
  <Suspense fallback={<ModalLoader />}>
    <PrescriptionViewModal {...props} />
  </Suspense>
);

// Hook for preloading modal components
export const usePreloadModals = () => {
  const preloadPatientModal = () => import('@/components/patients/PatientModal');
  const preloadAppointmentModal = () => import('@/components/appointments/AppointmentModal');
  const preloadConsultationModals = () => Promise.all([
    import('@/components/consultation/ConsultationViewModal'),
    import('@/components/consultation/ConsultationPreviewModal')
  ]);
  const preloadBillingModal = () => import('@/components/billing/BillingModal');
  const preloadPrescriptionModal = () => import('@/components/prescriptions/PrescriptionViewModal');

  return {
    preloadPatientModal,
    preloadAppointmentModal,
    preloadConsultationModals,
    preloadBillingModal,
    preloadPrescriptionModal,
    preloadAllModals: () => Promise.all([
      preloadPatientModal(),
      preloadAppointmentModal(),
      preloadConsultationModals(),
      preloadBillingModal(),
      preloadPrescriptionModal()
    ])
  };
};

export default LazyModalWrapper;