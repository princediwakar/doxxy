"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Receipt, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PatientHeader } from "./PatientHeader";
import { AdministrativeFooter } from "./AdministrativeFooter";
import { updateAppointment } from "@/actions/appointments";
import { useTodayStore } from "@/stores/todayStore";
import type { AppointmentWithDetails } from "@/types/appointments";
import type { PatientDetail } from "@/types/core";
import type { BillWithDetails } from "@/types/billing";

interface StaffWorkflowProps {
  appointment: AppointmentWithDetails | null;
  patientDetail: PatientDetail | undefined;
  isLoadingDetail: boolean;
  selectedPatientId: string;
  patientBills: BillWithDetails[];
  isLoadingBills: boolean;
  onRefreshNeeded: () => void;
}

export function StaffWorkflow({
  appointment,
  patientDetail,
  isLoadingDetail,
  selectedPatientId,
  patientBills,
  isLoadingBills,
  onRefreshNeeded,
}: StaffWorkflowProps) {
  const [updating, setUpdating] = useState(false);
  const createBill = useTodayStore((s) => s.createBill);
  const createBillForPatient = useTodayStore((s) => s.createBillForPatient);
  const scheduleAppointment = useTodayStore((s) => s.scheduleAppointment);
  const editAppointment = useTodayStore((s) => s.editAppointment);
  const editPatient = useTodayStore((s) => s.editPatient);
  const viewBill = useTodayStore((s) => s.viewBill);
  const viewConsultation = useTodayStore((s) => s.viewConsultation);

  const handleViewBill = useCallback(
    (bill: BillWithDetails) => viewBill(bill, patientDetail?.patient ?? null),
    [viewBill, patientDetail?.patient],
  );

  const handleCheckIn = useCallback(async () => {
    if (!appointment) return;
    setUpdating(true);
    const result = await updateAppointment(appointment.id, {
      status: "In Progress",
    });
    setUpdating(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Patient checked in");
      onRefreshNeeded();
    }
  }, [appointment, onRefreshNeeded]);

  const handleComplete = useCallback(async () => {
    if (!appointment) return;
    setUpdating(true);
    const result = await updateAppointment(appointment.id, {
      status: "Completed",
    });
    setUpdating(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Appointment completed");
      onRefreshNeeded();
    }
  }, [appointment, onRefreshNeeded]);

  const handleGenerateBill = useCallback(() => {
    if (appointment) {
      createBill(appointment);
    } else if (patientDetail?.patient) {
      createBillForPatient(patientDetail.patient);
    }
  }, [appointment, patientDetail, createBill, createBillForPatient]);

  return (
    <div className="space-y-4">
      {patientDetail?.patient && (
        <PatientHeader
          name={patientDetail.patient.name}
          age={patientDetail.patient.age}
          gender={patientDetail.patient.gender}
          medicalId={patientDetail.patient.medical_id}
          status={appointment?.status}
          appointmentType={appointment?.type}
          appointmentTime={appointment?.time}
          departmentName={appointment?.department_name}
          notes={appointment?.notes}
          variant="staff"
          onSchedule={() =>
            patientDetail.patient &&
            scheduleAppointment(patientDetail.patient)
          }
          onBill={handleGenerateBill}
          onEditPatient={editPatient}
          onEditAppointment={() =>
            appointment && editAppointment(appointment)
          }
        />
      )}

      {/* Status Actions */}
      {appointment && (
        <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Current Status:{" "}
            <span className="text-foreground font-semibold">
              {appointment.status}
            </span>
          </p>

          <div className="flex flex-wrap gap-2">
            {appointment.status === "Scheduled" && (
              <Button
                size="sm"
                onClick={handleCheckIn}
                disabled={updating}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Check In / Assign Room
              </Button>
            )}

            {appointment.status === "In Progress" && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleComplete}
                disabled={updating}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Mark Completed
              </Button>
            )}

            {appointment.status === "Completed" && (
              <>
                <Button size="sm" onClick={handleGenerateBill}>
                  <Receipt className="h-3.5 w-3.5 mr-1.5" />
                  Generate Bill
                </Button>
                <Button size="sm" variant="outline" onClick={handleGenerateBill}>
                  <Coins className="h-3.5 w-3.5 mr-1.5" />
                  Collect Copay
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <Separator />

      <AdministrativeFooter
        patientDetail={patientDetail}
        isLoadingDetail={isLoadingDetail}
        selectedPatientId={selectedPatientId}
        currentAppointmentId={null}
        patientBills={patientBills}
        isLoadingBills={isLoadingBills}
        defaultExpandBills
        defaultExpandHistory
        onViewBill={handleViewBill}
        onViewConsultationFromHistory={viewConsultation}
        onCreateBill={handleGenerateBill}
      />
    </div>
  );
}
