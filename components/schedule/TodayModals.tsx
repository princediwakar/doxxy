"use client";

import { useEffect, useRef, Suspense, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useTodayStore } from "@/stores/todayStore";
import { useAppState } from "@/contexts/AppStateContext";
import { queryKeys } from "@/lib/query-keys";
import type { DbPatientByClinic } from "@/types/core";
import type { AppointmentForBilling, BillWithDetails } from "@/types/billing";
import type { DbPatient } from "@/types/core";
import type { Patient } from "@/types/patients";

const ConsultationViewModal = dynamic(() =>
  import("@/components/consultation/ConsultationViewModal").then(
    (m) => m.ConsultationViewModal,
  ),
);
const BillingModal = dynamic(() =>
  import("@/components/billing/BillingModal").then((m) => m.BillingModal),
);
const AppointmentModal = dynamic(() =>
  import("@/components/appointments/AppointmentModal").then(
    (m) => m.AppointmentModal,
  ),
);
const PatientModal = dynamic(() =>
  import("@/components/patients/PatientModal").then((m) => m.PatientModal),
);

interface TodayModalsProps {
  editPatient: DbPatientByClinic | null;
  onRefetch: () => void;
}

export function TodayModals({ editPatient, onRefetch }: TodayModalsProps) {
  const activeModal = useTodayStore((s) => s.activeModal);
  const closeModal = useTodayStore((s) => s.closeModal);
  const selectedAppointment = useTodayStore((s) => s.selectedAppointment);
  const selectedBill = useTodayStore((s) => s.selectedBill);
  const billPatient = useTodayStore((s) => s.billPatient);
  const historyAppointment = useTodayStore((s) => s.historyAppointment);
  const appointmentModalPatient = useTodayStore((s) => s.appointmentModalPatient);
  const appointmentModalOpen = useTodayStore((s) => s.appointmentModalOpen);
  const shakeTrigger = useTodayStore((s) => s.shakeTrigger);
  const dirtyFormGuard = useTodayStore((s) => s.dirtyFormGuard);
  const setDirtyFormGuard = useTodayStore((s) => s.setDirtyFormGuard);
  const patientCreated = useTodayStore((s) => s.patientCreated);

  const queryClient = useQueryClient();
  const { activeClinicId } = useAppState();
  const billModalRef = useRef<HTMLDivElement>(null);
  const [billViewMode, setBillViewMode] = useState<"view" | "edit">("view");

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
    [setDirtyFormGuard],
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
      }
    },
    [dirtyFormGuard, closeModal, onRefetch],
  );

  const handleBillViewClose = useCallback(
    (open: boolean) => {
      if (!open) {
        closeModal();
        setBillViewMode("view");
      }
    },
    [closeModal],
  );

  const handleConsultClose = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleAppointmentModalClose = useCallback(
    (open: boolean) => {
      if (!open) {
        useTodayStore.setState({ appointmentModalOpen: false });
        onRefetch();
      }
    },
    [onRefetch],
  );

  return (
    <>
      <Suspense fallback={null}>
        {activeModal === "consult" && historyAppointment && (
          <ConsultationViewModal
            open={true}
            onOpenChange={(open) => {
              if (!open) handleConsultClose();
            }}
            appointment={historyAppointment}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {activeModal === "consult" && !historyAppointment && selectedAppointment && (
          <ConsultationViewModal
            open={true}
            onOpenChange={(open) => {
              if (!open) handleConsultClose();
            }}
            appointment={selectedAppointment}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {activeModal === "bill" && selectedBill && (
          <BillingModal
            open={true}
            onOpenChange={handleBillViewClose}
            bill={selectedBill}
            mode={billViewMode}
            onModeChange={(newMode) => {
              if (newMode === "view") onRefetch();
              setBillViewMode(newMode as "view" | "edit");
            }}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {activeModal === "bill" && !selectedBill && (selectedAppointment || billPatient) && (
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
        open={appointmentModalOpen}
        onOpenChange={handleAppointmentModalClose}
        appointment={selectedAppointment}
        patient={appointmentModalPatient}
      />

      <Suspense fallback={null}>
        {activeModal === "patient-new" && (
          <PatientModal
            open={true}
            onOpenChange={(open) => {
              if (!open) closeModal();
            }}
            patient={null}
            onPatientCreated={(newPatient) => {
              queryClient.invalidateQueries({
                queryKey: queryKeys.patients.byClinic(activeClinicId ?? ""),
              });
              patientCreated(newPatient);
            }}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {activeModal === "patient-edit" && (
          <PatientModal
            open={true}
            onOpenChange={(open) => {
              if (!open) closeModal();
            }}
            patient={editPatient ?? null}
            onPatientCreated={patientCreated as (patient: Patient) => void}
          />
        )}
      </Suspense>
    </>
  );
}
