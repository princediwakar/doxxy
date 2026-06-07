"use client";

import { useCallback, Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  CalendarPlus,
  Edit,
  Phone,
  MapPin,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BillingSection } from "@/components/schedule/BillingSection";
import { ConsultationHistory } from "@/components/schedule/ConsultationHistory";
import type { PatientDetail } from "@/types/core";
import type { Patient } from "@/types/patients";
import type { Bill } from "@/types/billing";

const AppointmentModal = dynamic(() =>
  import("@/components/appointments/AppointmentModal").then(
    (m) => m.AppointmentModal,
  ),
);
const PatientModal = dynamic(() =>
  import("@/components/patients/PatientModal").then((m) => m.PatientModal),
);
const BillingModal = dynamic(() =>
  import("@/components/billing/BillingModal").then((m) => m.BillingModal),
);

interface PatientChartProps {
  patientDetail: PatientDetail;
}

export function PatientChart({ patientDetail }: PatientChartProps) {
  const router = useRouter();

  const [showCreateBillModal, setShowCreateBillModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedBillMode, setSelectedBillMode] = useState<"create" | "view" | "edit">("view");
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [appointmentModalPatient, setAppointmentModalPatient] = useState<Patient | null>(null);
  const [patientEditModalOpen, setPatientEditModalOpen] = useState(false);

  const patient = patientDetail.patient!;
  const bills = (patientDetail.bills ?? []) as Bill[];

  const handleViewConsultationFromHistory = useCallback(
    (appointmentId: string, _patientId: string, doctorId: string, date?: string, time?: string, doctorName?: string) => {
      const params = new URLSearchParams();
      params.set("patient", patient.id);
      params.set("appointment", appointmentId);
      params.set("action", "view-consult");
      if (doctorId) params.set("doctor_id", doctorId);
      if (doctorName) params.set("doctor_name", doctorName);
      if (date) params.set("date", date);
      if (time) params.set("time", time);
      router.push(`/schedule?${params.toString()}`);
    },
    [patient.id, router],
  );

  const handleCreateBill = useCallback(() => {
    setShowCreateBillModal(true);
  }, []);

  const handleViewBill = useCallback((bill: Bill) => {
    setSelectedBill(bill);
    setSelectedBillMode("view");
  }, []);

  const handleSchedule = useCallback(() => {
    setAppointmentModalPatient(patient as unknown as Patient);
    setAppointmentModalOpen(true);
  }, [patient]);

  const handleEdit = useCallback(() => {
    setPatientEditModalOpen(true);
  }, []);

  const handlePatientCreated = useCallback((newPatient: Patient) => {
    setPatientEditModalOpen(false);
    setAppointmentModalPatient(newPatient);
    setAppointmentModalOpen(true);
  }, []);

  const demographic = [patient.gender, patient.age ? `${patient.age}y` : null]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Patient Demographics */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold truncate">{patient.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{demographic}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit Patient
            </Button>
            <Button size="sm" onClick={handleSchedule}>
              <CalendarPlus className="h-3.5 w-3.5 mr-1.5" />
              Schedule
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {patient.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              {patient.phone}
            </div>
          )}
          {patient.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{patient.address}</span>
            </div>
          )}
          {patient.uhid && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Hash className="h-3.5 w-3.5" />
              UHID: {patient.uhid}
            </div>
          )}
        </div>
      </div>

      <Separator />

      <ConsultationHistory
        patientDetail={patientDetail}
        isLoadingDetail={false}
        selectedPatientId={patient.id}
        currentAppointmentId={null}
        onViewConsultationFromHistory={handleViewConsultationFromHistory}
      />

      <Separator />

      <BillingSection
        patientBills={bills}
        isLoadingBills={false}
        showCreateBill
        onCreateBill={handleCreateBill}
        onViewBill={handleViewBill}
      />

      <Suspense fallback={null}>
        <AppointmentModal
          open={appointmentModalOpen}
          onOpenChange={(open) => {
            if (!open) setAppointmentModalOpen(false);
          }}
          appointment={null}
          patient={appointmentModalPatient}
        />
      </Suspense>

      <Suspense fallback={null}>
        {patientEditModalOpen && (
          <PatientModal
            open={true}
            onOpenChange={(open) => {
              if (!open) setPatientEditModalOpen(false);
            }}
            patient={patientDetail.patient}
            onPatientCreated={handlePatientCreated}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        <BillingModal
          open={showCreateBillModal}
          onOpenChange={setShowCreateBillModal}
          patient={patient as unknown as import("@/types/core").DbPatient}
          mode="create"
        />
      </Suspense>

      <Suspense fallback={null}>
        <BillingModal
          open={selectedBill !== null}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedBill(null);
              setSelectedBillMode("view");
            }
          }}
          bill={selectedBill}
          patient={patient as unknown as import("@/types/core").DbPatient}
          mode={selectedBillMode}
          onModeChange={setSelectedBillMode}
        />
      </Suspense>
    </div>
  );
}
