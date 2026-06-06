// app/(app)/schedule/TodayPageClient.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTodayStore } from "@/stores/todayStore";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { queryPatientDetail, queryPatientBills } from "@/lib/queries/patients";
import { TodayHeader } from "@/components/schedule/TodayHeader";
import { TodayQueueView } from "@/components/schedule/TodayQueueView";
import { TodayDetailView } from "@/components/schedule/TodayDetailView";
import { TodayMobileLayout } from "@/components/schedule/TodayMobileLayout";
import { TodayModals } from "@/components/schedule/TodayModals";
import { DoctorProfilePrompt } from "@/components/doctor/DoctorProfilePrompt";
import type { AppointmentWithDetails } from "@/types/appointments";
import type { PatientDetail, DbPatientByClinic } from "@/types/core";
import type { BillWithDetails } from "@/types/billing";
import type { AppointmentData, Patient } from "@/types/patients";

interface Doctor {
  id: string;
  name: string;
  user_id: string;
  primary_specialization: string | null;
}

interface TodayPageClientProps {
  clinicId: string | null;
  serverQueue: {
    inProgress: AppointmentWithDetails[];
    scheduled: AppointmentWithDetails[];
    completed: AppointmentWithDetails[];
  };
  initialPatientId: string | null;
  initialPatientDetail: PatientDetail | null;
  doctors: Doctor[];
  effectiveDoctorFilter: string | null;
  userDoctorId: string | null;
  hasDoctors: boolean;
}

export function TodayPageClient({
  clinicId,
  serverQueue,
  initialPatientId,
  initialPatientDetail,
  doctors,
  effectiveDoctorFilter,
  userDoctorId,
  hasDoctors,
}: TodayPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── URL state ──
  const selectedPatientId = searchParams.get("patient") || null;
  const selectedAppointmentId = searchParams.get("appointment") || null;

  // ── Store (modal visibility only) ──
  const openModal = useTodayStore((s) => s.openModal);
  const closeModal = useTodayStore((s) => s.closeModal);
  const appointmentModalOpen = useTodayStore((s) => s.appointmentModalOpen);
  const setAppointmentModalOpen = useTodayStore((s) => s.setAppointmentModalOpen);

  // ── Local modal context ──
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [selectedBill, setSelectedBill] = useState<BillWithDetails | null>(null);
  const [billPatient, setBillPatient] = useState<DbPatientByClinic | null>(null);
  const [historyAppointment, setHistoryAppointment] = useState<AppointmentData | null>(null);
  const [appointmentModalPatient, setAppointmentModalPatient] = useState<Patient | null>(null);
  const [suggestedAppointmentDate, setSuggestedAppointmentDate] = useState<string | null>(null);
  const [dirtyFormGuard, setDirtyFormGuard] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  // ── Modal callbacks ──
  const handleCloseModal = useCallback(() => {
    setSelectedBill(null);
    setHistoryAppointment(null);
    setDirtyFormGuard(false);
    closeModal();
  }, [closeModal]);

  const handleCreateBill = useCallback((app: AppointmentWithDetails) => {
    setSelectedAppointment(app);
    setBillPatient(null);
    setSelectedBill(null);
    openModal("bill");
  }, [openModal]);

  const handleCreateBillForPatient = useCallback((patient: DbPatientByClinic) => {
    setBillPatient(patient);
    setSelectedAppointment(null);
    setSelectedBill(null);
    openModal("bill");
  }, [openModal]);

  const handleViewBill = useCallback((bill: BillWithDetails, patient?: DbPatientByClinic | null) => {
    setSelectedBill(bill);
    setBillPatient(patient ?? null);
    openModal("bill");
  }, [openModal]);

  const handleViewConsultation = useCallback((
    appointmentId: string,
    patientId: string,
    doctorId: string,
    date = "",
    time = "",
    doctorName?: string,
  ) => {
    setSelectedAppointment(null);
    setSelectedBill(null);
    setHistoryAppointment({
      id: appointmentId,
      patient_id: patientId,
      doctor_id: doctorId,
      doctor_name: doctorName,
      date,
      time,
      type: "Walk-in",
      status: "Completed",
      created_at: "",
    });
    openModal("consult");
  }, [openModal]);

  const handleScheduleAppointment = useCallback((patient: DbPatientByClinic, suggestedDate?: string | null) => {
    setAppointmentModalPatient(patient as unknown as Patient);
    setSelectedAppointment(null);
    setSuggestedAppointmentDate(suggestedDate ?? null);
    setAppointmentModalOpen(true);
  }, [setAppointmentModalOpen]);

  const handleEditAppointment = useCallback((app: AppointmentWithDetails) => {
    setSelectedAppointment(app);
    setAppointmentModalOpen(true);
  }, [setAppointmentModalOpen]);

  const handleEditPatient = useCallback(() => {
    openModal("patient-edit");
  }, [openModal]);

  const handlePatientCreated = useCallback((patient: Patient) => {
    closeModal();
    setAppointmentModalPatient(patient);
    setSelectedAppointment(null);
    setSuggestedAppointmentDate(null);
    setAppointmentModalOpen(true);
  }, [closeModal, setAppointmentModalOpen]);

  const handleSelectAppointment = useCallback((app: AppointmentWithDetails | null) => {
    setSelectedAppointment(app);
  }, []);

  const triggerShake = useCallback(() => {
    setShakeTrigger((s) => s + 1);
  }, []);

  // ── FAB action handler ──
  const fabHandled = useRef(false);
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "new-patient" && !fabHandled.current) {
      fabHandled.current = true;
      openModal("patient-new");
      const next = new URLSearchParams(searchParams.toString());
      next.delete("action");
      const qs = next.toString();
      router.replace(window.location.pathname + (qs ? `?${qs}` : ""));
    } else if (action !== "new-patient") {
      fabHandled.current = false;
    }
  }, [searchParams, router, openModal]);

  // ── Patient detail ──
  const isInitialPatient =
    !!(initialPatientId && selectedPatientId === initialPatientId);
  const { data: remoteDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["patient", selectedPatientId, "detail"],
    queryFn: () => queryPatientDetail(clinicId!, selectedPatientId!),
    enabled: !!clinicId && !!selectedPatientId && !isInitialPatient,
    staleTime: 5 * 60 * 1000,
  });
  const patientDetail: PatientDetail | undefined = isInitialPatient
    ? initialPatientDetail ?? undefined
    : remoteDetail;

  // ── Patient bills ──
  const { data: patientBills = [], isLoading: isLoadingBills } = useQuery({
    queryKey: ["patient", selectedPatientId, "bills"],
    queryFn: () => queryPatientBills(selectedPatientId!),
    enabled: !!selectedPatientId,
    staleTime: 5 * 60 * 1000,
  });

  // ── Realtime subscriptions ──
  const scheduleQueryKeys = useMemo(
    () => [["patient"], ["consultation-context"], ["appointments"]] as unknown[][],
    [],
  );
  const handleRealtimeChange = () => router.refresh();

  useRealtimeSubscription({ table: "appointments", clinicId: clinicId ?? "", queryKeys: scheduleQueryKeys, onChange: handleRealtimeChange });
  useRealtimeSubscription({ table: "consultations", clinicId: clinicId ?? "", queryKeys: scheduleQueryKeys, onChange: handleRealtimeChange });
  useRealtimeSubscription({ table: "bills", clinicId: clinicId ?? "", queryKeys: scheduleQueryKeys, onChange: handleRealtimeChange });

  // ── Derived data ──
  const allApps = [
    ...serverQueue.inProgress,
    ...serverQueue.scheduled,
    ...serverQueue.completed,
  ];

  const appointmentsByPatient = (() => {
    const map = new Map<string, AppointmentWithDetails[]>();
    for (const app of allApps) {
      const list = map.get(app.patient_id) || [];
      list.push(app);
      map.set(app.patient_id, list);
    }
    return map;
  })();

  const patientAppointments = selectedPatientId
    ? appointmentsByPatient.get(selectedPatientId) ?? []
    : [];

  // ── View-consult action handler ──
  const consultHandled = useRef(false);
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "view-consult" && !consultHandled.current && selectedAppointmentId && selectedPatientId) {
      consultHandled.current = true;
      const doctorId = searchParams.get("doctor_id") || "";
      const doctorName = searchParams.get("doctor_name") || undefined;
      const date = searchParams.get("date") || "";
      const time = searchParams.get("time") || "";
      setSelectedAppointment(null);
      setSelectedBill(null);
      setHistoryAppointment({
        id: selectedAppointmentId,
        patient_id: selectedPatientId,
        doctor_id: doctorId,
        doctor_name: doctorName,
        date,
        time,
        type: "Walk-in",
        status: "Completed",
        created_at: "",
      });
      openModal("consult");
      const next = new URLSearchParams(searchParams.toString());
      next.delete("action");
      next.delete("doctor_id");
      next.delete("doctor_name");
      next.delete("date");
      next.delete("time");
      const qs = next.toString();
      router.replace(window.location.pathname + (qs ? `?${qs}` : ""));
    } else if (action !== "view-consult") {
      consultHandled.current = false;
    }
  }, [searchParams, router, selectedAppointmentId, selectedPatientId, openModal]);

  const handleRefetch = () => {
    if (selectedPatientId) {
      queryClient.invalidateQueries({
        queryKey: ["patient", selectedPatientId, "detail"],
      });
    }
    router.refresh();
  };

  // ── Mobile ──
  const isMobile = useIsMobile();
  const showMobileDetail = isMobile && mobileDetailOpen;

  return (
    <div className="flex flex-col lg:h-[calc(100vh-3rem)] flex-1 min-h-0">
      {!showMobileDetail && <DoctorProfilePrompt />}
      <TodayMobileLayout
        showMobileDetail={showMobileDetail}
        onBackToQueue={() => setMobileDetailOpen(false)}
        header={<TodayHeader doctors={doctors} effectiveDoctorFilter={effectiveDoctorFilter} userDoctorId={userDoctorId} />}
        queue={
          <TodayQueueView
            queue={serverQueue}
            onAppointmentClick={handleSelectAppointment}
            doctorFilter={effectiveDoctorFilter}
            hasDoctors={hasDoctors}
            dirtyFormGuard={dirtyFormGuard}
            onShake={triggerShake}
            onSetMobileDetailOpen={setMobileDetailOpen}
          />
        }
        detail={
          <TodayDetailView
            patientAppointments={patientAppointments}
            patientDetail={patientDetail}
            isLoadingDetail={
              !!selectedPatientId && !isInitialPatient && isLoadingDetail
            }
            selectedPatientId={selectedPatientId}
            selectedAppointmentId={selectedAppointmentId}
            patientBills={patientBills as BillWithDetails[]}
            isLoadingBills={isLoadingBills}
            onRefreshNeeded={handleRefetch}
            hasDoctors={hasDoctors}
            clinicId={clinicId}
            onCreateBill={handleCreateBill}
            onCreateBillForPatient={handleCreateBillForPatient}
            onViewBill={handleViewBill}
            onViewConsultationFromHistory={handleViewConsultation}
            onScheduleAppointment={handleScheduleAppointment}
            onEditAppointment={handleEditAppointment}
            onEditPatient={handleEditPatient}
          />
        }
      />
      <TodayModals
        editPatient={patientDetail?.patient ?? null}
        onRefetch={handleRefetch}
        selectedAppointment={selectedAppointment}
        selectedBill={selectedBill}
        billPatient={billPatient}
        historyAppointment={historyAppointment}
        appointmentModalPatient={appointmentModalPatient}
        appointmentModalOpen={appointmentModalOpen}
        suggestedAppointmentDate={suggestedAppointmentDate}
        dirtyFormGuard={dirtyFormGuard}
        shakeTrigger={shakeTrigger}
        onCloseModal={handleCloseModal}
        onSetDirtyFormGuard={setDirtyFormGuard}
        onPatientCreated={handlePatientCreated}
        onSetAppointmentModalOpen={setAppointmentModalOpen}
      />
    </div>
  );
}
