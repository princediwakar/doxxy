import { useState, useCallback, useMemo, useRef, useEffect } from "react";
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
  ConsultationPreviewModal,
  printConsultation,
  ConsultationFormValues,
  Patient,
} from "@/components/consultation";
import { useConsultationData, useConsultationForm } from "@/hooks/consultation";
import {
  specialtyFieldSections,
  type FieldSection,
} from "@/lib/consultationNotesSchemas";
import { FieldValue } from "@/components/consultation/types";

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

  // Individual field expansion state - keep first field of each section expanded by default
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>(
    {
      chief_complaint: true, // History section first field
      vital_signs: true, // Examination section first field
      previous_investigations: true, // Previous Investigations section first field
      diagnosis: true, // Management section first field
      assessment: true, // Always expanded
      prescriptions: true, // Always expanded
    }
  );

  // Track whether initial focus has been applied
  const initialFocusApplied = useRef(false);

  // Apply focus to chief complaint field after initial render
  useEffect(() => {
    if (!initialFocusApplied.current && !appointmentLoading && !existingConsultationLoading && !departmentInfoLoading) {
      // Use setTimeout to ensure all fields are rendered
      setTimeout(() => {
        const chiefComplaintElement = document.querySelector(
          '[data-field-name="chief_complaint"] input, [data-field-name="chief_complaint"] textarea'
        ) as HTMLElement;
        if (chiefComplaintElement) {
          chiefComplaintElement.focus();
          initialFocusApplied.current = true;
        }
      }, 200);
    }
  }, [appointmentLoading, existingConsultationLoading, departmentInfoLoading]);

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


  // Form management
  const {
    form,
    isConsultationCompleted,
    canEditConsultation,
    autoSaveMutation,
    handleSave,
    handleCompleteConsultation,
    mandatoryFieldsStatus,
  } = useConsultationForm(
    appointmentId,
    appointment,
    existingConsultation,
    () => navigate("/appointments"), // Redirect callback
    departmentType // Pass department type for validation
  );

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
      const willExpand = !expandedSections[section.title];

      setExpandedSections((prev) => ({
        ...prev,
        [section.title]: willExpand,
      }));

      // When expanding a section, automatically expand and focus the first field
      if (willExpand && section.fields.length > 0) {
        const firstField = section.fields[0];
        setExpandedFields((prev) => ({
          ...prev,
          [firstField.name]: true,
        }));

        // Use setTimeout to ensure the field is rendered before focusing
        setTimeout(() => {
          const firstFieldElement = document.querySelector(
            `[data-field-name="${firstField.name}"] input, [data-field-name="${firstField.name}"] textarea, [data-field-name="${firstField.name}"] [role="combobox"]`
          ) as HTMLElement;
          if (firstFieldElement) {
            firstFieldElement.focus();
          }
        }, 100);
      }
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

    const completedFields = section.fields.filter((field) => {
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
              {section.fields.map((field, fieldIndex) => (
                <ConsultationFormField
                  key={fieldIndex}
                  fieldConfig={field}
                  fieldIndex={fieldIndex}
                  value={
                    form.watch(
                      `specialty_data.${field.name}` as FieldPath<ConsultationFormValues>
                    ) as FieldValue
                  }
                  onChange={(value) =>
                    form.setValue(
                      `specialty_data.${field.name}` as FieldPath<ConsultationFormValues>,
                      value as never
                    )
                  }
                  expandedFields={expandedFields}
                  setExpandedFields={setExpandedFields}
                  isReadOnly={!canEditConsultation}
                />
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  // Loading states
  if (appointmentLoading || existingConsultationLoading || departmentInfoLoading) {
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
                          const hasContent = section.fields.some((field) => {
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
              departmentInfo={departmentInfo}
              previousConsultations={previousConsultations || []}
              recentPrescriptions={recentPrescriptions || []}
            />
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <ConsultationPreviewModal
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        form={form}
        patient={patient}
        appointment={appointment}
        specialtySections={specialtySections}
        departmentType={departmentType}
      />
    </div>
  );
};

export default Consultation;
