// components/patients/PatientChart.tsx
"use client";

import { useCallback, Suspense, useState } from "react";
import dynamic from "next/dynamic";
import {
  CalendarPlus,
  Calendar,
  Edit,
  Mail,
  Phone,
  MapPin,
  Hash,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { BillingSection } from "@/components/schedule/BillingSection";
import { ConsultationHistory } from "@/components/schedule/ConsultationHistory";
import type { PatientDetail } from "@/types/core";
import type { Patient, AppointmentData } from "@/types/patients";
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
const ConsultationViewModal = dynamic(() =>
  import("@/components/consultation/ConsultationViewModal").then(
    (m) => m.ConsultationViewModal,
  ),
);

interface PatientChartProps {
  patientDetail: PatientDetail;
}

export function PatientChart({ patientDetail }: PatientChartProps) {
  const [showCreateBillModal, setShowCreateBillModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedBillMode, setSelectedBillMode] = useState<"create" | "view" | "edit">("view");
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [appointmentModalPatient, setAppointmentModalPatient] = useState<Patient | null>(null);
  const [patientEditModalOpen, setPatientEditModalOpen] = useState(false);
  const [consultAppointment, setConsultAppointment] = useState<AppointmentData | null>(null);

  const patient = patientDetail.patient!;
  const bills = (patientDetail.bills ?? []) as Bill[];

  const handleViewConsultationFromHistory = useCallback(
    (appointmentId: string, _patientId: string, doctorId: string, date?: string, time?: string, doctorName?: string) => {
      setConsultAppointment({
        id: appointmentId,
        patient_id: patient.id,
        doctor_id: doctorId,
        date: date || "",
        time: time || "",
        type: "Walk-in",
        status: "Completed",
        created_at: "",
        patient_name: patient.name,
        patient_gender: patient.gender ?? null,
        patient_age: patient.age ?? null,
        doctor_name: doctorName,
      });
    },
    [patient],
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
            <div className="flex items-center gap-3 mb-2">
              {(() => {
                const g = (patient.gender || "").toLowerCase();
                const color = g === "male" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : g === "female" ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400" : "bg-primary/10 text-primary";
                return (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                    <span className="text-sm font-semibold">{patient.name?.[0]?.toUpperCase() || "?"}</span>
                  </div>
                );
              })()}
              <h2 className="text-xl font-semibold truncate">{patient.name}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{demographic}</p>
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
          {patient.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{patient.email}</span>
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
          {patient.created_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Created on: {format(parseISO(patient.created_at), "MMM dd, yyyy")}
            </div>
          )}
        </div>
      </div>

      <BillingSection
        patientBills={bills}
        isLoadingBills={false}
        showCreateBill
        onCreateBill={handleCreateBill}
        onViewBill={handleViewBill}
      />

      <ConsultationHistory
        patientDetail={patientDetail}
        isLoadingDetail={false}
        selectedPatientId={patient.id}
        currentAppointmentId={null}
        onViewConsultationFromHistory={handleViewConsultationFromHistory}
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

      <Suspense fallback={null}>
        <ConsultationViewModal
          open={consultAppointment !== null}
          onOpenChange={(open) => {
            if (!open) setConsultAppointment(null);
          }}
          appointment={consultAppointment}
        />
      </Suspense>
    </div>
  );
}
