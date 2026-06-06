"use client";

import { Suspense, useEffect, useRef, useCallback, useState } from "react";
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
import type { AppointmentWithDetails } from "@/types/appointments";
import type { AppointmentData } from "@/types/patients";

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
  selectedAppointment: AppointmentWithDetails | null;
  selectedBill: BillWithDetails | null;
  billPatient: DbPatientByClinic | null;
  historyAppointment: AppointmentData | null;
  appointmentModalPatient: Patient | null;
  appointmentModalOpen: boolean;
  suggestedAppointmentDate: string | null;
  dirtyFormGuard: boolean;
  shakeTrigger: number;
  onCloseModal: () => void;
  onSetDirtyFormGuard: (dirty: boolean) => void;
  onPatientCreated: (patient: Patient) => void;
  onSetAppointmentModalOpen: (open: boolean) => void;
}

export function TodayModals({
  editPatient,
  onRefetch,
  selectedAppointment,
  selectedBill,
  billPatient,
  historyAppointment,
  appointmentModalPatient,
  appointmentModalOpen,
  suggestedAppointmentDate,
  dirtyFormGuard,
  shakeTrigger,
  onCloseModal,
  onSetDirtyFormGuard,
  onPatientCreated,
  onSetAppointmentModalOpen,
}: TodayModalsProps) {
  const activeModal = useTodayStore((s) => s.activeModal);

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
    (dirty: boolean) => onSetDirtyFormGuard(dirty),
    [onSetDirtyFormGuard],
  );

  const handleBillClose = useCallback(
    (open: boolean) => {
      if (!open) {
        if (dirtyFormGuard) {
          toast.error("Complete or discard the current bill before closing.");
          return;
        }
        onCloseModal();
        onRefetch();
      }
    },
    [dirtyFormGuard, onCloseModal, onRefetch],
  );

  const handleBillViewClose = useCallback(
    (open: boolean) => {
      if (!open) {
        onCloseModal();
        setBillViewMode("view");
      }
    },
    [onCloseModal],
  );

  const handleConsultClose = useCallback(() => {
    onCloseModal();
  }, [onCloseModal]);

  const handleAppointmentModalClose = useCallback(
    (open: boolean) => {
      if (!open) {
        onSetAppointmentModalOpen(false);
        onRefetch();
      }
    },
    [onSetAppointmentModalOpen, onRefetch],
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
            patient={billPatient as unknown as DbPatient | null}
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
        suggestedDate={suggestedAppointmentDate}
      />

      <Suspense fallback={null}>
        {activeModal === "patient-new" && (
          <PatientModal
            open={true}
            onOpenChange={(open) => {
              if (!open) onCloseModal();
            }}
            patient={null}
            onPatientCreated={(newPatient) => {
              queryClient.invalidateQueries({
                queryKey: queryKeys.patients.byClinic(activeClinicId ?? ""),
              });
              onPatientCreated(newPatient);
            }}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {activeModal === "patient-edit" && (
          <PatientModal
            open={true}
            onOpenChange={(open) => {
              if (!open) onCloseModal();
            }}
            patient={editPatient ?? null}
            onPatientCreated={onPatientCreated as (patient: Patient) => void}
          />
        )}
      </Suspense>
    </>
  );
}
