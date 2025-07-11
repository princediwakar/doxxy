import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form } from "@/components/ui/form";
import { Save, Eye, CheckCircle } from "lucide-react";
import { useConsultation, Appointment } from "@/hooks/useConsultation";
import { ConsultationHeader } from "./ConsultationHeader";
import { ConsultationFormSection } from "./ConsultationFormSection";
import { ConsultationPreview } from "./ConsultationPreview";

interface ConsultationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

export function ConsultationModal({ open, onOpenChange, appointment }: ConsultationModalProps) {
  const {
    form,
    onSubmit,
    doctorDetails,
    effectiveDepartmentType,
    currentSpecialtySections,
    currentSpecialtyFields,
    isPreviewMode,
    setIsPreviewMode,
    isConfirming,
    setIsConfirming,
    editedFields,
    autoSaveStatus,
    isLoadingConsultation,
    isLoadingDoctorDetails,
    isSaving,
    getAge,
    handleOpenChange,
    isCurrentUserSuperadminConsulting,
  } = useConsultation({ appointment, open });

  const isLoading = isLoadingConsultation || isLoadingDoctorDetails;
  const hasValidFields = currentSpecialtyFields && currentSpecialtyFields.length > 0;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => handleOpenChange(newOpen, onOpenChange)}>
      <DialogContent className="max-w-[90vw] sm:max-w-[960px] max-h-[90vh] flex flex-col p-0">
        <ConsultationHeader
          appointment={appointment}
          effectiveDepartmentType={effectiveDepartmentType}
          isCurrentUserSuperadminConsulting={isCurrentUserSuperadminConsulting}
          autoSaveStatus={autoSaveStatus}
          editedFields={editedFields}
          getAge={getAge}
        />

        <ScrollArea className="flex-1 px-4 py-3 sm:px-6 sm:py-4 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-6 text-muted-foreground text-xs sm:text-sm">
              Loading consultation data...
            </div>
          ) : !hasValidFields ? (
            <div className="text-center py-6 text-muted-foreground text-xs sm:text-sm">
              <div className="mb-4">
                No consultation fields available. 
                {!doctorDetails?.[0]?.department_name && (
                  <div className="mt-2 text-xs">
                    Doctor department not found. Using General consultation template.
                  </div>
                )}
              </div>
              <div className="text-left">
                <h3 className="font-semibold mb-2">Debug Information:</h3>
                <div className="text-xs space-y-1">
                  <div>Department: {effectiveDepartmentType}</div>
                  <div>Sections: {currentSpecialtySections?.length || 0}</div>
                  <div>Fields: {currentSpecialtyFields?.length || 0}</div>
                  <div>Doctor ID: {appointment?.doctor_id}</div>
                  <div>Doctor Details: {doctorDetails?.[0] ? 'Found' : 'Not Found'}</div>
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                >
                  Reload Consultation Form
                </Button>
              </div>
            </div>
          ) : isPreviewMode ? (
            <ConsultationPreview 
              data={form.getValues().specialty_data} 
              fieldConfigs={currentSpecialtyFields} 
            />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit((values) => onSubmit(values, false))} className="space-y-4">
                {currentSpecialtySections.map((section, index) => (
                  <ConsultationFormSection
                    key={section.title}
                    section={section}
                    index={index}
                    control={form.control}
                  />
                ))}
              </form>
            </Form>
          )}
        </ScrollArea>

        {/* Footer Actions */}
        {hasValidFields && (
          <DialogFooter className="px-4 py-3 sm:px-6 sm:py-4 border-t bg-background">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {isConfirming && (
                  <div className="text-sm text-muted-foreground">
                    Are you sure you want to complete this consultation?
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {isConfirming ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsConfirming(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => onSubmit(form.getValues(), false)}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isSaving ? "Completing..." : "Confirm Complete"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {isPreviewMode ? "Edit" : "Preview"}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onSubmit(form.getValues(), true)}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Draft"}
                    </Button>
                    
                    <Button
                      onClick={() => onSubmit(form.getValues(), false)}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Consultation
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}