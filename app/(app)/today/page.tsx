"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { logger } from "@/lib/logger";
import { showErrorToast } from "@/lib/error-utils";
import { useTodayStore } from "@/stores/todayStore";
import { useTodayAppointments } from "@/hooks/useTodayAppointments";
import { usePatientSearch } from "@/hooks/usePatientSearch";
import { usePatientDetail } from "@/hooks/usePatientDetail";
import { usePatientBills } from "@/hooks/usePatientBills";
import { useAppointmentActions } from "@/hooks/useAppointmentActions";
import { usePayments } from "@/hooks/usePayments";
import { usePrefetching } from "@/hooks/usePrefetching";
import { useFABAction } from "@/hooks/useFABAction";
import { useEncounterCompletion } from "@/hooks/encounter/useEncounterCompletion";
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
import type { AIStructuredOutput } from "@/types/voice";

function TodayPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeFilter = useTodayStore((s) => s.activeFilter);
  const searchQuery = useTodayStore((s) => s.searchQuery);
  const genderFilter = useTodayStore((s) => s.genderFilter);
  const ageGroupFilter = useTodayStore((s) => s.ageGroupFilter);
  const selectedPatientId = useTodayStore((s) => s.selectedPatientId);
  const mobileDetailOpen = useTodayStore((s) => s.mobileDetailOpen);
  const openModal = useTodayStore((s) => s.openModal);
  const closeModal = useTodayStore((s) => s.closeModal);
  const selectPatient = useTodayStore((s) => s.selectPatient);
  const setMobileDetailOpen = useTodayStore((s) => s.setMobileDetailOpen);
  const setGenderFilter = useTodayStore((s) => s.setGenderFilter);
  const setAgeGroupFilter = useTodayStore((s) => s.setAgeGroupFilter);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    setGenderFilter(searchParams.get("gender"));
    setAgeGroupFilter(searchParams.get("age_group"));
  }, [searchParams]);

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
  const { data: patientBills = [], isLoading: isLoadingBills } = usePatientBills(selectedPatientId);

  const { handleStartConsultation: startConsultation } = useAppointmentActions();
  const { canBookAppointment } = usePayments();
  const { prefetchPatients, prefetchDoctors, prefetchConsultationData } = usePrefetching();
  const { completeEncounter, isCompleting } = useEncounterCompletion();
  const setDraftConsultationData = useTodayStore((s) => s.setDraftConsultationData);

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
    const all = [...queue.inProgress, ...queue.scheduled, ...queue.completed];
    const map = new Map<string, AppointmentWithDetails[]>();
    for (const app of all) {
      const list = map.get(app.patient_id) || [];
      list.push(app);
      map.set(app.patient_id, list);
    }
    return map;
  }, [queue]);

  const patientAppointments = selectedPatientId
    ? appointmentsByPatient.get(selectedPatientId) ?? []
    : [];

  const handleAppointmentClick = useCallback(
    (app: AppointmentWithDetails) => {
      setSelectedAppointment(app);
      selectPatient(app.patient_id, app.id);
    }, [selectPatient]);

  const handleStartConsultation = useCallback(
    async (app: AppointmentWithDetails) => {
      try {
        await prefetchConsultationData(app.id);
        await startConsultation(app.id, canBookAppointment);
        router.push(`/consultation/${app.id}`);
      } catch (err) { logger.warn("Consultation start prevented:", err); }
    },
    [prefetchConsultationData, startConsultation, router, canBookAppointment]);

  const handleViewConsultation = useCallback(
    (app: AppointmentWithDetails) => { setSelectedAppointment(app); openModal("consult"); },
    [openModal]);

  const handleEditConsultation = useCallback(
    (app: AppointmentWithDetails) => { router.push(`/consultation/${app.id}`); },
    [router]);

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

  const handleEditPatient = useCallback(
    () => { openModal("patient-edit"); }, [openModal]);

  const handleApproveEncounter = useCallback(
    (appointmentId: string, patientId: string, doctorId: string, aiData: AIStructuredOutput) => {
      completeEncounter({ appointmentId, patientId, doctorId, aiData }, {
        onSuccess: () => selectPatient(patientId, appointmentId),
      });
    },
    [completeEncounter, selectPatient]
  );

  const handleEditManually = useCallback(
    (appointmentId: string, aiData: AIStructuredOutput) => {
      setDraftConsultationData(aiData);
      router.push(`/consultation/${appointmentId}`);
    },
    [setDraftConsultationData, router]
  );

  const handleScheduleAppointment = useCallback(
    () => {
      if (patientDetail?.patient) {
        setAppointmentModalPatient(patientDetail.patient as Patient);
        setSelectedAppointment(null);
        setAppointmentModalOpen(true);
      }
    }, [patientDetail]);

  const handlePatientCreated = useCallback(
    (patient: Patient) => {
      closeModal();
      setAppointmentModalPatient(patient);
      setAppointmentModalOpen(true);
    }, [closeModal]);

  const showMobileDetail = isMobile && mobileDetailOpen;
  const detailProps = {
    activeFilter,
    patientAppointments, patientDetail, isLoadingDetail,
    patientBills, isLoadingBills,
    onStartConsultation: handleStartConsultation,
    onViewConsultation: handleViewConsultation,
    onEditConsultation: handleEditConsultation,
    onCreateBill: handleCreateBill,
    onCreateBillForPatient: handleCreateBillForPatient,
    onScheduleAppointment: handleScheduleAppointment,
    onEditAppointment: handleEditAppointment,
    onEditPatient: handleEditPatient,
    onViewBill: handleViewBill,
    onViewConsultationFromHistory: handleViewConsultationFromHistory,
    onApproveEncounter: handleApproveEncounter,
    onEditManually: handleEditManually,
    isCompleting,
  };

  const listProps = {
    queue, isLoadingQueue,
    searchPatients, isLoadingSearch,
    appointmentsByPatient,
    onAppointmentClick: handleAppointmentClick,
  };

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
