// src/pages/Consultation.tsx
import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  Stethoscope,
  Activity,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { FieldPath } from "react-hook-form";
import { toast } from "sonner";

// Import all the extracted components and hooks
import {
  ConsultationHeader,
  PatientSidebar,
  ConsultationFormField,
  printConsultation,
} from "@/components/consultation";

// Lazy load heavy modal components
import { lazy, Suspense } from 'react';
const ConsultationPreviewModal = lazy(() => import('@/components/consultation/ConsultationPreviewModal').then(module => ({ default: module.ConsultationPreviewModal })));
import { ConsultationFormValues, DepartmentInfo } from "@/types/consultation";
import { DbPatient as Patient } from "@/types/core";
import { Prescription } from "@/types/prescriptions";
import { useConsultationData, useConsultationForm } from "@/hooks/consultation";
import { usePrefetching } from "@/hooks/usePrefetching";
import {
  specialtyFieldSections,
} from "@/lib/consultationNotesSchemas";
import { type FieldSection, type NoteFieldConfig } from "@/lib/schemaUtils";
import { FieldValue } from "@/types/consultation";

const Consultation = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { user } = useAuth();

  // Preview state
  const [showPreview, setShowPreview] = useState(false);

  // Collapsible sections state - organized by section
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  // Fetch all consultation data
  const {
    appointment,
    appointmentLoading,
    previousConsultations,
    recentPrescriptions,
    clinicDetails,
    doctorDetails,
    existingConsultation,
    departmentInfo,
    existingConsultationLoading,
    departmentInfoLoading,
  } = useConsultationData(appointmentId);

  // Prefetching hook
  const { prefetchAllEssentialData } = usePrefetching();

  // Prefetch essential data when consultation data is loaded
  useEffect(() => {
    if (!appointmentLoading && appointment) {
      // Prefetch in background to prepare for navigation
      prefetchAllEssentialData().catch(console.error);
    }
  }, [appointmentLoading, appointment, prefetchAllEssentialData]);

  // Get specialty sections based on department
  const specialtySections = useMemo(() => {
    // Get department from the separate query
    const departmentName =
      departmentInfo?.clinic_departments?.department_types?.name;

    // Map department names to schema keys
    const departmentMapping: Record<string, string> = {
      Ophthalmology: "Ophthalmology",
      Neurology: "Neurology",
      Cardiology: "Cardiology",
      Dermatology: "Dermatology",
      Orthopedics: "Orthopedics",
      Psychiatry: "Psychiatry",
      Pediatrics: "Pediatrics",
      ENT: "ENT",
      Gynecology: "Gynecology",
      Pulmonology: "Pulmonology",
      Dental: "Dental",
      "General Medicine": "General",
    };

    const mappedDepartment =
      departmentMapping[departmentName || ""] || "General";
    console.log("Department:", departmentName, "Mapped to:", mappedDepartment);
    return (
      specialtyFieldSections[mappedDepartment] ||
      specialtyFieldSections["General"]
    );
  }, [departmentInfo]);

  // Get department type for validation
  const departmentType = useMemo(() => {
    const departmentName =
      departmentInfo?.clinic_departments?.department_types?.name;
    const departmentMapping: Record<string, string> = {
      Ophthalmology: "Ophthalmology",
      Neurology: "Neurology",
      Cardiology: "Cardiology",
      Dermatology: "Dermatology",
      Orthopedics: "Orthopedics",
      Psychiatry: "Psychiatry",
      Pediatrics: "Pediatrics",
      ENT: "ENT",
      Gynecology: "Gynecology",
      Pulmonology: "Pulmonology",
      Dental: "Dental",
      "General Medicine": "General",
    };
    return departmentMapping[departmentName || ""] || "General";
  }, [departmentInfo]);

  // Form management - decoupled state management
  console.log('Consultation page - appointmentId from params:', appointmentId);
  console.log('Consultation page - appointment data:', {
    id: appointment?.id,
    status: appointment?.status,
    patient_name: (appointment?.patient as Patient)?.name
  });

  const {
    form,
    isConsultationCompleted,
    canEditConsultation,
    autoSaveMutation,
    handleSave,
    handleCompleteConsultation,
    mandatoryFieldsStatus,
    justCompleted,
  } = useConsultationForm({
    appointmentId,
    appointment,
    existingConsultation,
    departmentType
  });

  // Handle consultation completion with navigation
  useEffect(() => {
    console.log('🔄 Navigation effect triggered, justCompleted:', justCompleted);
    console.log('🔄 Navigation effect dependencies - justCompleted:', justCompleted, 'navigate function:', !!navigate);

    if (justCompleted) {
      console.log('✅ Starting 3-second countdown to navigate to appointments...');
      // Set timeout for redirect
      const timer = setTimeout(() => {
        console.log('🚀 Navigating to appointments page...');
        navigate("/appointments");
      }, 3000);

      // Show countdown toast
      toast.success('Consultation completed! Redirecting to appointments in 3 seconds...');

      return () => {
        console.log('🔄 Clearing navigation timer');
        clearTimeout(timer);
      };
    } else {
      console.log('❌ Navigation effect: justCompleted is false, no redirect');
    }
  }, [justCompleted, navigate]);

  // Enhanced print functionality
  const handlePrint = useCallback(async () => {
    const formData = form.getValues().specialty_data;
    const patient = appointment?.patient;

    if (patient) {
      try {
        await printConsultation(
          formData,
          patient,
          appointment,
          clinicDetails,
          doctorDetails,
          user,
          departmentType // Pass department type for consistent formatting
        );
        toast.success("Print dialog opened successfully");
      } catch (error) {
        console.error("Error printing consultation:", error);
        toast.error("Failed to open print dialog");
      }
    }
  }, [form, appointment, clinicDetails, doctorDetails, user, departmentType]);

  // Section rendering with improved UX
  const renderSection = (section: FieldSection, sectionIndex: number) => {
    const isExpanded = expandedSections[section.title] ?? true;

    const toggleSection = () => {
      setExpandedSections((prev) => ({
        ...prev,
        [section.title]: !expandedSections[section.title],
      }));
    };

    const getSectionIcon = (title: string) => {
      if (title.toLowerCase().includes("history"))
        return <User className="h-5 w-5 text-primary" />;
      if (title.toLowerCase().includes("examination"))
        return <Stethoscope className="h-5 w-5 text-success" />;
      if (
        title.toLowerCase().includes("plan") ||
        title.toLowerCase().includes("diagnosis")
      )
        return <ClipboardList className="h-5 w-5 text-secondary" />;
      if (title.toLowerCase().includes("investigation"))
        return <FileText className="h-5 w-5 text-accent" />;
      return <Activity className="h-5 w-5 text-muted-foreground" />;
    };

    const completedFields = section.fields.filter((field: NoteFieldConfig) => {
      const formValues = form.getValues();
      const value = (formValues.specialty_data as Record<string, unknown>)?.[
        field.name
      ];
      return value && String(value).trim().length > 0;
    }).length;

    return (
      <Card key={sectionIndex} className="bg-white">
        <Collapsible open={isExpanded} onOpenChange={toggleSection}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="flex items-center gap-3 text-lg">
                  {getSectionIcon(section.title)}
                  <span className="text-gray-900">{section.title}</span>
                </CardTitle>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {completedFields}/{section.fields.length} completed
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-6 space-y-4">
              {section.fields.map((field: NoteFieldConfig, fieldIndex: number) => (
                <ConsultationFormField
                  key={fieldIndex}
                  fieldConfig={field}
                  fieldIndex={fieldIndex}
                  value={
                    form.watch(
                      `specialty_data.${field.name}` as FieldPath<ConsultationFormValues>
                    ) as unknown as FieldValue
                  }
                  onChange={(value) =>
                    form.setValue(
                      `specialty_data.${field.name}` as FieldPath<ConsultationFormValues>,
                      value as never
                    )
                  }
                  isReadOnly={!canEditConsultation}
                  // Simple auto-focus only for the very first field
                  autoFocus={sectionIndex === 0 && fieldIndex === 0}
                />
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  // Loading states
  if (
    appointmentLoading ||
    existingConsultationLoading ||
    departmentInfoLoading
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
      {/* Header */}
      <ConsultationHeader
        patient={patient}
        isConsultationCompleted={!!isConsultationCompleted}
        canEditConsultation={!!canEditConsultation}
        autoSaveMutation={autoSaveMutation}
        mandatoryFieldsStatus={mandatoryFieldsStatus}
        onBack={() => navigate("/appointments")}
        onSave={handleSave}
        onPrint={handlePrint}
        onPreview={() => setShowPreview(true)}
        onComplete={handleCompleteConsultation}
      />

      <div className="max-w-7xl mx-auto  py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Consultation Form with Sections */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Progress Overview */}
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Medical Consultation
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {specialtySections.reduce((completed, section) => {
                          const hasContent = section.fields.some((field: NoteFieldConfig) => {
                            const formValues = form.getValues();
                            const value = (
                              formValues.specialty_data as Record<
                                string,
                                unknown
                              >
                            )?.[field.name];
                            return (
                              value &&
                              (typeof value === "string"
                                ? value.length > 0
                                : Array.isArray(value)
                                ? value.length > 0
                                : !!value)
                            );
                          });
                          return completed + (hasContent ? 1 : 0);
                        }, 0)}
                        /{specialtySections.length} sections completed
                      </p>
                    </div>
                    <Badge
                      variant={
                        isConsultationCompleted === true
                          ? "default"
                          : "secondary"
                      }
                      className="text-sm"
                    >
                      {isConsultationCompleted === true
                        ? "Completed"
                        : "In Progress"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <form className="space-y-6">
                {specialtySections.map((section, index) =>
                  renderSection(section, index)
                )}
              </form>
            </div>
          </div>

          {/* Patient Information Sidebar */}
          <div className="lg:col-span-1">
            <PatientSidebar
              patient={patient}
              appointment={appointment}
              departmentInfo={departmentInfo as DepartmentInfo}
              previousConsultations={previousConsultations || []}
              // Cast the Database type (with JSON) to the UI type (with strict objects)
              recentPrescriptions={(recentPrescriptions || []) as unknown as Prescription[]}
            />
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Suspense fallback={<div className="flex items-center justify-center p-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>}>
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