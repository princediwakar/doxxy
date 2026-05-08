"use client";

import { useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { format, parseISO } from "date-fns";
import {
  CalendarPlus,
  Edit,
  Phone,
  MapPin,
  Hash,
  Eye,
  Receipt,
} from "lucide-react";
import { formatTimeIST } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTodayStore } from "@/stores/todayStore";
import type { PatientDetail } from "@/types/core";
import type { Patient } from "@/types/patients";

const AppointmentModal = dynamic(() =>
  import("@/components/appointments/AppointmentModal").then(
    (m) => m.AppointmentModal,
  ),
);
const PatientModal = dynamic(() =>
  import("@/components/patients/PatientModal").then((m) => m.PatientModal),
);

type ConsultationRow = {
  id: string;
  created_at: string;
  appointment_id?: string;
  specialty_data?: Record<string, unknown> | null;
  appointments?: {
    id?: string;
    doctor_id?: string;
    status?: string;
    date?: string;
    time?: string;
    doctors?: { name?: string } | null;
  } | null;
};

interface PatientChartProps {
  patientDetail: PatientDetail;
}

export function PatientChart({ patientDetail }: PatientChartProps) {
  const router = useRouter();
  const scheduleAppointment = useTodayStore((s) => s.scheduleAppointment);
  const editPatient = useTodayStore((s) => s.editPatient);
  const closeModal = useTodayStore((s) => s.closeModal);
  const appointmentModalOpen = useTodayStore((s) => s.appointmentModalOpen);
  const appointmentModalPatient = useTodayStore((s) => s.appointmentModalPatient);
  const selectedAppointment = useTodayStore((s) => s.selectedAppointment);
  const activeModal = useTodayStore((s) => s.activeModal);
  const patientCreated = useTodayStore((s) => s.patientCreated);

  const patient = patientDetail.patient!;
  const consultations = (patientDetail.consultations ?? []) as ConsultationRow[];
  const bills = (patientDetail.bills ?? []) as Array<{
    id: string;
    total_amount?: number;
    status?: string;
    created_at?: string;
    invoice_number?: string;
  }>;

  const handleSchedule = useCallback(() => {
    scheduleAppointment(patient as unknown as Patient);
  }, [scheduleAppointment, patient]);

  const handleEdit = useCallback(() => {
    editPatient();
  }, [editPatient]);

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
              Schedule Appointment
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
          {patient.medical_id && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Hash className="h-3.5 w-3.5" />
              MRN: {patient.medical_id}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Past Consultations */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Consultation History ({consultations.length})
        </h3>
        {consultations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No past consultations.
          </p>
        ) : (
          <div className="space-y-3">
            {consultations.map((c) => (
              <div
                key={c.id}
                className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Consultation ·{" "}
                      {c.appointments?.date
                        ? format(parseISO(c.appointments.date), "MMM dd, yyyy")
                        : c.created_at
                          ? format(parseISO(c.created_at), "MMM dd, yyyy")
                          : "Unknown date"}
                    </p>
                    {c.appointments && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {c.appointments.time
                          ? formatTimeIST(c.appointments.time) + " · "
                          : ""}
                        Doctor: {c.appointments.doctors?.name ?? "—"}
                        {" · "}
                        {c.appointments.status ?? "—"}
                      </p>
                    )}
                  </div>
                  {c.appointments?.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => {
                        const params = new URLSearchParams();
                        params.set("patient", patient.id);
                        params.set("appointment", c.appointments!.id!);
                        params.set("action", "view-consult");
                        if (c.appointments!.doctor_id) params.set("doctor_id", c.appointments!.doctor_id);
                        if (c.appointments!.doctors?.name) params.set("doctor_name", c.appointments!.doctors.name);
                        if (c.appointments!.date) params.set("date", c.appointments!.date);
                        if (c.appointments!.time) params.set("time", c.appointments!.time);
                        router.push(`/schedule?${params.toString()}`);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Notes
                    </Button>
                  )}
                </div>
                {(() => {
                    const sd = c.specialty_data;
                    if (sd && typeof sd === "object" && "chief_complaint" in sd) {
                      return (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {(sd as Record<string, unknown>).chief_complaint as string}
                        </p>
                      );
                    }
                    return null;
                  })()}
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Past Bills */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Billing History ({bills.length})
        </h3>
        {bills.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No past bills.
          </p>
        ) : (
          <div className="space-y-3">
            {bills.map((b) => (
              <div
                key={b.id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {b.invoice_number ?? "Bill"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {b.created_at
                        ? format(parseISO(b.created_at), "MMM dd, yyyy")
                        : "—"}
                    </p>
                  </div>
                </div>
                {b.total_amount != null && (
                  <span className="text-sm font-medium">
                    ₹{b.total_amount.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Suspense fallback={null}>
        <AppointmentModal
          open={appointmentModalOpen}
          onOpenChange={(open) => {
            if (!open) useTodayStore.setState({ appointmentModalOpen: false });
          }}
          appointment={selectedAppointment}
          patient={appointmentModalPatient}
        />
      </Suspense>

      <Suspense fallback={null}>
        {activeModal === "patient-edit" && (
          <PatientModal
            open={true}
            onOpenChange={(open) => {
              if (!open) closeModal();
            }}
            patient={patientDetail.patient}
            onPatientCreated={patientCreated as (p: Patient) => void}
          />
        )}
      </Suspense>
    </div>
  );
}
