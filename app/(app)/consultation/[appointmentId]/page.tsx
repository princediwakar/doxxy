"use client";
import { logger } from "@/lib/logger";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Spinner } from '@/components/ui/loading';

import {
  ConsultationHeader,
  PatientSidebar,
  ConsultationSectionCard,
  ConsultationProgress,
  printConsultation,
  mapDepartmentName,
} from "@/components/consultation";

import dynamic from 'next/dynamic';
const ConsultationPreviewModal = dynamic(() =>
  import("@/components/consultation/ConsultationPreviewModal").then((mod) => mod.ConsultationPreviewModal)
);
import type { ConsultationFormValues, DepartmentInfo } from "@/types/consultation";
import type { DbPatient as Patient } from "@/types/core";
import type { Prescription } from "@/types/prescriptions";
import { useConsultationData, useConsultationForm } from "@/hooks/consultation";
import { usePrefetching } from "@/hooks/usePrefetching";
import { showErrorToast } from "@/lib/error-utils";
import { specialtyFieldSections } from "@/lib/consultationNotesSchemas";
import type { FieldSection } from "@/lib/schemaUtils";

const Consultation = () => {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.appointmentId as string;
  const { user } = useAuth();

  const [showPreview, setShowPreview] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const {
    appointment, appointmentLoading, previousConsultations, recentPrescriptions,
    clinicDetails, doctorDetails, existingConsultation,
    departmentInfo, existingConsultationLoading, departmentInfoLoading,
  } = useConsultationData(appointmentId);

  const { prefetchAllEssentialData } = usePrefetching();

  useEffect(() => {
    if (!appointmentLoading && appointment) {
      prefetchAllEssentialData().catch(showErrorToast);
    }
  }, [appointmentLoading, appointment, prefetchAllEssentialData]);

  const departmentType = useMemo(() => {
    const name = departmentInfo?.clinic_departments?.department_types?.name || "";
    return mapDepartmentName(name);
  }, [departmentInfo]);

  const specialtySections = useMemo(
    () => specialtyFieldSections[departmentType] || specialtyFieldSections["General"],
    [departmentType]
  );

  const {
    form, isConsultationCompleted, canEditConsultation, autoSaveMutation,
    handleSave, handleCompleteConsultation, mandatoryFieldsStatus, justCompleted,
  } = useConsultationForm({
    appointmentId, appointment, existingConsultation, departmentType,
  });

  useEffect(() => {
    if (!justCompleted) return;
    const timer = setTimeout(() => router.push("/appointments"), 3000);
    toast.success("Consultation completed! Redirecting to appointments in 3 seconds...");
    return () => clearTimeout(timer);
  }, [justCompleted, router]);

  const handlePrint = useCallback(async () => {
    const formData = form.getValues().specialty_data;
    const patient = appointment?.patient;
    if (!patient) return;
    try {
      await printConsultation(formData, patient, appointment, clinicDetails, doctorDetails, user, departmentType);
      toast.success("Print dialog opened successfully");
    } catch (error) {
      logger.error("Error printing consultation:", error);
      toast.error("Failed to open print dialog");
    }
  }, [form, appointment, clinicDetails, doctorDetails, user, departmentType]);

  if (appointmentLoading || existingConsultationLoading || departmentInfoLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="xl" className="mx-auto mb-4" />
          <p>Loading consultation data...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive">Appointment not found</p>
        </div>
      </div>
    );
  }

  const patient = appointment.patient as Patient;

  return (
    <div className="min-h-screen">
      <ConsultationHeader
        patient={patient}
        isConsultationCompleted={!!isConsultationCompleted}
        canEditConsultation={!!canEditConsultation}
        autoSaveMutation={autoSaveMutation}
        mandatoryFieldsStatus={mandatoryFieldsStatus}
        onBack={() => router.push("/appointments")}
        onSave={handleSave}
        onPrint={handlePrint}
        onPreview={() => setShowPreview(true)}
        onComplete={handleCompleteConsultation}
      />

      <div className="max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="md:col-span-2 lg:col-span-3">
            <div className="space-y-6">
              <ConsultationProgress
                specialtySections={specialtySections}
                form={form}
                isConsultationCompleted={!!isConsultationCompleted}
              />

              <form className="space-y-6">
                {specialtySections.map((section, index) => (
                  <ConsultationSectionCard
                    key={index}
                    section={section}
                    sectionIndex={index}
                    form={form}
                    canEditConsultation={!!canEditConsultation}
                    isExpanded={expandedSections[section.title] ?? true}
                    onToggle={() =>
                      setExpandedSections((prev) => ({
                        ...prev,
                        [section.title]: !expandedSections[section.title],
                      }))
                    }
                  />
                ))}
              </form>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <PatientSidebar
              patient={patient}
              appointment={appointment}
              departmentInfo={departmentInfo as DepartmentInfo}
              previousConsultations={previousConsultations || []}
              recentPrescriptions={(recentPrescriptions || []) as unknown as Prescription[]}
            />
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center p-4">
            <Spinner size="md" />
          </div>
        }
      >
        <ConsultationPreviewModal
          showPreview={showPreview}
          setShowPreview={setShowPreview}
          form={form}
          patient={patient}
          appointment={appointment}
          specialtySections={specialtySections}
          departmentType={departmentType}
        />
      </Suspense>
    </div>
  );
};

export default Consultation;