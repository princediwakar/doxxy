// app/(app)today/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { showErrorToast } from "@/lib/error-utils";
import { useTodayStore } from "@/stores/todayStore";
import { useTodayAppointments } from "@/hooks/useTodayAppointments";
import { usePatientSearch } from "@/hooks/usePatientSearch";
import { usePatientDetail } from "@/hooks/usePatientDetail";
import { usePrefetching } from "@/hooks/usePrefetching";
import { useFABAction } from "@/hooks/useFABAction";
import { useAppointmentById } from "@/hooks/useAppointmentById";
import { ArrowLeft } from "lucide-react";
import { TodayHeader } from "@/components/today/TodayHeader";
import { TodayPatientList } from "@/components/today/TodayPatientList";
import { TodayDetailPanel } from "@/components/today/TodayDetailPanel";
import { TodayModals } from "@/components/today/TodayModals";
import { DoctorProfilePrompt } from "@/components/doctor/DoctorProfilePrompt";
import type { AppointmentWithDetails } from "@/types/appointments";
import type { BillWithDetails } from "@/types/billing";
import type { DbPatientByClinic } from "@/types/core";
import type { Patient, AppointmentData } from "@/types/patients";

function TodayPageInner() {
  const searchParams = useSearchParams();

  const activeFilter = useTodayStore((s) => s.activeFilter);
  const searchQuery = useTodayStore((s) => s.searchQuery);
  const selectedPatientId = useTodayStore((s) => s.selectedPatientId);
  const selectedAppointmentId = useTodayStore((s) => s.selectedAppointmentId);
  const mobileDetailOpen = useTodayStore((s) => s.mobileDetailOpen);
  const openModal = useTodayStore((s) => s.openModal);
  const closeModal = useTodayStore((s) => s.closeModal);
  const selectPatient = useTodayStore((s) => s.selectPatient);
  const setMobileDetailOpen = useTodayStore((s) => s.setMobileDetailOpen);
  const genderFilter = searchParams.get("gender");
  const ageGroupFilter = searchParams.get("age_group");

  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const { queue, isLoading: isLoadingQueue, refetch } = useTodayAppointments();
  const { patients: searchPatients, isLoading: isLoadingSearch } = usePatientSearch(
    activeFilter === "all" ? searchQuery : undefined,
    genderFilter,
    ageGroupFilter,
  );
  const { data: patientDetail, isLoading: isLoadingDetail } = usePatientDetail(selectedPatientId);

  const { prefetchPatients, prefetchDoctors } = usePrefetching();

  const selectedAppointmentParam = searchParams.get("selectedAppointment");

  const allApps = useMemo(
    () => [...queue.inProgress, ...queue.scheduled, ...queue.completed],
    [queue],
  );

  const isInQueue = selectedAppointmentParam
    ? allApps.some((a) => a.id === selectedAppointmentParam)
    : false;

  const { data: deepLinkedAppointment } = useAppointmentById(
    selectedAppointmentParam && !isLoadingQueue && !isInQueue ? selectedAppointmentParam : null,
  );

  const urlResolvedSelection = useMemo(() => {
    if (!selectedAppointmentParam || allApps.length === 0) return null;

    const match = allApps.find((a) => a.id === selectedAppointmentParam);
    if (match) return { patientId: match.patient_id, appointmentId: match.id };

    if (deepLinkedAppointment) {
      return { patientId: deepLinkedAppointment.patient_id, appointmentId: deepLinkedAppointment.id };
    }

    return null;
  }, [selectedAppointmentParam, allApps, deepLinkedAppointment]);

  const effectivePatientId = urlResolvedSelection?.patientId ?? selectedPatientId;
  const effectiveAppointmentId = urlResolvedSelection?.appointmentId ?? selectedAppointmentId;

  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [isAppointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [appointmentModalPatient, setAppointmentModalPatient] = useState<Patient | null>(null);
  const [billPatient, setBillPatient] = useState<DbPatientByClinic | null>(null);
  const [selectedBill, setSelectedBill] = useState<BillWithDetails | null>(null);
  const [historyAppointment, setHistoryAppointment] = useState<AppointmentData | null>(null);

  useFABAction("new-patient", () => openModal("patient-new"));

  useEffect(() => {
    if (!isLoadingQueue) {
      Promise.all([prefetchPatients(), prefetchDoctors()]).catch(showErrorToast);
    }
  }, [isLoadingQueue, prefetchPatients, prefetchDoctors]);

  const appointmentsByPatient = useMemo(() => {
    const map = new Map<string, AppointmentWithDetails[]>();
    for (const app of allApps) {
      const list = map.get(app.patient_id) || [];
      list.push(app);
      map.set(app.patient_id, list);
    }
    return map;
  }, [allApps]);

  const patientAppointments = selectedPatientId
    ? appointmentsByPatient.get(selectedPatientId) ?? []
    : [];

  const handleAppointmentClick = useCallback(
    (app: AppointmentWithDetails) => {
      setSelectedAppointment(app);
      selectPatient(app.patient_id, app.id);
    }, [selectPatient]);

  const handleCreateBill = useCallback(
    (app: AppointmentWithDetails) => { setSelectedAppointment(app); setBillPatient(null); setSelectedBill(null); openModal("bill"); },
    [openModal]);

  const handleCreateBillForPatient = useCallback(() => {
    if (patientDetail?.patient) setBillPatient(patientDetail.patient);
    setSelectedAppointment(null);
    setSelectedBill(null);
    openModal("bill");
  }, [patientDetail, openModal]);

  const handleEditAppointment = useCallback(
    (app: AppointmentWithDetails) => { setSelectedAppointment(app); setAppointmentModalOpen(true); }, []);

  const handleViewBill = useCallback(
    (bill: BillWithDetails) => { setSelectedBill(bill); openModal("bill"); },
    [openModal]);

  const handleViewConsultationFromHistory = useCallback(
    (appointmentId: string, patientId: string, doctorId: string) => {
      setSelectedAppointment(null);
      setHistoryAppointment({
        id: appointmentId,
        patient_id: patientId,
        doctor_id: doctorId,
        date: "",
        time: "",
        type: "Walk-in",
        status: "Completed",
        created_at: "",
      });
      openModal("consult");
    },
    [openModal]);

  const handleScheduleAppointment = useCallback(
    () => {
      if (patientDetail?.patient) {
        setAppointmentModalPatient(patientDetail.patient as Patient);
        setSelectedAppointment(null);
        setAppointmentModalOpen(true);
      }
    }, [patientDetail]);

  const handleEditPatient = useCallback(
    () => { openModal("patient-edit"); }, [openModal]);

  const handlePatientCreated = useCallback(
    (patient: Patient) => {
      closeModal();
      setAppointmentModalPatient(patient);
      setAppointmentModalOpen(true);
    }, [closeModal]);

  const showMobileDetail = isMobile && mobileDetailOpen;

  const detailProps = useMemo(
    () => ({
      patientAppointments, patientDetail, isLoadingDetail, isLoadingQueue,
      selectedPatientId: effectivePatientId,
      selectedAppointmentId: effectiveAppointmentId,
      onCreateBill: handleCreateBill,
      onCreateBillForPatient: handleCreateBillForPatient,
      onScheduleAppointment: handleScheduleAppointment,
      onEditAppointment: handleEditAppointment,
      onEditPatient: handleEditPatient,
      onViewBill: handleViewBill,
      onViewConsultationFromHistory: handleViewConsultationFromHistory,
      onRefreshNeeded: refetch,
      deepLinkedAppointment,
    }),
    [
      patientAppointments, patientDetail, isLoadingDetail, isLoadingQueue,
      effectivePatientId, effectiveAppointmentId,
      handleCreateBill, handleCreateBillForPatient, handleScheduleAppointment,
      handleEditAppointment, handleEditPatient, handleViewBill,
      handleViewConsultationFromHistory, refetch, deepLinkedAppointment,
    ],
  );

  const listProps = useMemo(
    () => ({
      queue, isLoadingQueue,
      searchPatients, isLoadingSearch,
      appointmentsByPatient,
      genderFilter,
      ageGroupFilter,
      selectedPatientId: effectivePatientId,
      selectedAppointmentId: effectiveAppointmentId,
      onAppointmentClick: handleAppointmentClick,
    }),
    [queue, isLoadingQueue, searchPatients, isLoadingSearch, appointmentsByPatient, genderFilter, ageGroupFilter, effectivePatientId, effectiveAppointmentId, handleAppointmentClick],
  );

  return (
    <div className="space-y-6">
      <DoctorProfilePrompt />
      {!(isMobile && showMobileDetail) && <TodayHeader />}

      {isMobile && showMobileDetail ? (
        <div className="flex flex-col" style={{ height: "calc(100vh - 7rem)" }}>
          <div className="flex items-center gap-2 px-1 py-2 border-b">
            <button
              onClick={() => setMobileDetailOpen(false)}
              className="flex items-center gap-1 text-sm font-medium hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Queue
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <TodayDetailPanel {...detailProps} />
          </div>
        </div>
      ) : isMobile ? (
        <div className="border rounded-lg bg-muted/5 p-4 overflow-y-auto" style={{ height: "calc(100vh - 11rem)" }}>
          <TodayPatientList {...listProps} />
        </div>
      ) : (
        <div className="flex gap-6" style={{ height: "calc(100vh - 13rem)" }}>
          <div className="w-1/3 border rounded-lg bg-muted/5 p-4 overflow-y-auto">
            <TodayPatientList {...listProps} />
          </div>
          <div className="w-2/3 border rounded-lg bg-muted/5 p-4 overflow-y-auto">
            <TodayDetailPanel {...detailProps} />
          </div>
        </div>
      )}

      <TodayModals
        selectedAppointment={selectedAppointment}
        setSelectedAppointment={setSelectedAppointment}
        isAppointmentModalOpen={isAppointmentModalOpen}
        setAppointmentModalOpen={setAppointmentModalOpen}
        appointmentModalPatient={appointmentModalPatient}
        billPatient={billPatient}
        editPatient={patientDetail?.patient ?? null}
        selectedBill={selectedBill}
        setSelectedBill={setSelectedBill}
        historyAppointment={historyAppointment}
        setHistoryAppointment={setHistoryAppointment}
        onRefetch={refetch}
        onPatientCreated={handlePatientCreated}
      />
    </div>
  );
}

export default function TodayPage() {
  return (
    <Suspense>
      <TodayPageInner />
    </Suspense>
  );
}
