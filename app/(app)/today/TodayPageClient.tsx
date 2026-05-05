"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTodayStore } from "@/stores/todayStore";
import { useIsMobile } from "@/hooks/useIsMobile";
import { queryPatientDetail, queryPatientBills } from "@/lib/queries/patients";
import { TodayHeader } from "@/components/today/TodayHeader";
import { TodayQueueView } from "@/components/today/TodayQueueView";
import { TodayDetailView } from "@/components/today/TodayDetailView";
import { TodayMobileLayout } from "@/components/today/TodayMobileLayout";
import { TodayModals } from "@/components/today/TodayModals";
import { DoctorProfilePrompt } from "@/components/doctor/DoctorProfilePrompt";
import type { AppointmentWithDetails } from "@/types/appointments";
import type { PatientDetail } from "@/types/core";
import type { BillWithDetails } from "@/types/billing";

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
}

export function TodayPageClient({
  clinicId,
  serverQueue,
  initialPatientId,
  initialPatientDetail,
  doctors,
  effectiveDoctorFilter,
  userDoctorId,
}: TodayPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── URL state ──
  const selectedPatientId = searchParams.get("patient") || null;
  const selectedAppointmentId = searchParams.get("appointment") || null;

  // ── FAB action handler ──
  const openModal = useTodayStore((s) => s.openModal);
  const fabHandled = useRef(false);
  useEffect(() => {
    if (searchParams.get("action") === "new-patient" && !fabHandled.current) {
      fabHandled.current = true;
      openModal("patient-new");
      const next = new URLSearchParams(searchParams.toString());
      next.delete("action");
      const qs = next.toString();
      router.replace(window.location.pathname + (qs ? `?${qs}` : ""));
    } else if (searchParams.get("action") !== "new-patient") {
      fabHandled.current = false;
    }
  }, [searchParams, router, openModal]);

  // ── Store ──
  const mobileDetailOpen = useTodayStore((s) => s.mobileDetailOpen);
  const setMobileDetailOpen = useTodayStore((s) => s.setMobileDetailOpen);
  const selectAppointment = useTodayStore((s) => s.selectAppointment);

  // ── Patient detail ──
  const isInitialPatient =
    !!(initialPatientId && selectedPatientId === initialPatientId);
  const { data: remoteDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["patient", selectedPatientId, "detail"],
    queryFn: () => queryPatientDetail(clinicId!, selectedPatientId!),
    enabled: !!clinicId && !!selectedPatientId && !isInitialPatient,
    staleTime: 30 * 1000,
  });
  const patientDetail: PatientDetail | undefined = isInitialPatient
    ? initialPatientDetail ?? undefined
    : remoteDetail;

  // ── Patient bills ──
  const { data: patientBills = [], isLoading: isLoadingBills } = useQuery({
    queryKey: ["patient", selectedPatientId, "bills"],
    queryFn: () => queryPatientBills(selectedPatientId!),
    enabled: !!selectedPatientId,
    staleTime: 30 * 1000,
  });

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
    <div className="space-y-6">
      <DoctorProfilePrompt />
      <TodayMobileLayout
        showMobileDetail={showMobileDetail}
        onBackToQueue={() => setMobileDetailOpen(false)}
        header={<TodayHeader doctors={doctors} effectiveDoctorFilter={effectiveDoctorFilter} userDoctorId={userDoctorId} />}
        queue={
          <TodayQueueView
            queue={serverQueue}
            onAppointmentClick={selectAppointment}
            isMobile={isMobile}
            doctorFilter={effectiveDoctorFilter}
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
          />
        }
      />
      <TodayModals
        editPatient={patientDetail?.patient ?? null}
        onRefetch={handleRefetch}
      />
    </div>
  );
}
