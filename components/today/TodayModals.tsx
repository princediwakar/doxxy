"use client";

import { useEffect, useRef, Suspense, useCallback } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useTodayStore } from "@/stores/todayStore";
import type { AppointmentWithDetails } from "@/types/appointments";
import type { AppointmentForBilling } from "@/types/billing";
import type { DbPatient, DbPatientByClinic } from "@/types/core";
import type { Patient } from "@/types/patients";

const ConsultationViewModal = dynamic(() =>
  import("@/components/consultation/ConsultationViewModal").then((m) => m.ConsultationViewModal)
);
const BillingModal = dynamic(() =>
  import("@/components/billing/BillingModal").then((m) => m.BillingModal)
);
const AppointmentModal = dynamic(() =>
  import("@/components/appointments/AppointmentModal").then((m) => m.AppointmentModal)
);
const PatientModal = dynamic(() =>
  import("@/components/patients/PatientModal").then((m) => m.PatientModal)
);

interface TodayModalsProps {
  selectedAppointment: AppointmentWithDetails | null;
  setSelectedAppointment: (app: AppointmentWithDetails | null) => void;
  isAppointmentModalOpen: boolean;
  setAppointmentModalOpen: (open: boolean) => void;
  appointmentModalPatient: Patient | null;
  billPatient?: DbPatientByClinic | null;
  onRefetch: () => void;
  onPatientCreated: (patient: Patient) => void;
}

export function TodayModals({
  selectedAppointment,
  setSelectedAppointment,
  isAppointmentModalOpen,
  setAppointmentModalOpen,
  appointmentModalPatient,
  billPatient,
  onRefetch,
  onPatientCreated,
}: TodayModalsProps) {
  const activeModal = useTodayStore((s) => s.activeModal);
  const closeModal = useTodayStore((s) => s.closeModal);
  const shakeTrigger = useTodayStore((s) => s.shakeTrigger);
  const dirtyFormGuard = useTodayStore((s) => s.dirtyFormGuard);
  const setDirtyFormGuard = useTodayStore((s) => s.setDirtyFormGuard);

  const billModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shakeTrigger > 0 && billModalRef.current) {
      billModalRef.current.classList.add("animate-shake");
      const timer = setTimeout(() => {
        billModalRef.current?.classList.remove("animate-shake");
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [shakeTrigger]);

  const handleDirtyChange = useCallback(
    (dirty: boolean) => setDirtyFormGuard(dirty),
    [setDirtyFormGuard]
  );

  const handleBillClose = useCallback(
    (open: boolean) => {
      if (!open) {
        if (dirtyFormGuard) {
          toast.error("Complete or discard the current bill before closing.");
          return;
        }
        closeModal();
        onRefetch();
        setSelectedAppointment(null);
      }
    },
    [dirtyFormGuard, closeModal, onRefetch, setSelectedAppointment]
  );

  return (
    <>
      <Suspense fallback={null}>
        {activeModal === "consult" && selectedAppointment && (
          <ConsultationViewModal
            open={true}
            onOpenChange={(open) => {
              if (!open) {
                closeModal();
                setSelectedAppointment(null);
              }
            }}
            appointment={selectedAppointment}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {activeModal === "bill" && (selectedAppointment || billPatient) && (
          <div ref={billModalRef}>
            <BillingModal
              open={true}
              onOpenChange={handleBillClose}
              appointment={selectedAppointment as unknown as AppointmentForBilling | null}
              patient={billPatient as unknown as DbPatient | null}
              onDirtyChange={handleDirtyChange}
            />
          </div>
        )}
      </Suspense>

      <AppointmentModal
        open={isAppointmentModalOpen}
        onOpenChange={(open) => {
          setAppointmentModalOpen(open);
          if (!open) onRefetch();
        }}
        appointment={selectedAppointment}
        patient={appointmentModalPatient}
      />

      <Suspense fallback={null}>
        {activeModal === "patient-edit" && (
          <PatientModal
            open={true}
            onOpenChange={(open) => {
              if (!open) closeModal();
            }}
            patient={null}
            onPatientCreated={onPatientCreated}
          />
        )}
      </Suspense>
    </>
  );
}
