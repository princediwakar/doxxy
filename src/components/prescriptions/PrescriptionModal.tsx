import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pill, Save } from "lucide-react";
import { usePrescription, Appointment } from "@/hooks/usePrescription";
import { AppointmentSelector, ManualSelectors, MedicationFields, NotesField } from "./PrescriptionForm";

interface PrescriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultationId: string | null;
  appointment: Appointment | null;
  doctorId: string | null;
  patientId: string | null;
  clinicId: string | null;
}

export function PrescriptionModal(props: PrescriptionModalProps) {
  const {
    form,
    fields,
    onSubmit,
    appointmentsForSelect,
    doctors,
    patients,
    selectedAppointment,
    selectedDoctor,
    selectedPatient,
    selectedAppointmentId,
    setSelectedAppointmentId,
    manualDoctorId,
    setManualDoctorId,
    manualPatientId,
    setManualPatientId,
    addMedication,
    removeMedication,
    handleMedicineSelect,
    handleOpenChange,
    isLoading,
    isSaving,
  } = usePrescription(props);

  const hasValidSelection = manualDoctorId && manualPatientId;

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Create Prescription
          </DialogTitle>
          <DialogDescription>
            Create a new prescription for your patient. You can link it to an existing appointment or create it manually.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          <div className="space-y-6 py-4">
            {/* Appointment Selection */}
            <AppointmentSelector
              appointmentsForSelect={appointmentsForSelect}
              selectedAppointmentId={selectedAppointmentId}
              setSelectedAppointmentId={setSelectedAppointmentId}
              selectedAppointment={selectedAppointment}
              isLoading={isLoading}
            />

            {/* Manual Doctor/Patient Selection */}
            {(!selectedAppointmentId || selectedAppointmentId === "none") && (
              <ManualSelectors
                doctors={doctors}
                patients={patients}
                manualDoctorId={manualDoctorId}
                setManualDoctorId={setManualDoctorId}
                manualPatientId={manualPatientId}
                setManualPatientId={setManualPatientId}
                selectedDoctor={selectedDoctor}
                selectedPatient={selectedPatient}
                isLoading={isLoading}
              />
            )}

            {/* Prescription Form */}
            {hasValidSelection && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Medication Fields */}
                  <MedicationFields
                    fields={fields}
                    control={form.control}
                    handleMedicineSelect={handleMedicineSelect}
                    removeMedication={removeMedication}
                    addMedication={addMedication}
                  />

                  {/* Notes Field */}
                  <NotesField control={form.control} />
                </form>
              </Form>
            )}

            {/* Selection Warning */}
            {!hasValidSelection && (
              <div className="text-center py-8 text-muted-foreground">
                <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  Please select an appointment or choose doctor and patient manually to create a prescription.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {hasValidSelection && (
          <DialogFooter className="border-t pt-4">
            <div className="flex justify-between w-full">
              <div className="text-sm text-muted-foreground">
                {selectedAppointment ? (
                  <>Prescription for {selectedAppointment.patient_name} by {selectedAppointment.doctor_name}</>
                ) : (
                  <>Prescription for {selectedPatient?.name} by {selectedDoctor?.name}</>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isSaving || !form.formState.isValid}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Prescription"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}